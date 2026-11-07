// TikTok #18: "how the library cat got his name". 14.3 seconds. A cat, a rule, and an
// inkwell: the classic slow push, with eye contact.
//
//   how the library cat got his name.       Ink at the writing desk, next to the inkwell (the hook)
//   Mrs. Wren had one rule: don't touch the ink.   his paw lifts, and hovers over it
//   he looked at her. he looked at the ink.        close on his face; his eyes slide over; dun, dun
//   he touched the ink.                            the push; it tips; the splash
//   he's been called Ink ever since.               inky paw prints across the letter, right up to him
//   what would you have named him?
//
// A story for the character: the library doesn't say how Ink got his name anywhere else.
// The desk is drawn for this video (scenes/inkwell.cjs) and Ink is the posable close-up
// (scenes/ink-big.cjs). Cut to the "name" lo-fi preset (88 BPM: one beat = 0.682 s);
// the inkwell lands on the downbeat where the beat comes back.
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-name.wav 14.4 name
//   node promo/make-tiktok-name.cjs promo/lofi-name.wav promo/quiet-library-name.mp4
//
// PREVIEW=0,3.5,7 node promo/make-tiktok-name.cjs x out-dir   shoots only those moments (JPEGs)

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, kin, KIN_CSS, FPS } = require('./film-lib.cjs');
const { INK_POSE_JS } = require('./scenes/ink-big.cjs');
const { INKWELL_CSS, INKWELL_HTML, inkwellFrame, PLACES } = require('./scenes/inkwell.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-name.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-name.cjs <lofi-name.wav> [out.mp4]');
  process.exit(1);
}
const PREVIEW = process.env.PREVIEW ? new Set(process.env.PREVIEW.split(',').map((s) => Math.round(Number(s) * FPS))) : null;
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-name-'));
const BEAT = 60 / 88;
const b = (beats) => beats * BEAT;
const LENGTH = b(21); // 14.3 s

const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeIn = (t) => t * t;
const tween = (g, t0, t1, a, c, fn = ease) => a + (c - a) * fn(clamp((g - t0) / (t1 - t0)));
const mix = (a, c, u) => ({ x: a.x + (c.x - a.x) * u, y: a.y + (c.y - a.y) * u });
// a blink: lids from `base` to shut and back, over `dur` seconds from t0
const blink = (g, t0, dur, base = 0) => {
  const u = (g - t0) / dur;
  if (u <= 0 || u >= 1) return base;
  return base + (1 - base) * Math.sin(Math.PI * u) ** 0.7;
};

// the beats of the story
const T = {
  rule: b(4),
  lift: b(5), hover: b(6),
  her: b(8), ink: b(9.5),
  push: b(11), touch: b(11.3), tip: b(11.45), land: b(12), back: b(11.6),
  after: b(13.5), prints: b(13.8), every: 0.22, slow: b(15.6),
  ask: b(17),
};
// where his left paw goes (his own coordinates): resting, hovering over the inkwell, pushing it
const REST = { x: 46, y: 108 };
const HOVER = { x: 6, y: 80 };
const TOUCH = { x: 15.6, y: 98.4 };
const PUSHED = { x: 8.5, y: 97.6 };

// the inkwell: pushed a few px, then over on its side, with a little bounce
function wellAt(g) {
  const dx = -6 * easeOut(clamp((g - T.touch) / (T.tip + 0.1 - T.touch)));
  let ang = 0;
  if (g >= T.tip && g < T.land) ang = -90 * easeIn((g - T.tip) / (T.land - T.tip));
  else if (g >= T.land) {
    const u = g - T.land;
    ang = -90 + (u < 0.24 ? 7 * Math.sin((u / 0.24) * Math.PI) * Math.exp(-u * 6) : 0);
  }
  return { dx, ang };
}

function pawAt(g) {
  if (g < T.lift) return null;
  if (g < T.hover) return mix(REST, HOVER, ease((g - T.lift) / (T.hover - T.lift)));
  if (g < T.push) {
    // hovering, tapping the air a little
    const tap = Math.max(0, Math.sin((g - T.hover) * 7)) * 2.5;
    return { x: HOVER.x + 1, y: HOVER.y - tap };
  }
  if (g < T.touch) return mix({ x: HOVER.x + 1, y: HOVER.y }, TOUCH, ease((g - T.push) / (T.touch - T.push)));
  if (g < T.back) return mix(TOUCH, PUSHED, easeOut((g - T.touch) / (T.back - T.touch)));
  if (g < T.back + 0.25) return mix(PUSHED, REST, ease((g - T.back) / 0.25));
  return null;
}

// Ink, every frame
function inkAt(g) {
  const breath = 0.5 - 0.5 * Math.cos((2 * Math.PI * g) / 3.0);
  const pose = {
    breath,
    tail: 8 * Math.sin(g * 1.7) + 4 * Math.sin(g * 3.1),
    rimR: 0.55,
    rimL: 0.12,
    pawL: pawAt(g),
    px: 0,
    py: 0.3,
    lids: blink(g, 1.85, 0.22),
    twitch: g > 1.15 && g < 1.5 ? Math.sin(((g - 1.15) / 0.35) * Math.PI * 2) ** 2 : 0,
  };
  // the rule: a glance at the ink, back at you, and the paw goes up anyway
  if (g >= T.rule && g < T.her) {
    const look = clamp((g - (T.rule + 0.4)) / 0.25) - clamp((g - (T.rule + 1.6)) / 0.25);
    pose.px = -2.6 * look;
    pose.py = 0.3 + 1.2 * look;
    pose.lids = blink(g, T.rule + 2.3, 0.22, 0.12);
  }
  // he looked at her (deadpan), he looked at the ink (eyes slide over, pupils go round)
  if (g >= T.her && g < T.push) {
    const slide = ease(clamp((g - T.ink) / 0.3));
    pose.px = -2.9 * slide;
    pose.py = 0.3 + 1.3 * slide;
    pose.lids = 0.32 - 0.12 * slide;
    pose.pupil = 0.55 * slide;
    pose.tilt = -4 * slide;
  }
  if (g >= T.push && g < T.land) {
    pose.px = -2.6;
    pose.py = 1.6;
    pose.lids = 0.15;
    pose.pupil = 0.6;
    pose.tilt = -3;
  }
  // the crash: ears flat, eyes huge, a little jump
  if (g >= T.land && g < T.after) {
    const u = g - T.land;
    pose.ears = 0.85 * easeOut(clamp(u / 0.08));
    pose.pupil = 1;
    pose.px = -1.2 + Math.min(1.2, u * 1.2);
    pose.py = 0.2;
    pose.lids = 0;
    pose.hop = 16 * Math.max(0, Math.sin(Math.min(Math.PI, (u / 0.28) * Math.PI)));
  }
  // innocent: ears up, slits again, looking right at you, with an inky paw
  if (g >= T.after) {
    pose.inky = true;
    pose.ears = 0.85 * (1 - ease(clamp((g - T.after) / 0.5)));
    pose.pupil = 1 - ease(clamp((g - T.after) / 0.6));
    pose.px = 0;
    pose.py = 0.3;
    pose.lids = blink(g, T.slow, 1.3, 0.28);
    if (g >= T.ask) {
      pose.lids = blink(g, T.ask + 2.2, 0.24, 0.12);
      pose.twitch = g > T.ask + 1.0 && g < T.ask + 1.35 ? Math.sin(((g - T.ask - 1.0) / 0.35) * Math.PI * 2) ** 2 : 0;
    }
  }
  if (pose.hop) pose.y = PLACES.feet.y - pose.hop;
  delete pose.hop;
  return pose;
}

const CAMS = [
  [0, T.rule, (g) => ({ s: tween(g, 0, T.rule, 1.58, 1.68, easeOut), fx: 272, fy: 616, ax: 270, ay: 560 })],
  [T.rule, T.her, (g) => ({ s: tween(g, T.rule, T.her, 1.52, 1.62), fx: 258, fy: 650, ax: 270, ay: 600 })],
  [T.her, T.push, (g) => ({ s: tween(g, T.her, T.push, 2.3, 2.5), fx: 322, fy: 575, ax: 270, ay: 590 })],
  [T.push, T.after, (g) => {
    const u = g - T.land;
    const shake = u > 0 && u < 0.3 ? Math.sin(u * 70) * 7 * (1 - u / 0.3) : 0;
    return { s: 1.4, fx: 214, fy: 700, ax: 270, ay: 600, sx: shake, sy: shake * 0.6 };
  }],
  [T.after, T.ask, (g) => ({ s: tween(g, T.after, T.ask, 1.36, 1.44), fx: 270, fy: 762, ax: 270, ay: 640 })],
  [T.ask, LENGTH, (g) => ({ s: tween(g, T.ask, LENGTH, 1.36, 1.16), fx: 270, fy: tween(g, T.ask, LENGTH, 740, 680), ax: 270, ay: 620 })],
];
const camAt = (g) => CAMS.find(([a, c]) => g >= a && g < c)?.[2](g) ?? CAMS.at(-1)[2](g);

function sceneAt(g) {
  return {
    t: g,
    cam: camAt(g),
    well: wellAt(g),
    pour: g < T.land ? 0 : easeOut(clamp((g - T.land) / 1.3)),
    splash: g < T.land ? null : g - T.land,
    prints: g < T.prints ? 0 : clamp((g - T.prints) / T.every + 1, 0, 6),
    ink: inkAt(g),
  };
}

const SCENE_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
` + INKWELL_CSS;

function pageSetup({ html }) {
  window.__kin = (h) => {
    for (const old of document.querySelectorAll('.tt-kin')) old.remove();
    if (h) document.body.insertAdjacentHTML('beforeend', h);
  };
  window.__settle = () => {
    for (const a of document.getAnimations()) {
      const t = a.effect?.getComputedTiming?.();
      if (t && Number.isFinite(t.endTime)) try { a.finish(); } catch { /* ignore */ }
    }
  };
  document.body.insertAdjacentHTML('beforeend', html);
}

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-07T21:30:00'),
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: false, time: 'night', rain: true, pace: 1, demo: 0 },
  });
  await page.addStyleTag({ content: KIN_CSS + SCENE_CSS });
  await page.evaluate(INK_POSE_JS);
  await page.evaluate(`window.__iwPlaces = ${JSON.stringify(PLACES)}; window.__inkwell = ${inkwellFrame.toString()}`);
  await page.evaluate(pageSetup, { html: INKWELL_HTML });

  const dir = PREVIEW ? out : path.join(WORK, 'frames');
  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  const film = createFilm(page, async (buf) => {
    n++;
    fs.writeFileSync(path.join(dir, PREVIEW ? `t${((n - 1) / FPS).toFixed(2)}.jpg` : `${String(n).padStart(5, '0')}.jpg`), buf);
  });
  const js = (fn, arg) => page.evaluate(fn, arg);
  const say = (text, opts) => js((h) => window.__kin(h), text ? kin(text, opts) : null);
  const settle = () => js(() => window.__settle());
  async function shoot() {
    if (!PREVIEW || PREVIEW.has(n)) return film.shoot();
    await page.clock.runFor(1000 / FPS);
    await js(() => window.__stepAnimations(performance.now()));
    n++;
  }

  const captions = [
    [0, 'how the library cat|*got his name.*', { step: 0 }],
    [T.rule, 'Mrs. Wren had one rule:|*don’t touch the ink.*'],
    [T.her, 'he looked at her.'],
    [T.ink, 'he looked at her.|*he looked at the ink.*', { step: 0, keep: 1 }],
    [T.push, '*he touched the ink.*'],
    [T.after, 'he’s been called|*Ink ever since.*'],
    [T.ask, 'what would you|*have named him?*', { kicker: 'the quiet library' }],
  ].map(([at, text, opts = {}]) => ({ at, text, opts: { step: 0.06, ...opts } }));

  await say(captions[0].text, captions[0].opts);
  await js((st) => window.__inkwell(st), sceneAt(0));
  await settle(); // all there on frame 0
  let next = 1;
  while (n < Math.round(LENGTH * FPS)) {
    const g = n / FPS;
    while (next < captions.length && captions[next].at <= g) {
      const c = captions[next++];
      await say(c.text, c.opts);
      if (c.opts.keep) await settle(); // the first line was already there: no second fade-in
    }
    await js((st) => window.__inkwell(st), sceneAt(g));
    await shoot();
  }

  await browser.close();
  if (PREVIEW) {
    console.log(`preview: ${out}`);
    return;
  }
  assemble({ shots: [dir], transitions: [], audio, out, length: LENGTH, fadeIn: 0, fadeOut: 0, audioFadeOut: 0.05, loop: true });
  fs.rmSync(WORK, { recursive: true, force: true });
  console.log(`done: ${out} (${n} frames)`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
