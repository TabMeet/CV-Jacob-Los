import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { openLibraryDb } from '../server/db.js';
import { createPresence } from '../server/presence.js';
import { createApp } from '../server/app.js';
import { guessGenre, guessTitles, basicModeration, soundsLikeCrisis, genreFromRequest } from '../shared/fallback.js';
import { seed, STARTER_BOOKS } from '../server/seed.js';

const STORY = `The first winter after I moved to the city, I didn't know a single person.
I used to walk to the bakery on the corner every morning just so someone would say good morning to me.`;

// A stand-in for the Claude helpers, so tests never call the network.
function fakeAi(overrides = {}) {
  return {
    aiEnabled: () => false,
    catalogue: async () => ({
      genre: 'life', titles: ['The Bakery on the Corner', 'Good Morning', 'Noticed'], summary: 'A lonely winter.',
      themes: ['loneliness'], accepted: true, reason: '', wellbeingConcern: false, by: 'fake',
    }),
    suggestTitles: async () => ({ titles: ['One', 'Two', 'Three'], by: 'fake' }),
    askLibrarian: async (message, history, catalog) => ({ reply: 'Here you are, dear.', bookIds: catalog.slice(0, 2).map((b) => b.id), walkTo: null }),
    ...overrides,
  };
}

async function startServer(ai = fakeAi()) {
  const db = openLibraryDb(':memory:');
  const presence = createPresence();
  const app = createApp({ db, presence, ai, limits: { write: 100, titles: 100, talk: 100, small: 1000 } });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (path, { method = 'GET', body, reader = 'reader-aaaa-1111' } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Reader': reader },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, body: await res.json().catch(() => null) };
  };
  return { db, presence, server, call, close: () => { presence.close(); server.close(); db.close(); } };
}

describe('offline helpers', () => {
  test('recognise a poem by its short lines', () => {
    assert.equal(guessGenre('Two mugs on the shelf\nOne of them is mine\nThe kettle sings at dawn\nThe light comes anyway\nIt is kind'), 'poetry');
  });
  test('recognise a letter', () => {
    assert.equal(guessGenre('Dear you,\n\nI hope this finds you well. I wanted to say thank you for everything you did for me.'), 'letters');
  });
  test('recognise fantasy and sci-fi words', () => {
    assert.equal(guessGenre('The dragon circled the kingdom while the wizard cast a spell over the enchanted sword.'), 'fantasy');
    assert.equal(guessGenre('The starship left orbit; the android watched the planet shrink into the galaxy.'), 'scifi');
  });
  test('titles are short and not empty', () => {
    const titles = guessTitles(STORY);
    assert.ok(titles.length >= 1 && titles.length <= 3);
    for (const t of titles) assert.ok(t.length > 2 && t.split(' ').length <= 6, t);
  });
  test('basic moderation turns away link spam and gibberish', () => {
    assert.equal(basicModeration('buy now http://a.com http://b.com www.c.com cheap').accepted, false);
    assert.equal(basicModeration('aaaaaaaaaaaaaaaaaaaaaaaaaa').accepted, false);
    assert.equal(basicModeration(STORY).accepted, true);
  });
  test('notices crisis language', () => {
    assert.equal(soundsLikeCrisis('some days I want to die'), true);
    assert.equal(soundsLikeCrisis('the plant died in winter'), false);
  });
  test('maps moods to shelves', () => {
    assert.equal(genreFromRequest('make me laugh'), 'humor');
    assert.equal(genreFromRequest('something scary'), 'horror');
  });
});

describe('the database', () => {
  test('counts each reader once per book', () => {
    const db = openLibraryDb(':memory:');
    const book = db.addBook({ title: 'T', body: STORY, genre: 'life' });
    assert.deepEqual(db.recordRead(book.id, 'reader-1'), { reads: 1, firstTime: true });
    assert.deepEqual(db.recordRead(book.id, 'reader-1'), { reads: 1, firstTime: false });
    assert.deepEqual(db.recordRead(book.id, 'reader-2'), { reads: 2, firstTime: true });
    db.close();
  });

  test('hides a book after enough different readers report it', () => {
    const db = openLibraryDb(':memory:', { reportThreshold: 2 });
    const book = db.addBook({ title: 'T', body: STORY, genre: 'life' });
    db.report(book.id, 'r1');
    db.report(book.id, 'r1'); // same reader twice counts once
    assert.ok(db.getBook(book.id));
    db.report(book.id, 'r2');
    assert.equal(db.getBook(book.id), null);
    db.close();
  });

  test('only the writer (with the key) can remove a book', () => {
    const db = openLibraryDb(':memory:');
    const book = db.addBook({ title: 'T', body: STORY, genre: 'life', deleteKey: 'secret-key-123' });
    assert.equal(db.deleteBook(book.id, 'wrong-key-1234'), false);
    assert.equal(db.deleteBook(book.id, 'secret-key-123'), true);
    assert.equal(db.getBook(book.id), null);
    db.close();
  });

  test('never exposes private fields on public listings', () => {
    const db = openLibraryDb(':memory:');
    db.addBook({ title: 'T', body: STORY, genre: 'life', summary: 'secret note', deleteKey: 'secret-key-123' });
    const [b] = db.shelf('life');
    assert.deepEqual(Object.keys(b).sort(), ['genre', 'id', 'reads', 'title']);
    db.close();
  });

  test('seeds one starter book per shelf, once', () => {
    const db = openLibraryDb(':memory:');
    assert.equal(seed(db), STARTER_BOOKS.length);
    assert.equal(seed(db), 0);
    assert.equal(Object.keys(db.shelfCounts()).length, 12);
    db.close();
  });
});

describe('the API', () => {
  let lib;
  before(async () => {
    lib = await startServer();
    seed(lib.db);
  });
  after(() => lib.close());

  test('config lists the shelves and residents', async () => {
    const { status, body } = await lib.call('/api/config');
    assert.equal(status, 200);
    assert.equal(body.genres.length, 12);
    assert.equal(typeof body.librarian, 'string');
    assert.equal(typeof body.cat, 'string');
  });

  test('shelves show titles and read counts only', async () => {
    const { body } = await lib.call('/api/shelves');
    const book = body.shelves[0].books[0];
    assert.deepEqual(Object.keys(book).sort(), ['genre', 'id', 'reads', 'title']);
    const one = await lib.call(`/api/shelves/${body.shelves[0].id}?sort=unread`);
    assert.equal(one.status, 200);
    assert.equal((await lib.call('/api/shelves/nonsense')).status, 404);
  });

  test('writing a book: catalogued, shelved, readable, counted, removable', async () => {
    const short = await lib.call('/api/books', { method: 'POST', body: { body: 'too short' } });
    assert.equal(short.status, 400);

    const made = await lib.call('/api/books', { method: 'POST', body: { body: STORY, letLibraryName: true } });
    assert.equal(made.status, 201);
    assert.equal(made.body.book.title, 'The Bakery on the Corner');
    assert.equal(made.body.book.genre, 'life');
    assert.equal(made.body.book.reads, 0);
    assert.ok(made.body.deleteKey);

    const own = await lib.call('/api/books', { method: 'POST', body: { body: STORY, title: '  My own   title ' } });
    assert.equal(own.body.book.title, 'My own title');
    assert.equal(own.body.namedByLibrary, false);

    const id = made.body.book.id;
    const read = await lib.call(`/api/books/${id}`);
    assert.equal(read.body.body, STORY);
    assert.equal(read.body.summary, undefined, 'the private note stays private');

    assert.deepEqual((await lib.call(`/api/books/${id}/read`, { method: 'POST', reader: 'reader-aaaa-1111' })).body, { reads: 1, firstTime: true });
    assert.deepEqual((await lib.call(`/api/books/${id}/read`, { method: 'POST', reader: 'reader-aaaa-1111' })).body, { reads: 1, firstTime: false });
    assert.deepEqual((await lib.call(`/api/books/${id}/read`, { method: 'POST', reader: 'reader-bbbb-2222' })).body, { reads: 2, firstTime: true });
    assert.equal((await lib.call(`/api/books/${id}/card`)).body.reads, 2);

    assert.equal((await lib.call(`/api/books/${id}`, { method: 'DELETE', body: { key: 'not-the-right-key' } })).status, 403);
    assert.equal((await lib.call(`/api/books/${id}`, { method: 'DELETE', body: { key: made.body.deleteKey } })).status, 200);
    assert.equal((await lib.call(`/api/books/${id}`)).status, 404);
  });

  test('a manuscript the library cannot shelve is returned with a kind reason', async () => {
    const strict = await startServer(fakeAi({
      catalogue: async () => ({ genre: 'life', titles: ['x'], summary: '', themes: [], accepted: false, reason: 'Please leave out the address, dear.', wellbeingConcern: false }),
    }));
    const res = await strict.call('/api/books', { method: 'POST', body: { body: STORY } });
    assert.equal(res.status, 422);
    assert.equal(res.body.message, 'Please leave out the address, dear.');
    strict.close();
  });

  test('the librarian only recommends books that exist', async () => {
    const res = await lib.call('/api/librarian', { method: 'POST', body: { message: 'something comforting', history: [] } });
    assert.equal(res.status, 200);
    assert.equal(res.body.reply, 'Here you are, dear.');
    assert.ok(res.body.books.length > 0);
    for (const b of res.body.books) assert.ok(b.id && b.title);
  });

  test('presence counts visitors by where they stand', async () => {
    assert.equal((await lib.call('/api/presence', { method: 'POST', body: { sid: 'session-one-1', zone: 'shelf:poetry' } })).status, 200);
    const res = await lib.call('/api/presence', { method: 'POST', body: { sid: 'session-two-2', zone: 'reading' } });
    assert.equal(res.body.zones['shelf:poetry'], 1);
    assert.equal(res.body.zones.reading, 1);
    assert.equal((await lib.call('/api/presence', { method: 'POST', body: { sid: 'x', zone: 'roof' } })).status, 400);
  });

  test('the cat hears about new books', async () => {
    const before = lib.presence.recent().length;
    await lib.call('/api/books', { method: 'POST', body: { body: STORY, letLibraryName: true } });
    const events = lib.presence.recent();
    assert.ok(events.length > before);
    assert.equal(events.at(-1).type, 'shelved');
  });

  test('pages are served with a strict content security policy', async () => {
    const res = await fetch(`http://127.0.0.1:${lib.server.address().port}/`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-security-policy'), /script-src 'self'/);
    assert.match(await res.text(), /The Quiet Library/);
  });
});
