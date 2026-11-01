// The local edition's in-browser backend, run under Node (no localStorage here,
// so it simply keeps everything in memory).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createLocalBackend } from '../public/js/local/backend.js';
import { ApiError } from '../public/js/api.js';
import { openLibraryDb } from '../server/db.js';
import { importExport } from '../server/seed.js';
import { offlineLibrarian } from '../shared/fallback.js';

const STORY = `Every Sunday my grandfather fed the pigeons in the square. After he died I kept going, because someone had to.
The pigeons did not notice he was gone. I found that strangely comforting.`;

describe('local edition backend', () => {
  test('opens with the starter stories on twelve shelves', async () => {
    const b = createLocalBackend({ latency: false });
    const config = await b.request('/api/config');
    assert.equal(config.local, true);
    assert.equal(config.ai, false);
    const { shelves, totals } = await b.request('/api/shelves');
    assert.equal(shelves.length, 12);
    assert.equal(totals.books, 12);
    assert.deepEqual(Object.keys(shelves[0].books[0]).sort(), ['genre', 'id', 'reads', 'title']);
  });

  test('writing, reading once per reader, and taking a book down', async () => {
    const b = createLocalBackend({ latency: false });
    await assert.rejects(b.request('/api/books', { method: 'POST', body: { body: 'too short' } }), (e) => e instanceof ApiError && e.status === 400);
    const made = await b.request('/api/books', { method: 'POST', body: { body: STORY, title: 'The Pigeons on Sunday' } });
    assert.equal(made.book.title, 'The Pigeons on Sunday');
    assert.ok(made.deleteKey);
    const id = made.book.id;
    assert.deepEqual(await b.request(`/api/books/${id}/read`, { method: 'POST' }), { reads: 1, firstTime: true });
    assert.deepEqual(await b.request(`/api/books/${id}/read`, { method: 'POST' }), { reads: 1, firstTime: false });
    assert.equal((await b.request(`/api/books/${id}`)).body, STORY);
    await assert.rejects(b.request(`/api/books/${id}`, { method: 'DELETE', body: { key: 'nope' } }), (e) => e.status === 403);
    await b.request(`/api/books/${id}`, { method: 'DELETE', body: { key: made.deleteKey } });
    await assert.rejects(b.request(`/api/books/${id}`), (e) => e.status === 404);
  });

  test('the library can name a book', async () => {
    const b = createLocalBackend({ latency: false });
    const made = await b.request('/api/books', { method: 'POST', body: { body: STORY, letLibraryName: true } });
    assert.equal(made.namedByLibrary, true);
    assert.ok(made.book.title.length > 2);
  });

  test('the librarian recommends real books, and can be given a line for filming', async () => {
    const b = createLocalBackend({ latency: false });
    const funny = await b.request('/api/librarian', { method: 'POST', body: { message: 'make me laugh' } });
    assert.ok(funny.books.length > 0);
    assert.ok(funny.books.every((x) => x.genre === 'humor'));

    b.setNextReply('Nobody comes in here by accident, dear.');
    const scripted = await b.request('/api/librarian', { method: 'POST', body: { message: 'I feel lonely' } });
    assert.equal(scripted.reply, 'Nobody comes in here by accident, dear.');
    const after = await b.request('/api/librarian', { method: 'POST', body: { message: 'I feel lonely' } });
    assert.notEqual(after.reply, scripted.reply, 'a scripted line is used once');
  });

  test('staged visitors and the cat hear about things', async () => {
    const b = createLocalBackend({ latency: false });
    const got = { presence: [], happening: [] };
    b.connect({ presence: (p) => got.presence.push(p), happening: (e) => got.happening.push(e), backlog: () => {} });
    b.setDemoVisitors({ reading: 2, 'shelf:poetry': 1 });
    await b.request('/api/presence', { method: 'POST', body: { zone: 'desk' } });
    b.notice('Someone just finished a story.');
    await new Promise((r) => setTimeout(r, 10));
    const snap = got.presence.at(-1);
    assert.equal(snap.zones.reading, 2);
    assert.equal(got.happening.at(-1).text, 'Someone just finished a story.');
    const presence = await b.request('/api/presence', { method: 'POST', body: { zone: 'desk' } });
    assert.equal(presence.total, 4);
  });

  test('exports books that the hosted library can import, with fresh read counts', async () => {
    const b = createLocalBackend({ latency: false });
    await b.request('/api/books', { method: 'POST', body: { body: STORY, title: 'The Pigeons on Sunday' } });
    const file = b.exportBooks();
    assert.equal(file.format, 'quiet-library-export');
    assert.equal(file.books.length, 13);
    assert.equal(file.books[0].reads, undefined, 'read counts are not exported');

    const db = openLibraryDb(':memory:');
    const result = importExport(db, JSON.parse(JSON.stringify(file)));
    assert.deepEqual(result, { added: 13, skipped: 0 });
    assert.equal(db.totals().reads, 0);
    assert.throws(() => importExport(db, { books: [] }), /not a Quiet Library export/);
    db.close();

    const other = createLocalBackend({ latency: false });
    other.emptyShelves();
    assert.equal(other.importBooks(file), 13);
  });
});

describe('the librarian without AI', () => {
  const store = {
    random: (n, opts = {}) => [{ id: 'a', genre: opts.genre ?? 'life', reads: 0 }].slice(0, n),
    search: () => [],
  };
  test('answers small talk in character', () => {
    assert.match(offlineLibrarian('who wrote this?', store).reply, /Nobody knows/);
    assert.match(offlineLibrarian('hello', store).reply, /Hello, dear/);
    assert.match(offlineLibrarian('tell me about the cat', store).reply, /window/);
  });
  test('responds to distress with care and a helpline', () => {
    assert.match(offlineLibrarian('I want to die', store).reply, /findahelpline\.com/);
  });
  test('matches moods to shelves', () => {
    assert.deepEqual(offlineLibrarian('something scary please', store).bookIds, ['a']);
  });
});
