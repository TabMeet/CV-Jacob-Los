// TikTok #7: Friends of the Library, in 14.3 seconds. The hook, on frame 0:
// followers' books dropping onto a shelf one after another, names on the spines,
// each landing on a note, under "every follower gets their name in my library."
//
// For TikTok first: the library is something the creator fills, not a website
// the viewer visits, so there's no searching, no buttons and no "opening soon".
//
//   every follower gets their name in my library.  a bookcase up close, books dropping in
//   a whole room for my followers.                  the arch
//   the more of you, the fuller it gets.            the shelves filling up, glowing
//   this spine is waiting for your name.            one spine lifts off the shelf
//   and above the fire, a little reminder.          "you are not alone"
//   this shelf is saved for you. follow, and        the empty bookcase, then a book lands
//   I'll add your name.                             on it (and the loop starts again)
//
// The books are plain: no names or numbers on the spines, because the followers
// in it aren't real people. With a text file of real followers' names (one per line),
// their names and numbers go on their spines (any other book stays plain), and the
// 4th name is the one whose spine lifts off the shelf.
// Cut to the "friends" lo-fi preset (88 BPM: one beat = 0.682 s).
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-friends.wav 14.4 friends
//   node promo/make-tiktok-friends.cjs promo/lofi-friends.wav promo/quiet-library-friends.mp4 [names.txt]

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, kin, KIN_CSS, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-friends.mp4'), namesFile] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-friends.cjs <lofi-friends.wav> [out.mp4] [names.txt]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-friends-'));
const BEAT = 60 / 88;
const b = (beats) => beats * BEAT;
const LENGTH = b(21); // 14.32 s

// -- the names ---------------------------------------------------------------------
// Made-up handles, never shown: they only give the books their different widths.
// With real followers, pass a names file and their names go on the spines.
const FIRST = ['moonlit', 'cozy', 'quiet', 'rainy', 'paper', 'velvet', 'amber', 'willow', 'maple', 'sleepy', 'lantern', 'fern', 'honey', 'misty', 'chai', 'autumn', 'teacup', 'starry', 'linen', 'ember'];
const SECOND = ['pages', 'reader', 'bookworm', 'chapters', 'notes', 'shelf', 'tales', 'letters', 'poems', 'stories', 'nook', 'margins', 'ink', 'library', 'verses'];
const SEP = ['.', '_', ''];
function placeholders(n) {
  const out = [];
  for (let i = 0; out.length < n; i++) {
    const name = `@${FIRST[(i * 7) % FIRST.length]}${SEP[i % 3]}${SECOND[(i * 11 + Math.floor(i / FIRST.length)) % SECOND.length]}${i % 5 === 3 ? (i * 37) % 90 + 10 : ''}`;
    if (!out.includes(name)) out.push(name);
  }
  return out;
}
const TOTAL = 101; // 100 by the end of the "filling" shot, and one more for the ending
const FEATURED = 3; // index of the name whose spine lifts off the shelf (book no. 4, top row of Friends · I)
let NAMES = placeholders(TOTAL + 20);
let REAL = [];
if (namesFile) {
  REAL = fs.readFileSync(namesFile, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (REAL.length < TOTAL) console.warn(`! ${REAL.length} names in ${namesFile}; plain books fill the other ${TOTAL - REAL.length}.`);
  NAMES = [...REAL, ...NAMES.filter((n) => !REAL.includes(n))];
}
NAMES = NAMES.slice(0, TOTAL);
// Only real followers' names are ever shown; every other book has a plain spine.
const PLAIN_NAMES = NAMES.filter((n) => !REAL.includes(n));

// Books take 0.36 s to drop onto a shelf up close, ~0.45 s to glow in the hall:
// they're added that long before the note that marks them landing.
const DROP = 0.34;
const HOOK = Array.from({ length: 13 }, (_, k) => 0.02 + k * 0.15); // landing times, as in lofi.py
const FILL = Array.from({ length: 7 }, (_, k) => b(6) + 0.12 + k * 0.25);

const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v));
const easeOut = (t) => 1 - (1 - t) ** 3;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const tween = (g, t0, t1, a, c, fn = ease) => a + (c - a) * fn(clamp((g - t0) / (t1 - t0)));

const PLAIN = !REAL[FEATURED]; // the lifted spine is plain unless it's a real follower's
const SCENE_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  .friends-panel .close { display: none !important; }
  /* up close, just the bookcase standing in the room: no panel, heading, search or buttons */
  .tt-bare .friends-panel .shelf-head, .tt-bare .friends-panel .find-note, .tt-bare .friends-panel .shelf-more { display: none !important; }
  .tt-bare .friends-panel { background: transparent; box-shadow: none; }
  .tt-bare .friends-panel .case { min-height: 440px; } /* tall enough for two rows, so nothing jumps as it fills */
  .tt-spine .overlay { padding-top: 300px; } /* a full bookcase: its top row below the captions */
  /* plain spines: no name and no number */
  .spine.tt-plain .spine-title, .spine.tt-plain .spine-reads { visibility: hidden; }
`;

function pageSetup(plainNames) {
  const lib = window.__lib;
  // Any spine that isn't a real follower's stays plain, however often the bookcase is redrawn.
  const plain = new Set(plainNames);
  const mark = (root) => {
    for (const spine of [...(root.matches?.('.spine') ? [root] : []), ...(root.querySelectorAll?.('.spine') ?? [])]) {
      if (plain.has(spine.querySelector('.spine-title')?.textContent)) spine.classList.add('tt-plain');
    }
  };
  new MutationObserver((records) => records.forEach((r) => r.addedNodes.forEach((node) => node.nodeType === 1 && mark(node))))
    .observe(document.body, { childList: true, subtree: true });
  window.__setPresence = lib.hall.setPresence;
  lib.hall.setPresence = () => {};
  Element.prototype.scrollIntoView = function () {}; // keep the bookcase still while filming
  window.__kin = (html) => {
    for (const old of document.querySelectorAll('.tt-kin')) old.remove();
    if (html) document.body.insertAdjacentHTML('beforeend', html);
  };
  window.__settle = () => {
    for (const a of document.getAnimations()) {
      const t = a.effect?.getComputedTiming?.();
      if (t && Number.isFinite(t.endTime)) try { a.finish(); } catch { /* ignore */ }
    }
  };
  window.__frame = ({ hall, el }) => {
    if (hall) {
      lib.hall.teleport(hall.x);
      lib.hall.setCloseUp(hall.zoom, hall.focusY);
    }
    if (el) {
      const n = document.querySelector(el.sel);
      if (n) {
        n.style.transformOrigin = el.origin ?? '50% 50%';
        n.style.transform = `scale(${el.scale.toFixed(4)})`;
      }
    }
  };
}

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-02T22:10:00'),
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: false, time: 'night', rain: true, pace: 1, demo: 0 },
    // one book on the shelf before the first frame
    storage: { 'ql.local.friends': { version: 1, friends: [{ no: 1, name: NAMES[0], added: Date.parse('2026-11-01') }] } },
  });
  await page.addStyleTag({ content: KIN_CSS + SCENE_CSS });
  await page.evaluate(pageSetup, PLAIN_NAMES);

  const dir = path.join(WORK, 'frames');
  fs.mkdirSync(dir);
  let n = 0;
  const film = createFilm(page, async (buf) => {
    n++;
    fs.writeFileSync(path.join(dir, `${String(n).padStart(5, '0')}.jpg`), buf);
  });
  const js = (fn, arg) => page.evaluate(fn, arg);
  const say = (text, opts) => js((h) => window.__kin(h), text ? kin(text, opts) : null);
  const settle = () => js(() => window.__settle());
  const quietly = (ms) => page.clock.runFor(ms);
  const step = () => js(() => window.__stepAnimations(performance.now()));
  let added = 1;
  const addNext = (count = 1) => {
    const names = NAMES.slice(added, added + count);
    added += names.length;
    return js((list) => window.__lib.backend.addFriends(list), names);
  };

  async function cut(until, { setup, camera = () => ({}), events = [] }) {
    await settle();
    if (setup) await setup();
    const queue = [...events].sort((a, c) => a.at - c.at);
    while (n < Math.round(until * FPS)) {
      const g = n / FPS;
      while (queue.length && queue[0].at <= g) await queue.shift().run();
      const c = camera(g);
      await js((f) => window.__frame(f), { hall: c.hall ?? null, el: c.el ?? null });
      await film.shoot();
    }
  }

  const spot = (id) => js((s) => window.__lib.hall.spot(s).cx, id);
  const archX = (await spot('friends-sign')) + 245;
  const case1 = await spot('friends:0');
  const case2 = await spot('friends:1');
  const case3 = await spot('friends:2');
  const fireX = await js(() => window.__lib.hall.fireX);

  // 1 · the hook: books dropping onto the shelf, a note each, from the very first frame
  await cut(b(3), {
    setup: async () => {
      await js((x) => window.__lib.hall.teleport(x), case1); // the friends' room, blurred behind
      await js(() => document.body.classList.add('tt-bare'));
      await js(() => window.__lib.openFriendsCase(0));
      await quietly(900);
      await settle();
      await say('every follower|gets their name|*in my library.*', { step: 0 });
      await settle(); // the words are all there on frame 0
      // the books due to land in the first moments start falling before frame 0
      let t = -DROP - 0.01;
      for (const land of HOOK.filter((x) => x - DROP < 0)) {
        await quietly(Math.max(1, (land - DROP - t) * 1000));
        t = land - DROP;
        await addNext();
        await quietly(1);
        await step();
      }
      await quietly(Math.max(1, -t * 1000));
    },
    camera: (g) => ({ el: { sel: '.overlay', scale: tween(g, 0, b(3), 1.08, 1.12, easeOut), origin: '50% 26%' } }),
    events: HOOK.filter((x) => x - DROP >= 0).map((land) => ({ at: land - DROP, run: () => addNext() })),
  });

  // 2 · the arch
  await cut(b(6), {
    setup: async () => {
      await page.keyboard.press('Escape');
      await quietly(600);
    },
    camera: (g) => ({ hall: { x: archX, zoom: tween(g, b(3), b(6), 1.04, 1.16), focusY: 225 } }),
    events: [{ at: b(3), run: () => say('a whole room|*for my followers.*', { pos: 'mid', step: 0.05 }) }],
  });

  // 3 · the shelves filling up: the first bookcase full, the second filling as we get there
  await cut(b(9), {
    setup: async () => {
      await addNext(TOTAL - 1 - FILL.length * 6 - added); // up to 58 books, quietly
      await quietly(1800);
    },
    camera: (g) => ({ hall: { x: tween(g, b(6), b(9), case1 - 40, case2), zoom: 1.3, focusY: 290 } }),
    events: [
      { at: b(6), run: () => say('the more of you,|*the fuller it gets.*', { step: 0.05 }) },
      ...FILL.map((land) => ({ at: land - 0.3, run: () => addNext(6) })),
    ],
  });

  // 4 · one spine lifts off the shelf: a name, and its number
  let spineOrigin = '47% 46%';
  await cut(b(13), {
    setup: async () => {
      await js(() => document.body.classList.add('tt-spine'));
      await js(() => window.__lib.openFriendsCase(0));
      await quietly(900);
      spineOrigin = await js((i) => {
        const r = document.querySelectorAll('.friends-panel .spine')[i].getBoundingClientRect();
        return `${((r.x + r.width / 2) / innerWidth * 100).toFixed(1)}% ${((r.y + r.height / 2) / innerHeight * 100).toFixed(1)}%`;
      }, FEATURED);
    },
    camera: (g) => ({ el: { sel: '.overlay', scale: tween(g, b(9), b(13), 1.45, 1.6), origin: spineOrigin } }),
    events: [
      { at: b(9), run: () => say(PLAIN ? 'this spine is|*waiting for your name.*' : 'your name on the spine,|*your own number.*', { step: 0.05 }) },
      { at: b(9) + 0.05, run: () => js((i) => document.querySelectorAll('.friends-panel .spine')[i].classList.add('highlight'), FEATURED) },
    ],
  });

  // 6 · above the fire
  await cut(b(16), {
    setup: async () => {
      await page.keyboard.press('Escape');
      await js(() => document.body.classList.remove('tt-bare', 'tt-spine'));
      await quietly(600);
    },
    camera: (g) => ({ hall: { x: fireX, zoom: tween(g, b(13), b(16), 1.9, 2.15), focusY: 160 } }),
    events: [{ at: b(13), run: () => say('and above the fire,|*a little reminder.*', { step: 0.05 }) }],
  });

  // 7 · saved for you, then a book lands on it, and the loop starts again
  await cut(LENGTH, {
    camera: (g) => ({ hall: { x: case3 - 30, zoom: tween(g, b(16), LENGTH, 1.5, 1.66), focusY: 230 } }),
    events: [
      { at: b(16), run: () => say('this shelf is|*saved for you.*', { step: 0.05 }) },
      { at: b(18.5), run: () => say('*follow,* and|I’ll add *your name.*', { kicker: 'the quiet library', step: 0.06 }) },
      { at: b(20) - 0.45, run: () => addNext() },
    ],
  });

  await browser.close();
  assemble({ shots: [dir], transitions: [], audio, out, length: LENGTH, fadeIn: 0, fadeOut: 0, audioFadeOut: 0.05 });
  fs.rmSync(WORK, { recursive: true, force: true });
  console.log(`done: ${out} (${n} frames, ${added} books)`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
