// Storage for the library, using Node's built-in SQLite (no native add-ons needed).
//
// Privacy by design: nothing that identifies a writer or a reader is stored.
// Readers are only remembered as a salted hash of a random token their browser
// made up, so the same person opening a book twice counts once.

import { DatabaseSync } from 'node:sqlite';
import { randomBytes, createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const PUBLIC_FIELDS = 'id, title, genre, read_count AS reads';

export function hashToken(token, salt = '') {
  return createHash('sha256').update(`${salt}:${token}`).digest('hex');
}

function newId() {
  // 10 url-safe characters, e.g. "k3f9x0a1qz"
  return randomBytes(8).toString('base64url').replace(/[-_]/g, '').slice(0, 10).toLowerCase().padEnd(10, '0');
}

export function openLibraryDb(file = ':memory:', { reportThreshold = 3 } = {}) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS books (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      title_by_ai   INTEGER NOT NULL DEFAULT 0,
      body          TEXT NOT NULL,
      genre         TEXT NOT NULL,
      summary       TEXT NOT NULL DEFAULT '',
      themes        TEXT NOT NULL DEFAULT '[]',
      word_count    INTEGER NOT NULL DEFAULT 0,
      read_count    INTEGER NOT NULL DEFAULT 0,
      reports       INTEGER NOT NULL DEFAULT 0,
      hidden        INTEGER NOT NULL DEFAULT 0,
      delete_key    TEXT,
      created_at    INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS books_genre ON books (genre, hidden);
    CREATE TABLE IF NOT EXISTS reads (
      book_id     TEXT NOT NULL,
      reader      TEXT NOT NULL,
      PRIMARY KEY (book_id, reader)
    );
    CREATE TABLE IF NOT EXISTS reports (
      book_id     TEXT NOT NULL,
      reporter    TEXT NOT NULL,
      PRIMARY KEY (book_id, reporter)
    );
    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // A per-installation secret salt for hashing reader tokens.
  let salt = db.prepare('SELECT value FROM meta WHERE key = ?').get('salt')?.value;
  if (!salt) {
    salt = randomBytes(16).toString('hex');
    db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('salt', salt);
  }

  const q = {
    insert: db.prepare(`INSERT INTO books
      (id, title, title_by_ai, body, genre, summary, themes, word_count, delete_key, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
    get: db.prepare(`SELECT ${PUBLIC_FIELDS}, body FROM books WHERE id = ? AND hidden = 0`),
    getPublic: db.prepare(`SELECT ${PUBLIC_FIELDS} FROM books WHERE id = ? AND hidden = 0`),
    counts: db.prepare('SELECT genre, COUNT(*) AS n FROM books WHERE hidden = 0 GROUP BY genre'),
    totals: db.prepare('SELECT COUNT(*) AS books, COALESCE(SUM(read_count), 0) AS reads FROM books WHERE hidden = 0'),
    addRead: db.prepare('INSERT OR IGNORE INTO reads (book_id, reader) VALUES (?, ?)'),
    bumpRead: db.prepare('UPDATE books SET read_count = read_count + 1 WHERE id = ?'),
    readCount: db.prepare('SELECT read_count AS reads FROM books WHERE id = ?'),
    addReport: db.prepare('INSERT OR IGNORE INTO reports (book_id, reporter) VALUES (?, ?)'),
    bumpReport: db.prepare('UPDATE books SET reports = reports + 1, hidden = CASE WHEN reports + 1 >= ? THEN 1 ELSE hidden END WHERE id = ?'),
    deleteKey: db.prepare('SELECT delete_key FROM books WHERE id = ?'),
    remove: db.prepare('DELETE FROM books WHERE id = ?'),
    removeReads: db.prepare('DELETE FROM reads WHERE book_id = ?'),
    removeReports: db.prepare('DELETE FROM reports WHERE book_id = ?'),
    catalog: db.prepare(`SELECT id, title, genre, summary, themes, read_count AS reads
      FROM books WHERE hidden = 0 ORDER BY created_at DESC LIMIT ?`),
  };

  const SHELF_ORDER = {
    popular: 'read_count DESC, created_at DESC',
    new: 'created_at DESC',
    unread: 'read_count ASC, created_at DESC',
  };

  return {
    salt,

    addBook({ title, titleByAi = false, body, genre, summary = '', themes = [], deleteKey = null }) {
      const id = newId();
      const words = body.trim().split(/\s+/).filter(Boolean).length;
      q.insert.run(
        id, title, titleByAi ? 1 : 0, body, genre, summary, JSON.stringify(themes), words,
        deleteKey ? hashToken(deleteKey, salt) : null, Date.now(),
      );
      return q.getPublic.get(id);
    },

    getBook(id) {
      const row = q.get.get(id);
      return row ? { ...row } : null;
    },

    getPublic(id) {
      const row = q.getPublic.get(id);
      return row ? { ...row } : null;
    },

    shelf(genre, { sort = 'popular', limit = 60, offset = 0 } = {}) {
      const order = SHELF_ORDER[sort] ?? SHELF_ORDER.popular;
      const rows = db.prepare(`SELECT ${PUBLIC_FIELDS} FROM books
        WHERE genre = ? AND hidden = 0 ORDER BY ${order} LIMIT ? OFFSET ?`).all(genre, limit, offset);
      return rows.map((r) => ({ ...r }));
    },

    shelfCounts() {
      return Object.fromEntries(q.counts.all().map((r) => [r.genre, r.n]));
    },

    totals() {
      const t = q.totals.get();
      return { books: t.books, reads: t.reads };
    },

    /** Count a read once per (book, reader). Returns the new total and whether this reader is new. */
    recordRead(bookId, readerToken) {
      const reader = hashToken(readerToken, salt);
      const { changes } = q.addRead.run(bookId, reader);
      if (changes) q.bumpRead.run(bookId);
      return { reads: q.readCount.get(bookId)?.reads ?? 0, firstTime: changes > 0 };
    },

    report(bookId, reporterToken) {
      const reporter = hashToken(reporterToken, salt);
      const { changes } = q.addReport.run(bookId, reporter);
      if (changes) q.bumpReport.run(reportThreshold, bookId);
      return changes > 0;
    },

    deleteBook(id, deleteKey) {
      const row = q.deleteKey.get(id);
      if (!row || !row.delete_key || row.delete_key !== hashToken(deleteKey, salt)) return false;
      q.remove.run(id);
      q.removeReads.run(id);
      q.removeReports.run(id);
      return true;
    },

    /** What the librarian "remembers" about the collection: titles, shelves and private summaries. */
    catalog(limit = 400) {
      return q.catalog.all(limit).map((r) => ({ ...r, themes: safeJson(r.themes, []) }));
    },

    /** Plain keyword search, used when no AI is configured. */
    search(words, limit = 6) {
      const terms = words.filter((w) => w.length > 2).slice(0, 8);
      if (!terms.length) return [];
      const score = terms.map(() => `(CASE WHEN lower(title) LIKE ? THEN 4 ELSE 0 END
        + CASE WHEN lower(themes) LIKE ? THEN 3 ELSE 0 END
        + CASE WHEN lower(summary) LIKE ? THEN 2 ELSE 0 END
        + CASE WHEN lower(body) LIKE ? THEN 1 ELSE 0 END)`).join(' + ');
      const params = terms.flatMap((t) => Array(4).fill(`%${t.toLowerCase()}%`));
      const rows = db.prepare(`SELECT ${PUBLIC_FIELDS}, (${score}) AS score FROM books
        WHERE hidden = 0 AND score > 0 ORDER BY score DESC, read_count ASC LIMIT ?`).all(...params, limit);
      return rows.map(({ score, ...r }) => ({ ...r }));
    },

    random(limit = 3, { unreadFirst = false, genre = null } = {}) {
      const where = genre ? 'AND genre = ?' : '';
      const order = unreadFirst ? 'read_count ASC, RANDOM()' : 'RANDOM()';
      const rows = db.prepare(`SELECT ${PUBLIC_FIELDS} FROM books WHERE hidden = 0 ${where} ORDER BY ${order} LIMIT ?`)
        .all(...(genre ? [genre, limit] : [limit]));
      return rows.map((r) => ({ ...r }));
    },

    close() {
      db.close();
    },
  };
}

function safeJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}
