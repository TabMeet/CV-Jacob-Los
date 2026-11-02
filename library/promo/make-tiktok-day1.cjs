// TikTok #9: "day 1 of filling an empty library with your stories." 14.3 seconds.
// The start of a daily series, and the first call for stories: followers send
// them in, and they go on the shelves, anonymous. The story shelves really are
// empty today; the one book that glows in is a preview ("could be yours").
//
//   day 1 · filling an empty library with your stories.   an empty bookcase, "waiting for a first story"
//   12 shelves. 0 stories.                                  past the empty bookcases
//   she's ready to bind them.                               Mrs. Wren at the front desk
//   he's ready to guard them.                               Ink in the window
//   the first one could be yours.                           a book glows onto an empty shelf
//   day 1 · send me a story. no names. ever.                pulling back from it
//
// Cut to the "day1" lo-fi preset (88 BPM: one beat = 0.682 s).
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-day1.wav 14.4 day1
//   node promo/make-tiktok-day1.cjs promo/lofi-day1.wav promo/quiet-library-day1.mp4

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, kin, KIN_CSS, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-day1.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-day1.cjs <lofi-day1.wav> [out.mp4]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-day1-'));
const BEAT = 60 / 88;
const b = (beats) => beats * BEAT;
const LENGTH = b(21); // 14.32 s

const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const tween = (g, t0, t1, a, c, fn = ease) => a + (c - a) * fn(clamp((g - t0) / (t1 - t0)));

const SCENE_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  .cat.twitch .cat-ear-r { animation-duration: .3s; }
`;

function pageSetup() {
  const lib = window.__lib;
  window.__setPresence = lib.hall.setPresence;
  lib.hall.setPresence = () => {};
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
  window.__frame = ({ hall }) => {
    lib.hall.teleport(hall.x);
    lib.hall.setCloseUp(hall.zoom, hall.focusY);
  };
}

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-03T21:40:00'),
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: false, time: 'night', rain: true, pace: 1, demo: 0 },
    // the story shelves, empty: day 1
    storage: { 'ql.local.library': { version: 1, books: [] }, 'ql.local.friends': { version: 1, friends: [] } },
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

  async function cut(until, { setup, camera, events = [] }) {
    await settle();
    if (setup) await setup();
    const queue = [...events].sort((a, c) => a.at - c.at);
    while (n < Math.round(until * FPS)) {
      const g = n / FPS;
      while (queue.length && queue[0].at <= g) await queue.shift().run();
      await js((f) => window.__frame(f), { hall: camera(g) });
      await film.shoot();
    }
  }
  const spot = (id) => js((s) => window.__lib.hall.spot(s).cx, id);
  const life = await spot('shelf:life');
  const letters = await spot('shelf:letters');
  const poetry = await spot('shelf:poetry');
  const twitch = () => js(() => {
    const cat = document.querySelector('.item.cat');
    cat.classList.remove('twitch');
    void cat.offsetWidth;
    cat.classList.add('twitch');
  });

  // 1 · the hook: an empty bookcase, waiting for a first story
  await cut(b(3), {
    setup: async () => {
      await say('filling an empty library|*with your stories.*', { kicker: 'day 1', step: 0 });
      await settle(); // all there on frame 0
    },
    camera: (g) => ({ x: life, zoom: tween(g, 0, b(3), 1.26, 1.4, easeOut), focusY: 272 }),
  });

  // 2 · twelve shelves, no stories yet
  await cut(b(6), {
    camera: (g) => ({ x: tween(g, b(3), b(6), life + 40, poetry), zoom: 1.1, focusY: 300 }),
    events: [{ at: b(3), run: () => say('12 shelves.|*0 stories.*', { step: 0.06 }) }],
  });

  // 3 · Mrs. Wren
  await cut(b(9), {
    camera: (g) => ({ x: 822, zoom: tween(g, b(6), b(9), 1.7, 1.86), focusY: 210 }),
    events: [{ at: b(6), run: () => say('she’s ready|*to bind them.*', { step: 0.05 }) }],
  });

  // 4 · Ink
  await cut(b(12), {
    camera: (g) => ({ x: 497, zoom: tween(g, b(9), b(12), 2.3, 2.5), focusY: 290 }),
    events: [
      { at: b(9), run: () => say('he’s ready|*to guard them.*', { step: 0.05 }) },
      { at: b(9) + 0.9, run: twitch },
    ],
  });

  // 5-6 · the first book glows onto an empty shelf (a preview), then the call for stories
  await cut(LENGTH, {
    // close on the top shelf where the book lands, then back to show how empty the rest still is
    camera: (g) => {
      const back = ease(clamp((g - b(16)) / b(5)));
      return {
        x: letters - 65 + 40 * back,
        zoom: tween(g, b(12), b(16), 1.75, 1.86) + (1.12 - 1.86) * back,
        focusY: 220 + 52 * back,
      };
    },
    events: [
      { at: b(12), run: () => say('the first one|*could be yours.*', { step: 0.05 }) },
      { at: b(12) + 0.5, run: () => js(() => window.__lib.hall.updateShelves([{ id: 'letters', books: [{ id: 'first-story', title: 'The First Story', reads: 0 }] }])) },
      { at: b(16), run: () => say('send me a story.|*no names. ever.*', { kicker: 'day 1 · the quiet library', step: 0.06 }) },
    ],
  });

  await browser.close();
  assemble({ shots: [dir], transitions: [], audio, out, length: LENGTH, fadeIn: 0, fadeOut: 0, audioFadeOut: 0.05 });
  fs.rmSync(WORK, { recursive: true, force: true });
  console.log(`done: ${out} (${n} frames)`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
