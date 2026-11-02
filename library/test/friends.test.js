// Friends of the Library: the room at the back where every follower gets a book.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  cleanFriendName, parseFriendNames, addFriends, readFriendsFile, friendsFile, caseCount, caseOf, friendsOnCase, roman, PER_CASE, MIN_CASES,
} from '../shared/friends.js';
import { createLocalBackend } from '../public/js/local/backend.js';
import { openLibraryDb } from '../server/db.js';
import { createPresence } from '../server/presence.js';
import { createApp } from '../server/app.js';
import { createFriendsFile } from '../server/friends.js';

describe('friends of the library: names and numbers', () => {
  test('names are tidied, list markers and odd characters removed', () => {
    assert.equal(cleanFriendName('  @cozy_reader  '), '@cozy_reader');
    assert.equal(cleanFriendName('- Anna B'), 'Anna B');
    assert.equal(cleanFriendName('12. @moonlit.pages'), '@moonlit.pages');
    assert.equal(cleanFriendName('• tea​ lover'), 'tea lover');
    assert.equal(cleanFriendName('   '), null);
    assert.equal([...cleanFriendName('x'.repeat(80))].length, 40);
  });

  test('a pasted list becomes books in order, skipping names already there', () => {
    const first = addFriends([], parseFriendNames('@one\n\n@two\n- @three\n'), 1000);
    assert.deepEqual(first.added.map((f) => [f.no, f.name]), [[1, '@one'], [2, '@two'], [3, '@three']]);
    const second = addFriends(first.list, ['@TWO', 'two', '@four'], 2000);
    assert.deepEqual(second.added.map((f) => [f.no, f.name]), [[4, '@four']]);
    // numbers keep counting up after a book is taken off the shelf
    const third = addFriends(second.list.filter((f) => f.no !== 4), ['@five']);
    assert.equal(third.added[0].no, 4);
    const fourth = addFriends(second.list.filter((f) => f.no !== 2), ['@five']);
    assert.equal(fourth.added[0].no, 5);
  });

  test('reads the Studio file, a plain list, or one name per line', () => {
    const { list } = addFriends([], ['@a', '@b'], Date.parse('2026-11-02'));
    const back = readFriendsFile(JSON.stringify(friendsFile(list)));
    assert.deepEqual(back.map((f) => [f.no, f.name]), [[1, '@a'], [2, '@b']]);
    assert.equal(back[0].added, Date.parse('2026-11-02'));
    assert.deepEqual(readFriendsFile(['@x', '@x', 'y']).map((f) => f.name), ['@x', 'y']);
    assert.deepEqual(readFriendsFile('@p\n@q\n').map((f) => [f.no, f.name]), [[1, '@p'], [2, '@q']]);
    assert.throws(() => readFriendsFile({ books: [] }), /No friends/);
  });

  test('the room has at least six bookcases and always one with space', () => {
    assert.equal(caseCount(0), MIN_CASES);
    assert.equal(caseCount(PER_CASE * MIN_CASES - 1), MIN_CASES);
    assert.equal(caseCount(PER_CASE * MIN_CASES), MIN_CASES + 1);
    const friends = Array.from({ length: 130 }, (_, i) => ({ no: i + 1, name: `f${i}` }));
    assert.equal(friendsOnCase(friends, 0, 6)[0].no, 1);
    assert.equal(friendsOnCase(friends, 2, 6).length, 30);
    assert.equal(friendsOnCase(friends, 3, 6).length, 0);
    // the last bookcase takes any overflow
    assert.equal(friendsOnCase(friends, 1, 2).length, 80);
    assert.equal(caseOf(129, 2), 1);
    assert.equal(roman(6), 'VI');
    assert.equal(roman(14), 'XIV');
  });
});

describe('friends of the library: local edition', () => {
  test('the Studio adds, removes, exports and imports, and the hall hears about it', async () => {
    const backend = createLocalBackend({ latency: false });
    backend.emptyFriends();
    const heard = [];
    backend.connect({ friends: (list) => heard.push(list.length) });

    assert.deepEqual((await backend.request('/api/friends')).friends, []);
    const added = backend.addFriends(['@ink_fan', '@wren_fan', '@ink_fan']);
    assert.deepEqual(added.map((f) => [f.id, f.no, f.name]), [['friend-1', 1, '@ink_fan'], ['friend-2', 2, '@wren_fan']]);
    const res = await backend.request('/api/friends');
    assert.equal(res.room, 'Friends of the Library');
    assert.deepEqual(res.friends.map((f) => f.name), ['@ink_fan', '@wren_fan']);

    assert.equal(backend.removeFriend('ink_fan'), true);
    assert.equal(backend.removeFriend('@nobody'), false);
    const file = backend.exportFriends();
    assert.equal(file.format, 'quiet-library-friends');
    assert.equal(backend.importFriends('@new_one\n@wren_fan'), 1);
    assert.deepEqual(backend.friends().map((f) => [f.no, f.name]), [[2, '@wren_fan'], [3, '@new_one']]);

    await new Promise((r) => setTimeout(r, 10));
    assert.deepEqual(heard.slice(-3), [2, 1, 2]);
  });
});

describe('friends of the library: hosted', () => {
  test('serves data/friends.json and re-reads it when it changes', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ql-friends-'));
    const file = join(dir, 'friends.json');
    const db = openLibraryDb(':memory:');
    const presence = createPresence();
    const app = createApp({ db, presence, friends: createFriendsFile([file, join(dir, 'friends.txt')]) });
    const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
    const get = async (path) => (await fetch(`http://127.0.0.1:${server.address().port}${path}`)).json();
    try {
      assert.deepEqual((await get('/api/friends')).friends, []);
      writeFileSync(file, JSON.stringify(friendsFile([{ no: 1, name: '@first', added: Date.parse('2026-11-02') }])));
      assert.deepEqual((await get('/api/friends')).friends, [{ id: 'friend-1', no: 1, name: '@first', added: Date.parse('2026-11-02') }]);
      writeFileSync(file, JSON.stringify(['@first', '@second', '<script>']));
      const names = (await get('/api/friends')).friends.map((f) => f.name);
      assert.deepEqual(names, ['@first', '@second', '<script>']); // stored as text, drawn with textContent / esc()
      rmSync(file);
      writeFileSync(join(dir, 'friends.txt'), '@from_text\n');
      assert.deepEqual((await get('/api/friends')).friends.map((f) => f.name), ['@from_text']);
      assert.equal(presence.touch('visitor-aaaa-1111', 'friends'), true);
      // the browser imports the shared rules directly on the hosted library
      const mod = await fetch(`http://127.0.0.1:${server.address().port}/shared/friends.js`);
      assert.equal(mod.status, 200);
      assert.match(mod.headers.get('content-type'), /javascript/);
      assert.equal((await fetch(`http://127.0.0.1:${server.address().port}/shared/genres.js`)).status, 404);
    } finally {
      presence.close();
      server.close();
      db.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
