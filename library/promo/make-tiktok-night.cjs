// TikTok #16: "the library at 3 a.m." 14.2 seconds of the library late at night,
// ending on its whole point: if you're up too, you're not alone.
//
//   the library at 3 a.m.               the wall clock at 3:00, ticking (the hook)
//   the lamps stay on.                  an empty armchair under its lamp
//   the fire's still going.             the fireplace in Friends of the Library
//   someone's still writing.            a writing-room door, lit, a writer behind the glass
//   if you're up too, you're not alone. Ink in the window, sleepy, a slow blink
//   where are you watching from?
//
// The clock on the wall shows the visitor's own time; filmed at 3:00 in the morning.
// Cut to the "night" lo-fi preset (72 BPM: one beat = 0.833 s).
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-night.wav 14.25 night
//   node promo/make-tiktok-night.cjs promo/lofi-night.wav promo/quiet-library-night.mp4

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, kin, KIN_CSS, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-night.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-night.cjs <lofi-night.wav> [out.mp4]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-night-'));
const BEAT = 60 / 72;
const b = (beats) => beats * BEAT;
const LENGTH = b(17); // 14.2 s

const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const tween = (g, t0, t1, a, c, fn = ease) => a + (c - a) * fn(clamp((g - t0) / (t1 - t0)));

const SCENE_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  /* sleepy: lids half down (not !important, so his blinks still play over it) */
  .tt-sleepy .cat .cat-lids { transform: scaleY(.55); }
  .cat.tt-slow .cat-lids { animation: tt-slow-blink 1.6s ease-in-out both; }
  @keyframes tt-slow-blink { 0% { transform: scaleY(.55); } 40%, 62% { transform: scaleY(.95); } 100% { transform: scaleY(.55); } }
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
  window.__cat = (cls, on) => {
    const cat = document.querySelector('.item.cat');
    if (on) {
      cat.classList.remove(cls);
      void cat.offsetWidth;
    }
    cat.classList.toggle(cls, on);
  };
}

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-06T03:00:00'), // the wall clock shows the time
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: false, time: 'night', rain: true, pace: 1, demo: 0 },
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
  const cat = (cls, on = true) => js(([c, o]) => window.__cat(c, o), [cls, on]);

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
  const chair = await spot('chair:0');
  const writing = await spot('writing');
  const fire = await js(() => window.__lib.hall.fireX);

  // 1 · the hook: the clock on the wall, at 3:00
  await cut(b(3), {
    setup: async () => {
      await say('the library|*at 3 a.m.*', { step: 0 });
      await settle(); // all there on frame 0
    },
    camera: (g) => ({ x: 1101, zoom: tween(g, 0, b(3), 3.3, 3.6, easeOut), focusY: 160 }),
  });

  // 2 · an empty armchair under its lamp
  await cut(b(6), {
    camera: (g) => ({ x: tween(g, b(3), b(6), chair - 30, chair + 10), zoom: 1.55, focusY: 320 }),
    events: [{ at: b(3), run: () => say('the lamps|*stay on.*', { step: 0.06 }) }],
  });

  // 3 · the fire
  await cut(b(9), {
    camera: (g) => ({ x: fire, zoom: tween(g, b(6), b(9), 1.6, 1.75), focusY: 330 }),
    events: [{ at: b(6), run: () => say('the fire’s|*still going.*', { step: 0.06 }) }],
  });

  // 4 · someone in a writing room
  await cut(b(12), {
    setup: async () => {
      await js(() => window.__setPresence({ total: 2, zones: { 'writing:1': 1 } }, 'hall'));
      await page.clock.runFor(1400);
      await settle();
    },
    camera: (g) => ({ x: writing, zoom: tween(g, b(9), b(12), 1.38, 1.5), focusY: 240 }),
    events: [{ at: b(9), run: () => say('someone’s|*still writing.*', { step: 0.06 }) }],
  });

  // 5 · Ink, sleepy, in the window: you're not alone
  await cut(LENGTH, {
    setup: () => js(() => document.body.classList.add('tt-sleepy')),
    camera: (g) => ({ x: tween(g, b(12), LENGTH, 455, 470), zoom: tween(g, b(12), LENGTH, 1.5, 1.68), focusY: 288 }),
    events: [
      { at: b(12), run: () => say('if you’re up too,|*you’re not alone.*', { step: 0.06 }) },
      { at: b(13.3), run: () => cat('tt-slow') },
      { at: b(14.5), run: () => say('where are you|*watching from?*', { kicker: 'the quiet library', step: 0.06 }) },
    ],
  });

  await browser.close();
  assemble({ shots: [dir], transitions: [], audio, out, length: LENGTH, fadeIn: 0, fadeOut: 0, audioFadeOut: 0.05, loop: true });
  fs.rmSync(WORK, { recursive: true, force: true });
  console.log(`done: ${out} (${n} frames)`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
