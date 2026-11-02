import express from 'express';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { GENRES, isGenre, genreName } from '../shared/genres.js';
import { LIBRARIAN, CAT, LIBRARY } from '../shared/characters.js';
import * as realAi from './ai.js';
import { cleanText, cleanTitle, wordCount, timeOfDay, MIN_WORDS, MAX_CHARS } from '../shared/text.js';
import { FRIENDS_ROOM, publicFriend } from '../shared/friends.js';

const here = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(here, '..', 'public');
const SHARED_DIR = join(here, '..', 'shared');

const TOKEN = /^[a-z0-9-]{8,64}$/i;

/** A small in-memory sliding-window limiter. Keys are never stored on disk. */
function limiter(max, windowMs) {
  const hits = new Map();
  setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [k, times] of hits) {
      const kept = times.filter((t) => t > cutoff);
      if (kept.length) hits.set(k, kept);
      else hits.delete(k);
    }
  }, windowMs).unref();
  return (req, res, next) => {
    const key = req.ip ?? 'unknown';
    const cutoff = Date.now() - windowMs;
    const times = (hits.get(key) ?? []).filter((t) => t > cutoff);
    if (times.length >= max) {
      res.status(429).json({ error: 'slow-down', message: 'The library asks you to slow down a little, dear. Try again in a few minutes.' });
      return;
    }
    times.push(Date.now());
    hits.set(key, times);
    next();
  };
}

export function createApp({ db, presence, ai = realAi, limits = {}, friends = { list: () => [] } }) {
  const app = express();
  app.disable('x-powered-by');
  if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY);

  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    });
    next();
  });
  app.use(express.json({ limit: '256kb' }));
  app.use(express.static(PUBLIC_DIR, { extensions: ['html'], maxAge: '1h' }));
  // The one shared module the browser imports directly (the hall draws Friends of the Library with it).
  app.get('/shared/friends.js', (req, res) => res.sendFile(join(SHARED_DIR, 'friends.js'), { maxAge: '1h', headers: { 'Content-Type': 'text/javascript; charset=utf-8' } }));

  const writeLimit = limiter(limits.write ?? 6, 60 * 60 * 1000);
  const titleLimit = limiter(limits.titles ?? 20, 60 * 60 * 1000);
  const talkLimit = limiter(limits.talk ?? 40, 10 * 60 * 1000);
  const smallLimit = limiter(limits.small ?? 240, 10 * 60 * 1000);

  const readerOf = (req) => {
    const token = req.get('x-reader');
    return token && TOKEN.test(token) ? token : null;
  };

  const finishedOnce = new Set(); // "book:reader" pairs this process has already announced

  // -- The library itself ---------------------------------------------------

  app.get('/api/config', (req, res) => {
    res.json({
      library: LIBRARY.name,
      librarian: LIBRARIAN.name,
      cat: CAT.name,
      genres: GENRES.map(({ id, name }) => ({ id, name })),
      ai: ai.aiEnabled(),
      minWords: MIN_WORDS,
      maxChars: MAX_CHARS,
    });
  });

  // Everything the hall needs to draw its shelves: counts and the spines on display.
  app.get('/api/shelves', (req, res) => {
    const counts = db.shelfCounts();
    const shelves = GENRES.map(({ id, name }) => ({
      id,
      name,
      count: counts[id] ?? 0,
      books: db.shelf(id, { sort: 'popular', limit: 30 }),
    }));
    res.json({ shelves, totals: db.totals() });
  });

  app.get('/api/shelves/:genre', (req, res) => {
    const { genre } = req.params;
    if (!isGenre(genre)) return res.status(404).json({ error: 'no-such-shelf' });
    const sort = ['popular', 'new', 'unread'].includes(req.query.sort) ? req.query.sort : 'popular';
    const offset = Math.max(0, Number.parseInt(req.query.offset, 10) || 0);
    const books = db.shelf(genre, { sort, limit: 48, offset });
    res.json({ genre, name: genreName(genre), sort, offset, total: db.shelfCounts()[genre] ?? 0, books });
  });

  app.get('/api/books/:id', (req, res) => {
    const book = db.getBook(req.params.id);
    if (!book) return res.status(404).json({ error: 'not-on-the-shelves' });
    res.json(book);
  });

  // Just the title and read count, for writers checking on their own books.
  app.get('/api/books/:id/card', (req, res) => {
    const book = db.getPublic(req.params.id);
    if (!book) return res.status(404).json({ error: 'not-on-the-shelves' });
    res.json(book);
  });

  app.post('/api/books/:id/read', smallLimit, (req, res) => {
    const reader = readerOf(req);
    const book = db.getPublic(req.params.id);
    if (!book) return res.status(404).json({ error: 'not-on-the-shelves' });
    if (!reader) return res.status(400).json({ error: 'missing-reader' });
    const result = db.recordRead(book.id, reader);
    presence.emit({ type: 'opened', title: book.title, genre: book.genre, reads: result.reads, firstTime: result.firstTime });
    res.json(result);
  });

  app.post('/api/books/:id/finish', smallLimit, (req, res) => {
    const reader = readerOf(req);
    const book = db.getPublic(req.params.id);
    if (!book) return res.status(404).json({ error: 'not-on-the-shelves' });
    const key = `${book.id}:${reader}`;
    if (reader && !finishedOnce.has(key)) {
      finishedOnce.add(key);
      presence.emit({ type: 'finished', title: book.title, genre: book.genre, reads: book.reads });
    }
    res.json({ reads: book.reads });
  });

  app.post('/api/books/:id/report', smallLimit, (req, res) => {
    const reader = readerOf(req);
    if (!reader) return res.status(400).json({ error: 'missing-reader' });
    if (!db.getPublic(req.params.id)) return res.status(404).json({ error: 'not-on-the-shelves' });
    db.report(req.params.id, reader);
    res.json({ ok: true });
  });

  app.delete('/api/books/:id', smallLimit, (req, res) => {
    const key = String(req.body?.key ?? '');
    if (!TOKEN.test(key)) return res.status(400).json({ error: 'missing-key' });
    if (!db.deleteBook(req.params.id, key)) return res.status(403).json({ error: 'not-yours' });
    res.json({ ok: true });
  });

  // -- The writing rooms ----------------------------------------------------

  app.post('/api/titles', titleLimit, async (req, res) => {
    const body = cleanText(req.body?.body);
    if (wordCount(body) < MIN_WORDS) {
      return res.status(400).json({ error: 'too-short', message: `Write a little more first — at least ${MIN_WORDS} words — and the library will think of a title.` });
    }
    res.json(await ai.suggestTitles(body.slice(0, MAX_CHARS)));
  });

  app.post('/api/books', writeLimit, async (req, res) => {
    const body = cleanText(req.body?.body);
    const ownTitle = cleanTitle(req.body?.title);
    const letLibraryName = Boolean(req.body?.letLibraryName) || !ownTitle;

    if (wordCount(body) < MIN_WORDS) {
      return res.status(400).json({ error: 'too-short', message: `A book needs at least ${MIN_WORDS} words, dear. Keep going.` });
    }
    if (body.length > MAX_CHARS) {
      return res.status(400).json({ error: 'too-long', message: `That's longer than our binding machine can manage (${MAX_CHARS.toLocaleString('en')} characters). Perhaps split it into volumes?` });
    }

    const card = await ai.catalogue(body, { title: letLibraryName ? '' : ownTitle });
    if (!card.accepted) {
      return res.status(422).json({
        error: 'not-shelved',
        message: card.reason || 'I’m sorry, dear, but I can’t put this one on the shelves.',
      });
    }

    const title = letLibraryName ? card.titles[0] : ownTitle;
    const deleteKey = randomBytes(18).toString('base64url').replace(/[-_]/g, 'x');
    const book = db.addBook({
      title,
      titleByAi: letLibraryName,
      body,
      genre: card.genre,
      summary: card.summary,
      themes: card.themes,
      deleteKey,
    });
    presence.emit({ type: 'shelved', title: book.title, genre: book.genre });
    res.status(201).json({
      book: { ...book, shelf: genreName(book.genre) },
      deleteKey,
      namedByLibrary: letLibraryName,
      wellbeingConcern: card.wellbeingConcern,
    });
  });

  // -- The front desk -------------------------------------------------------

  app.post('/api/librarian', talkLimit, async (req, res) => {
    const message = String(req.body?.message ?? '').trim().slice(0, 800);
    if (!message) return res.status(400).json({ error: 'empty' });
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-8) : [];
    const answer = await ai.askLibrarian(message, history, db.catalog(), {
      timeOfDay: timeOfDay(req.body?.hour),
      db,
    });
    const books = answer.bookIds.map((id) => db.getPublic(id)).filter(Boolean);
    res.json({ reply: answer.reply, books, walkTo: answer.walkTo });
  });

  // -- Presence: who else is here, and what the cat sees --------------------

  app.post('/api/presence', smallLimit, (req, res) => {
    const ok = presence.touch(req.body?.sid, req.body?.zone);
    res.status(ok ? 200 : 400).json(ok ? presence.snapshot() : { error: 'bad-presence' });
  });

  app.post('/api/presence/leave', (req, res) => {
    // Sent with navigator.sendBeacon, which posts text/plain.
    let sid = req.body?.sid;
    if (!sid && typeof req.body === 'string') sid = req.body;
    if (sid) presence.leave(String(sid));
    res.status(204).end();
  });

  app.get('/api/events', (req, res) => presence.subscribe(req, res));

  // Friends of the Library: the followers' books in the room at the back.
  app.get('/api/friends', (req, res) => {
    res.json({ room: FRIENDS_ROOM, friends: friends.list().map(publicFriend) });
  });

  app.get('/healthz', (req, res) => res.json({ ok: true }));

  app.use('/api', (req, res) => res.status(404).json({ error: 'not-found' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'bad-json' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'too-large' });
    console.error('[library]', err);
    res.status(500).json({ error: 'oops', message: 'Something fell off a shelf. Please try again.' });
  });

  return app;
}
