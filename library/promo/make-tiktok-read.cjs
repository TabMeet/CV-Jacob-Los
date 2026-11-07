// TikTok #19: "POV: you try to read in a library with a cat". 14.3 seconds of Ink doing
// what cats do to books: he peeks over the table, hops up, and sits right on the page.
//
//   POV: you try to read in a library with a cat.   your book; Ink's ears and eyes over the far edge (the hook)
//   page one.                                       he hops up onto the table
//   still page one.                                 he steps onto the book and sits on it, staring at you
//   he's reading it first.                          head down, his eyes going along the lines
//   fine. we'll read together.                      he looks up, slow-blinks, purrs, a paw on the page
//   tag someone whose cat does this.
//
// The table is drawn for this video (scenes/reading.cjs) and Ink is the posable close-up
// (scenes/ink-big.cjs). Cut to the "read" lo-fi preset (88 BPM: one beat = 0.682 s).
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-read.wav 14.4 read
//   node promo/make-tiktok-read.cjs promo/lofi-read.wav promo/quiet-library-read.mp4
//
// PREVIEW=0,3.5,7 node promo/make-tiktok-read.cjs x out-dir   shoots only those moments (JPEGs)

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, kin, KIN_CSS, FPS } = require('./film-lib.cjs');
const { INK_POSE_JS } = require('./scenes/ink-big.cjs');
const { READING_CSS, READING_HTML, readingFrame, EDGE } = require('./scenes/reading.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-read.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-read.cjs <lofi-read.wav> [out.mp4]');
  process.exit(1);
}
const PREVIEW = process.env.PREVIEW ? new Set(process.env.PREVIEW.split(',').map((s) => Math.round(Number(s) * FPS))) : null;
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-read-'));
const BEAT = 60 / 88;
const b = (beats) => beats * BEAT;
const LENGTH = b(21); // 14.3 s

const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const tween = (g, t0, t1, a, c, fn = ease) => a + (c - a) * fn(clamp((g - t0) / (t1 - t0)));
const blink = (g, t0, dur, base = 0) => {
  const u = (g - t0) / dur;
  if (u <= 0 || u >= 1) return base;
  return base + (1 - base) * Math.sin(Math.PI * u) ** 0.7;
};
const twitchAt = (g, t0) => (g > t0 && g < t0 + 0.35 ? Math.sin(((g - t0) / 0.35) * Math.PI * 2) ** 2 : 0);

// the beats of the story (lofi.py's "read" preset has the same)
const T = {
  hop: b(3), table: b(3) + 0.5,
  step: b(5), book: b(5) + 0.5,
  read: b(8),
  together: b(11.5), paw: b(13.2),
  tag: b(15.5),
};
const JUMP = 0.5;
// where he is: behind the table (peeking), on the table behind the book, on the book
const PEEK = { x: 270, y: 616, s: 1.5 };
const TABLE = { x: 270, y: 584, s: 1.68 };
const BOOK = { x: 270, y: 846, s: 2.6 };

function hopBetween(a, c, u, height) {
  return { x: a.x + (c.x - a.x) * u, y: a.y + (c.y - a.y) * ease(u) - height * Math.sin(Math.PI * u), s: a.s + (c.s - a.s) * ease(u) };
}
// a landing: squashed for a moment
const squash = (since) => (since >= 0 && since < 0.3 ? Math.sin((since / 0.3) * Math.PI) * Math.exp(-since * 6) : 0);

function placeAt(g) {
  if (g < T.hop) return { ...PEEK, y: PEEK.y - 12 * easeOut(clamp(g / 1.4)), hidden: true, shadow: 0 };
  if (g < T.table) {
    const u = (g - T.hop) / JUMP;
    const p = hopBetween({ ...PEEK, y: PEEK.y - 12 }, TABLE, u, 120);
    return { ...p, hidden: u < 0.5 && p.y > EDGE, shadow: 0, sy: 1 + 0.08 * Math.sin(Math.PI * u) };
  }
  if (g < T.step) {
    const sq = squash(g - T.table);
    return { ...TABLE, sx: 1 + 0.08 * sq, sy: 1 - 0.1 * sq };
  }
  if (g < T.book) {
    const u = (g - T.step) / JUMP;
    return { ...hopBetween(TABLE, BOOK, u, 70), shadow: 1 - Math.sin(Math.PI * u), sy: 1 + 0.06 * Math.sin(Math.PI * u) };
  }
  const sq = squash(g - T.book);
  return { ...BOOK, sx: 1 + 0.07 * sq, sy: 1 - 0.09 * sq };
}

// his eyes going along the lines: left to right, a quick jump back, the next line
function readingEyes(g) {
  const line = 0.62;
  const u = ((g - T.read - 0.3) % line) / line;
  if (g < T.read + 0.3) return { px: tween(g, T.read, T.read + 0.3, 0, -2.6), row: 0 };
  return { px: u < 0.85 ? -2.6 + 5.2 * (u / 0.85) : 2.6 - 5.2 * ((u - 0.85) / 0.15), row: Math.floor((g - T.read - 0.3) / line) };
}

function inkAt(g) {
  const place = placeAt(g);
  const pose = {
    ...place,
    breath: 0.5 - 0.5 * Math.cos((2 * Math.PI * g) / 3.0),
    tail: 9 * Math.sin(g * 1.6) + 4 * Math.sin(g * 2.9),
    rimL: 0.5,
    rimR: 0.2,
    px: 0,
    py: 0.2,
    lids: 0,
  };
  delete pose.hidden;
  if (g < T.hop) {
    // peeking: both front paws on the edge of the table, big round eyes, an ear twitch, a blink
    const edge = 112 + (EDGE - place.y) / place.s - 4.5; // the table's edge, in his own coordinates
    pose.pawL = { x: 35, y: edge };
    pose.pawR = { x: 79, y: edge };
    pose.pupil = 0.7;
    pose.twitch = twitchAt(g, 0.95);
    pose.lids = blink(g, 1.55, 0.2);
  } else if (g < T.step) {
    pose.pupil = 0.35 * (1 - clamp((g - T.hop) / 0.6));
    // on the table: a look down at the book, then back at you
    const look = clamp((g - (T.table + 0.2)) / 0.2) - clamp((g - (T.step - 0.35)) / 0.2);
    pose.py = 0.2 + 2 * look;
    pose.px = -0.6 * look;
  } else if (g < T.read) {
    // on the book, staring at you: deadpan
    pose.lids = g > T.book + 0.2 ? 0.3 : 0;
    pose.lids = Math.max(pose.lids, blink(g, T.book + 1.2, 0.22, 0.3) * (g > T.book + 1.2 ? 1 : 0));
    pose.twitch = twitchAt(g, T.book + 0.5);
  } else if (g < T.together) {
    const eyes = readingEyes(g);
    const down = ease(clamp((g - T.read) / 0.35)) * (1 - ease(clamp((g - (T.together - 0.3)) / 0.3)));
    pose.px = eyes.px * down;
    pose.py = 0.2 + 2.3 * down;
    pose.hy = 3.5 * down;
    pose.hx = eyes.px * 0.5 * down;
    pose.tilt = (eyes.row % 2 ? 2 : -2) * down;
    pose.lids = 0.38 * down;
  } else {
    // together: he looks up at you, slow-blinks, purrs; a paw on the page
    pose.breath = 0.5 - 0.5 * Math.cos((2 * Math.PI * g) / 2.2);
    pose.lids = Math.max(blink(g, T.together + 0.6, 1.3, 0.12), blink(g, T.tag + 2.6, 1.3, 0.12));
    if (g >= T.paw) {
      const u = ease(clamp((g - T.paw) / 0.4));
      pose.pawL = { x: 46 - 12 * u, y: 108 + 6 * u - 7 * Math.sin(Math.PI * u) };
    }
    pose.twitch = twitchAt(g, T.tag + 1.2);
  }
  return pose;
}

const CAMS = [
  [0, T.hop, (g) => ({ s: tween(g, 0, T.hop, 2.05, 2.15, easeOut), fx: 270, fy: 500, ax: 270, ay: 560 })],
  [T.hop, T.step, (g) => ({ s: 1.32, fx: 270, fy: 540, ax: 270, ay: 600 })],
  [T.step, T.read, (g) => ({ s: tween(g, T.step, T.read, 1.12, 1.18), fx: 270, fy: 720, ax: 270, ay: 600 })],
  [T.read, T.together, (g) => ({ s: tween(g, T.read, T.together, 1.52, 1.6), fx: 270, fy: 700, ax: 270, ay: 600 })],
  [T.together, T.tag, (g) => ({ s: tween(g, T.together, T.tag, 1.5, 1.22), fx: 270, fy: 690, ax: 270, ay: 600 })],
  [T.tag, LENGTH, (g) => ({ s: tween(g, T.tag, LENGTH, 1.22, 1.3), fx: 270, fy: 680, ax: 270, ay: 610 })],
];
const camAt = (g) => CAMS.find(([a, c]) => g >= a && g < c)?.[2](g) ?? CAMS.at(-1)[2](g);

const sceneAt = (g) => ({ t: g, cam: camAt(g), hidden: placeAt(g).hidden ?? false, ink: inkAt(g) });

const SCENE_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
` + READING_CSS;

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
  await page.evaluate(`window.__reading = ${readingFrame.toString()}`);
  await page.evaluate(pageSetup, { html: READING_HTML });

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
    [0, 'POV: you try to read|*in a library with a cat.*', { step: 0 }],
    [T.hop, 'page one.'],
    [T.step, '*still* page one.'],
    [T.read, 'he’s reading it|*first.*'],
    [T.together, 'fine.|*we’ll read together.*'],
    [T.tag, 'tag someone|*whose cat does this.*', { kicker: 'the quiet library' }],
  ].map(([at, text, opts = {}]) => ({ at, text, opts: { step: 0.06, ...opts } }));

  await say(captions[0].text, captions[0].opts);
  await js((st) => window.__reading(st), sceneAt(0));
  await settle(); // all there on frame 0
  let next = 1;
  while (n < Math.round(LENGTH * FPS)) {
    const g = n / FPS;
    while (next < captions.length && captions[next].at <= g) {
      const c = captions[next++];
      await say(c.text, c.opts);
    }
    await js((st) => window.__reading(st), sceneAt(g));
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
