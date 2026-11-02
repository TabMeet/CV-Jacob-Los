// The library without a server: the same API as server/app.js, answered inside
// the browser. Books live in this browser's localStorage; genres, titles and the
// librarian use the offline helpers (no API key, no cost).

import { ApiError, readerToken, local } from '../api.js';
import { GENRES, isGenre, genreName } from '../../../shared/genres.js';
import { LIBRARIAN, CAT, LIBRARY } from '../../../shared/characters.js';
import * as offline from '../../../shared/fallback.js';
import { STARTER_BOOKS } from '../../../shared/starter-books.js';
import { cleanText, cleanTitle, wordCount, MIN_WORDS, MAX_CHARS } from '../../../shared/text.js';
import { FRIENDS_ROOM, addFriends, cleanFriendName, friendKey, friendsFile, publicFriend, readFriendsFile } from '../../../shared/friends.js';

const KEY = 'ql.local.library';
const FRIENDS_KEY = 'ql.local.friends'; // Friends of the Library: your followers' books
const PUBLIC = ({ id, title, genre, reads }) => ({ id, title, genre, reads });

function newId() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => (b % 36).toString(36)).join('').padEnd(10, '0').slice(0, 10);
}

function newKey() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function starterLibrary() {
  const now = Date.now();
  return {
    version: 1,
    books: STARTER_BOOKS.map((b, i) => ({
      id: newId(),
      title: b.title,
      genre: b.genre,
      body: b.body,
      summary: offline.summarise(b.body),
      themes: offline.themesOf(b.body),
      reads: 0,
      readers: [],
      namedByLibrary: false,
      deleteKey: null,
      createdAt: now - (STARTER_BOOKS.length - i) * 60_000,
    })),
  };
}

export function createLocalBackend({ latency = true } = {}) {
  let data = local.get(KEY, null);
  if (!data?.books) {
    data = starterLibrary();
    local.set(KEY, data);
  }
  const save = () => local.set(KEY, data);

  let friends = [];
  try {
    friends = readFriendsFile(local.get(FRIENDS_KEY, { friends: [] }));
  } catch {
    friends = [];
  }
  const publicFriends = () => friends.map(publicFriend);
  const saveFriends = () => {
    local.set(FRIENDS_KEY, { version: 1, friends });
    broadcast('friends', publicFriends());
  };
  const visible = () => data.books.filter((b) => !b.hidden);
  const find = (id) => visible().find((b) => b.id === id) ?? null;

  // Live updates, in-process.
  const listeners = new Set();
  const events = [];
  let zone = 'hall';
  let demoZones = {};
  let nextReply = null;

  const snapshot = () => {
    const zones = { ...demoZones };
    zones[zone] = (zones[zone] ?? 0) + 1;
    return { total: Object.values(zones).reduce((a, b) => a + b, 0), zones };
  };
  const broadcast = (type, payload) => {
    for (const h of listeners) setTimeout(() => h[type]?.(payload), 0);
  };
  const emit = (event) => {
    const e = { ...event, at: Date.now() };
    events.push(e);
    events.splice(0, Math.max(0, events.length - 40));
    broadcast('happening', e);
  };

  // A "store" for the offline librarian, over the books in this browser.
  const store = {
    random(n, { unreadFirst = false, genre = null } = {}) {
      let pool = visible().filter((b) => !genre || b.genre === genre);
      pool = pool.map((b) => ({ b, r: Math.random() }));
      pool.sort((x, y) => (unreadFirst ? x.b.reads - y.b.reads : 0) || x.r - y.r);
      return pool.slice(0, n).map((x) => PUBLIC(x.b));
    },
    search(words, n) {
      const terms = words.filter((w) => w.length > 2).slice(0, 8).map((w) => w.toLowerCase());
      if (!terms.length) return [];
      return visible()
        .map((b) => {
          let score = 0;
          for (const t of terms) {
            if (b.title.toLowerCase().includes(t)) score += 4;
            if (b.themes.join(' ').includes(t)) score += 3;
            if (b.summary.toLowerCase().includes(t)) score += 2;
            if (b.body.toLowerCase().includes(t)) score += 1;
          }
          return { b, score };
        })
        .filter((x) => x.score > 0)
        .sort((x, y) => y.score - x.score || x.b.reads - y.b.reads)
        .slice(0, n)
        .map((x) => PUBLIC(x.b));
    },
  };

  const fail = (status, error, message) => {
    throw new ApiError(status, { error, message });
  };

  function shelf(genre, { sort = 'popular', limit = 60, offset = 0 } = {}) {
    const order = {
      popular: (a, b) => b.reads - a.reads || b.createdAt - a.createdAt,
      new: (a, b) => b.createdAt - a.createdAt,
      unread: (a, b) => a.reads - b.reads || b.createdAt - a.createdAt,
    }[sort] ?? ((a, b) => b.reads - a.reads);
    return visible().filter((b) => b.genre === genre).sort(order).slice(offset, offset + limit).map(PUBLIC);
  }

  function totals() {
    const books = visible();
    return { books: books.length, reads: books.reduce((s, b) => s + b.reads, 0) };
  }

  const routes = [
    ['GET', /^\/api\/config$/, () => ({
      library: LIBRARY.name, librarian: LIBRARIAN.name, cat: CAT.name,
      genres: GENRES.map(({ id, name }) => ({ id, name })), ai: false, local: true, minWords: MIN_WORDS, maxChars: MAX_CHARS,
    })],
    ['GET', /^\/api\/shelves$/, () => ({
      shelves: GENRES.map(({ id, name }) => ({ id, name, count: visible().filter((b) => b.genre === id).length, books: shelf(id, { limit: 30 }) })),
      totals: totals(),
    })],
    ['GET', /^\/api\/shelves\/([a-z]+)$/, ([genre], { query }) => {
      if (!isGenre(genre)) fail(404, 'no-such-shelf');
      const sort = ['popular', 'new', 'unread'].includes(query.get('sort')) ? query.get('sort') : 'popular';
      const offset = Math.max(0, Number.parseInt(query.get('offset'), 10) || 0);
      return { genre, name: genreName(genre), sort, offset, total: visible().filter((b) => b.genre === genre).length, books: shelf(genre, { sort, limit: 48, offset }) };
    }],
    ['GET', /^\/api\/books\/(\w+)\/card$/, ([id]) => PUBLIC(find(id) ?? fail(404, 'not-on-the-shelves'))],
    ['GET', /^\/api\/books\/(\w+)$/, ([id]) => {
      const b = find(id) ?? fail(404, 'not-on-the-shelves');
      return { ...PUBLIC(b), body: b.body };
    }],
    ['POST', /^\/api\/books\/(\w+)\/read$/, ([id]) => {
      const b = find(id) ?? fail(404, 'not-on-the-shelves');
      const reader = readerToken();
      const firstTime = !b.readers.includes(reader);
      if (firstTime) {
        b.readers.push(reader);
        b.reads += 1;
        save();
      }
      emit({ type: 'opened', title: b.title, genre: b.genre, reads: b.reads, firstTime });
      return { reads: b.reads, firstTime };
    }],
    ['POST', /^\/api\/books\/(\w+)\/finish$/, ([id]) => {
      const b = find(id) ?? fail(404, 'not-on-the-shelves');
      emit({ type: 'finished', title: b.title, genre: b.genre, reads: b.reads });
      return { reads: b.reads };
    }],
    // In the local edition a report is only noted; nothing is taken down by one person.
    ['POST', /^\/api\/books\/(\w+)\/report$/, ([id]) => {
      const b = find(id) ?? fail(404, 'not-on-the-shelves');
      b.reported = true;
      save();
      return { ok: true };
    }],
    ['DELETE', /^\/api\/books\/(\w+)$/, ([id], { body }) => {
      const b = find(id);
      if (!b || !b.deleteKey || b.deleteKey !== body?.key) fail(403, 'not-yours');
      data.books = data.books.filter((x) => x.id !== id);
      save();
      return { ok: true };
    }],
    ['POST', /^\/api\/titles$/, async (_, { body }) => {
      const text = cleanText(body?.body);
      if (wordCount(text) < MIN_WORDS) fail(400, 'too-short', `Write a little more first — at least ${MIN_WORDS} words — and the library will think of a title.`);
      if (latency) await wait(600);
      return { titles: offline.guessTitles(text), by: 'offline' };
    }],
    ['POST', /^\/api\/books$/, async (_, { body }) => {
      const text = cleanText(body?.body);
      const ownTitle = cleanTitle(body?.title);
      const letLibraryName = Boolean(body?.letLibraryName) || !ownTitle;
      if (wordCount(text) < MIN_WORDS) fail(400, 'too-short', `A book needs at least ${MIN_WORDS} words, dear. Keep going.`);
      if (text.length > MAX_CHARS) fail(400, 'too-long', 'That’s longer than our binding machine can manage. Perhaps split it into volumes?');
      const mod = offline.basicModeration(text);
      if (!mod.accepted) fail(422, 'not-shelved', mod.reason);
      if (latency) await wait(1400);
      const book = {
        id: newId(),
        title: letLibraryName ? offline.guessTitles(text)[0] : ownTitle,
        genre: offline.guessGenre(text),
        body: text,
        summary: offline.summarise(text),
        themes: offline.themesOf(text),
        reads: 0,
        readers: [],
        namedByLibrary: letLibraryName,
        deleteKey: newKey(),
        createdAt: Date.now(),
      };
      data.books.push(book);
      save();
      emit({ type: 'shelved', title: book.title, genre: book.genre });
      return {
        book: { ...PUBLIC(book), shelf: genreName(book.genre) },
        deleteKey: book.deleteKey,
        namedByLibrary: letLibraryName,
        wellbeingConcern: offline.soundsLikeCrisis(text),
      };
    }],
    ['POST', /^\/api\/librarian$/, async (_, { body }) => {
      const message = String(body?.message ?? '').trim().slice(0, 800);
      if (!message) fail(400, 'empty');
      if (latency) await wait(700 + Math.random() * 600);
      let answer;
      if (nextReply) {
        // Studio: a line written in advance for filming. Books are still real ones.
        answer = { reply: nextReply.text, bookIds: nextReply.withBooks ? offline.offlineLibrarian(message, store).bookIds : [], walkTo: null };
        nextReply = null;
      } else {
        answer = offline.offlineLibrarian(message, store);
      }
      return { reply: answer.reply, books: answer.bookIds.map((id) => find(id)).filter(Boolean).map(PUBLIC), walkTo: answer.walkTo };
    }],
    ['POST', /^\/api\/presence$/, (_, { body }) => {
      if (typeof body?.zone === 'string') zone = body.zone;
      return snapshot();
    }],
    ['POST', /^\/api\/presence\/leave$/, () => ({})],
    ['GET', /^\/api\/friends$/, () => ({ room: FRIENDS_ROOM, friends: publicFriends() })],
  ];

  return {
    async request(path, { method = 'GET', body } = {}) {
      const url = new URL(path, 'http://local');
      for (const [m, pattern, handler] of routes) {
        if (m !== method) continue;
        const match = url.pathname.match(pattern);
        if (!match) continue;
        // Round-trip through JSON so callers never share objects with the store.
        const result = await handler(match.slice(1), { body, query: url.searchParams });
        return JSON.parse(JSON.stringify(result));
      }
      throw new ApiError(404, { error: 'not-found' });
    },

    connect(handlers) {
      listeners.add(handlers);
      setTimeout(() => {
        handlers.presence?.(snapshot());
        handlers.backlog?.(events.slice(-15));
      }, 0);
      return () => listeners.delete(handlers);
    },

    // -- Studio controls ------------------------------------------------------

    setDemoVisitors(zones) {
      demoZones = { ...zones };
      broadcast('presence', snapshot());
    },
    setNextReply(text, { withBooks = true } = {}) {
      nextReply = text ? { text, withBooks } : null;
    },
    notice(text) {
      emit({ type: 'custom', text });
    },
    // -- Friends of the Library (Studio only: the hosted library reads data/friends.json)

    friends: publicFriends,
    /** Adds names in order and returns the books that were new. */
    addFriends(names) {
      const result = addFriends(friends, names);
      if (!result.added.length) return [];
      friends = result.list;
      saveFriends();
      return result.added.map(publicFriend);
    },
    removeFriend(name) {
      const key = friendKey(cleanFriendName(name) ?? '');
      const before = friends.length;
      friends = friends.filter((f) => friendKey(f.name) !== key);
      if (friends.length === before) return false;
      saveFriends();
      return true;
    },
    emptyFriends() {
      friends = [];
      saveFriends();
    },
    exportFriends() {
      return friendsFile(friends);
    },
    /** Adds the names from a friends file (or a list of names) after the ones already here. */
    importFriends(content) {
      const result = addFriends(friends, readFriendsFile(content).map((f) => f.name));
      if (result.added.length) {
        friends = result.list;
        saveFriends();
      }
      return result.added.length;
    },

    exportBooks() {
      return {
        format: 'quiet-library-export',
        version: 1,
        exportedAt: new Date().toISOString(),
        books: visible().map(({ title, genre, body, namedByLibrary }) => ({ title, genre, body, namedByLibrary })),
      };
    },
    importBooks(file) {
      if (file?.format !== 'quiet-library-export' || !Array.isArray(file.books)) throw new Error('That file isn’t a Quiet Library export.');
      let added = 0;
      for (const raw of file.books) {
        const text = cleanText(raw.body);
        const title = cleanTitle(raw.title);
        if (!title || !isGenre(raw.genre) || wordCount(text) < MIN_WORDS) continue;
        data.books.push({
          id: newId(), title, genre: raw.genre, body: text, summary: offline.summarise(text), themes: offline.themesOf(text),
          reads: 0, readers: [], namedByLibrary: Boolean(raw.namedByLibrary), deleteKey: null, createdAt: Date.now(),
        });
        added++;
      }
      save();
      return added;
    },
    resetToStarter() {
      data = starterLibrary();
      save();
    },
    emptyShelves() {
      data = { version: 1, books: [] };
      save();
    },
    counts() {
      return { books: visible().length, yours: visible().filter((b) => b.deleteKey).length };
    },
  };
}
