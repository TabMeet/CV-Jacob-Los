// TikTok #10: "the library cat has 3 jobs." 13 seconds of Ink, a numbered list,
// and an easy comment to leave: say hi to Ink.
//
//   the library cat has 3 jobs.        Ink, close up, staring right at you (the hook)
//   1. watch the rain.                 the big window, rain, Ink in the sill
//   2. guard every story.              his eyes darting after everyone who walks past
//   3. judge you. (lovingly)           a narrow-eyed stare, then a slow blink (a cat's "I love you")
//   say hi to Ink in the comments.     Ink, tail swishing
//
// Cut to the "ink" lo-fi preset (88 BPM: one beat = 0.682 s).
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-ink.wav 13.0 ink
//   node promo/make-tiktok-ink.cjs promo/lofi-ink.wav promo/quiet-library-ink.mp4

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, kin, KIN_CSS, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-ink.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-ink.cjs <lofi-ink.wav> [out.mp4]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-ink-'));
const BEAT = 60 / 88;
const b = (beats) => beats * BEAT;
const LENGTH = b(19); // 12.95 s
const CAT_X = 497;

const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const tween = (g, t0, t1, a, c, fn = ease) => a + (c - a) * fn(clamp((g - t0) / (t1 - t0)));

const SCENE_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  /* for "guard every story": his eyes and head follow someone walking past (set per frame) */
  .tt-eyes .cat .cat-pupils { transform: translate(var(--px), 0.6px) !important; transition: none !important; }
  .tt-eyes .cat .cat-head { transform: rotate(var(--tilt)) !important; transition: none !important; }
  /* "judge you": eyelids half down, the unimpressed look */
  .tt-judge .cat .cat-lids { transform: scaleY(.5) !important; animation: none !important; }
  /* "(lovingly)": a slow blink, a cat's way of saying I love you */
  .cat.tt-slow .cat-lids { animation: tt-slow-blink 1.5s ease-in-out both; }
  @keyframes tt-slow-blink { 0% { transform: scaleY(0); } 40%, 62% { transform: scaleY(.9); } 100% { transform: scaleY(0); } }
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
  window.__frame = ({ hall, px = 0, tilt = 0 }) => {
    lib.hall.teleport(hall.x);
    lib.hall.setCloseUp(hall.zoom, hall.focusY);
    document.documentElement.style.setProperty('--px', `${px.toFixed(2)}px`);
    document.documentElement.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`);
  };
  window.__cat = (cls, on) => {
    const cat = document.querySelector('.item.cat');
    if (on) {
      cat.classList.remove(cls);
      void cat.offsetWidth; // restart the animation
    }
    cat.classList.toggle(cls, on);
  };
  window.__mode = (cls, on) => document.body.classList.toggle(cls, on);
}

// Where his eyes go while "someone" walks past: left, right, back, and one double take.
const GLANCES = [[0, -2.6], [0.55, 2.6], [1.1, -2.2], [1.65, 2.6], [2.2, 0]];
function glance(t) {
  let px = GLANCES[0][1];
  for (let i = 1; i < GLANCES.length; i++) {
    const [t0, from] = GLANCES[i - 1];
    const [t1, to] = GLANCES[i];
    if (t >= t0) px = from + (to - from) * easeOut(clamp((t - t0) / Math.min(0.14, t1 - t0)));
  }
  return px;
}

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-03T19:20:00'),
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
  const mode = (cls, on = true) => js(([c, o]) => window.__mode(c, o), [cls, on]);

  async function cut(until, { setup, camera, events = [] }) {
    await settle();
    if (setup) await setup();
    const queue = [...events].sort((a, c) => a.at - c.at);
    while (n < Math.round(until * FPS)) {
      const g = n / FPS;
      while (queue.length && queue[0].at <= g) await queue.shift().run();
      await js((f) => window.__frame(f), camera(g));
      await film.shoot();
    }
  }

  // 1 · the hook: Ink, close up, looking right at you
  await cut(b(3), {
    setup: async () => {
      await say('the library cat|*has 3 jobs.*', { step: 0 });
      await settle(); // all there on frame 0
    },
    camera: (g) => ({ hall: { x: CAT_X, zoom: tween(g, 0, b(3), 3.3, 3.6, easeOut), focusY: 312 } }),
    events: [{ at: 0.45, run: () => cat('twitch') }],
  });

  // 2 · job 1: watch the rain
  await cut(b(7), {
    camera: (g) => ({ hall: { x: tween(g, b(3), b(7), 440, 410), zoom: tween(g, b(3), b(7), 1.42, 1.52), focusY: 228 } }),
    events: [{ at: b(3), run: () => say('1. watch|*the rain.*', { step: 0.06 }) }],
  });

  // 3 · job 2: guard every story (his eyes follow someone walking past)
  await cut(b(11), {
    setup: () => mode('tt-eyes'),
    camera: (g) => {
      const px = glance(g - b(7) - 0.45);
      return { hall: { x: CAT_X, zoom: tween(g, b(7), b(11), 2.5, 2.7), focusY: 300 }, px, tilt: px * 2.2 };
    },
    events: [{ at: b(7), run: () => say('2. guard|*every story.*', { step: 0.06 }) }],
  });

  // 4 · job 3: judge you (lovingly)
  await cut(b(15), {
    setup: async () => {
      await mode('tt-eyes', false);
      await mode('tt-judge');
    },
    camera: (g) => ({ hall: { x: CAT_X, zoom: tween(g, b(11), b(15), 3.2, 3.55), focusY: 312 } }),
    events: [
      { at: b(11), run: () => say('3. judge you.', { step: 0.06 }) },
      { at: b(13), run: async () => { await mode('tt-judge', false); await say('3. judge you.|*(lovingly)*', { step: 0 }); await cat('tt-slow'); } },
    ],
  });

  // 5 · say hi to Ink
  await cut(LENGTH, {
    setup: () => cat('tt-slow', false),
    camera: (g) => ({ hall: { x: CAT_X - 10, zoom: tween(g, b(15), LENGTH, 2.35, 2.6), focusY: 300 } }),
    events: [
      { at: b(15), run: () => say('say hi to Ink|*in the comments.*', { kicker: 'the quiet library', step: 0.06 }) },
      { at: b(16.5), run: () => cat('twitch') },
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
