// TikTok #7: Friends of the Library, in 14.3 seconds. The hook, on frame 0:
// followers' books dropping onto a shelf one after another, names on the spines,
// each landing on a note, under "every follower gets a book on these shelves."
//
//   every follower gets a book on these shelves.   a bookcase up close, books dropping in
//   a whole room for my followers.                  the arch
//   the more of you, the fuller it gets.            the shelves filling up, glowing
//   look for your name.                             typing a name into the search box
//   your own book, your own number.                 the book, taken off the shelf
//   and above the fire, a little reminder.          "you are not alone"
//   this shelf is saved for you. follow, and        the empty bookcase, then a book lands
//   you're next.                                    on it (and the loop starts again)
//
// The names are placeholders unless you pass a text file of real ones (one per
// line, ideally 100 or more; placeholders fill any gap). The 51st name is the
// one that gets searched for and taken off the shelf.
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
// Made-up handles. They're placeholders: with real followers, pass a names file.
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
const SEARCHED = 50; // index of the name that's looked for (book no. 51, first on Friends · II)
let NAMES = placeholders(TOTAL + 20);
NAMES.splice(SEARCHED, 0, '@your.name.here');
if (namesFile) {
  const real = fs.readFileSync(namesFile, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (real.length < TOTAL) console.warn(`! ${real.length} names in ${namesFile}; placeholders fill the other ${TOTAL - real.length}.`);
  NAMES = [...real, ...NAMES.filter((n) => !real.includes(n))];
}
NAMES = NAMES.slice(0, TOTAL);
const SEARCH_FOR = NAMES[SEARCHED].replace(/^@/, '').slice(0, 4);

// Books take 0.36 s to drop onto a shelf up close, ~0.45 s to glow in the hall:
// they're added that long before the note that marks them landing.
const DROP = 0.34;
const HOOK = Array.from({ length: 13 }, (_, k) => 0.02 + k * 0.15); // landing times, as in lofi.py
const FILL = Array.from({ length: 7 }, (_, k) => b(6) + 0.12 + k * 0.25);

const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v));
const easeOut = (t) => 1 - (1 - t) ** 3;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const tween = (g, t0, t1, a, c, fn = ease) => a + (c - a) * fn(clamp((g - t0) / (t1 - t0)));

const SCENE_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  .friends-panel .close { display: none !important; }
  /* the hook: just the bookcase, already tall enough for two rows so nothing jumps as it fills */
  .tt-bare .friends-panel .shelf-head, .tt-bare .friends-panel .find-note, .tt-bare .friends-panel .shelf-more { display: none !important; }
  .tt-bare .friends-panel .case { min-height: 440px; }
  /* the search: the box and the bookcase, without the heading the captions would cover */
  .tt-search .friends-panel .shelf-head > div:first-child, .tt-search .friends-panel .shelf-more { display: none !important; }
  .tt-search .overlay { padding-top: 236px; } /* a full bookcase: start it below the captions */
`;

function pageSetup() {
  const lib = window.__lib;
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
  await page.evaluate(pageSetup);

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
      await js(() => document.body.classList.add('tt-bare'));
      await js(() => window.__lib.openFriendsCase(0));
      await quietly(900);
      await settle();
      await say('every follower|gets a book|*on these shelves.*', { step: 0 });
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
      await js(() => document.body.classList.remove('tt-bare'));
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

  // 4 · look for your name
  await cut(b(11), {
    setup: async () => {
      await js(() => document.body.classList.add('tt-search'));
      await js(() => window.__lib.openFriendsCase(1));
      await quietly(900);
      await js(() => document.querySelector('.friends-panel .find input').focus());
    },
    camera: (g) => ({ el: { sel: '.overlay', scale: tween(g, b(9), b(11), 1.1, 1.16), origin: '30% 25%' } }),
    events: [
      { at: b(9), run: () => say('look for|*your name.*', { step: 0.05 }) },
      ...[...SEARCH_FOR].map((ch, k) => ({ at: b(9) + 0.12 + k * 2 / FPS, run: () => page.keyboard.type(ch) })),
      { at: b(9) + 0.55, run: () => page.keyboard.press('Enter') },
    ],
  });

  // 5 · your own book, your own number
  await cut(b(13), {
    setup: async () => {
      await js(() => document.querySelector('.friends-panel .spine.highlight').click());
      await quietly(300);
    },
    camera: (g) => ({ el: { sel: '.overlay', scale: tween(g, b(11), b(13), 1.04, 1.1), origin: '50% 45%' } }),
    events: [{ at: b(11), run: () => say('your own book,|*your own number.*', { step: 0.05 }) }],
  });

  // 6 · above the fire
  await cut(b(16), {
    setup: async () => {
      await page.keyboard.press('Escape');
      await js(() => document.body.classList.remove('tt-search'));
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
      { at: b(18.5), run: () => say('*follow,*|and you’re next.', { kicker: 'the quiet library · opening soon', step: 0.06 }) },
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
