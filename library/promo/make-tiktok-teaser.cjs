// TikTok #12: a teaser for a new book. 15 seconds. A story shelf is dusted (the
// shelves are still empty, as in "day 1"), then someone types at a typewriter in
// a writing room, seen from behind, their head hiding the page: nothing on it can
// be read (the marks that peek out above their head are blurred strokes, not text).
//
//   making room for a new book.         a feather duster on an empty shelf, dust in the lamplight (the hook)
//   it isn't finished yet.              along the shelves
//   someone is still writing it.        the writer at the typewriter, from behind; the bell, the return
//   no peeking. not yet.                over their shoulder, the page hidden by their head
//   a new book is coming soon.          the dusted shelf, waiting
//   follow so you don't miss it.
//
// Cut to the "teaser" lo-fi preset (88 BPM: one beat = 0.682 s).
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-teaser.wav 15.05 teaser
//   node promo/make-tiktok-teaser.cjs promo/lofi-teaser.wav promo/quiet-library-teaser.mp4

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, kin, KIN_CSS, FPS } = require('./film-lib.cjs');
const { TYPIST_CSS, TYPIST_HTML, typistFrame } = require('./scenes/typist.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-teaser.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-teaser.cjs <lofi-teaser.wav> [out.mp4]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-teaser-'));
const BEAT = 60 / 88;
const b = (beats) => beats * BEAT;
const LENGTH = b(22); // 15.0 s

const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const tween = (g, t0, t1, a, c, fn = ease) => a + (c - a) * fn(clamp((g - t0) / (t1 - t0)));
const hash = (n) => {
  let s = (n * 2654435761) >>> 0;
  s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0;
  s = Math.imul(s ^ (s >>> 13), 3266489909) >>> 0;
  return ((s ^ (s >>> 16)) >>> 0) / 4294967296;
};

// -- the feather duster (lofi.py has the same sweeps for its swishes) -----------------
// Sweep 1 (the hook): period 1.1 s, crossing the middle at -0.14 s + k * 0.55 s.
// Sweep 2: period 1.3 s from 4 beats + 0.15 s, while the camera moves along the shelf.
function duster(t) {
  if (t < b(4)) {
    const p = (2 * Math.PI * (t + 0.14)) / 1.1;
    return { x: 270 + 158 * Math.sin(p), lift: 14 * Math.abs(Math.cos(p)), vx: 158 * Math.cos(p) * (2 * Math.PI / 1.1), row: 0 };
  }
  const p = (2 * Math.PI * (t - b(4) - 0.15)) / 1.3;
  return { x: 270 + 176 * Math.sin(p), lift: 16 * Math.abs(Math.cos(p)), vx: 176 * Math.cos(p) * (2 * Math.PI / 1.3), row: 1 };
}
// the dust: motes thrown up by the feathers, drifting in the lamplight
const EMIT = 1 / 120;
function motes(t, boardY, until = Infinity) {
  const list = [];
  for (let k = Math.ceil((t - 2.4) / EMIT); k * EMIT <= Math.min(t, until); k++) {
    const te = k * EMIT;
    const d = duster(te);
    const speed = Math.abs(d.vx);
    if (hash(k) > 0.4 + speed / 1500) continue; // more dust where the feathers move fastest
    const life = 1.3 + hash(k + 7) * 1.4;
    const age = t - te;
    if (age > life || age < 0) continue;
    const u = age / life;
    const x = d.x + (hash(k + 1) - 0.5) * 70 + d.vx * 0.06 * Math.min(age, 0.4) + Math.sin(age * 2 + k) * 6 + (hash(k + 3) - 0.5) * 60 * age;
    const y = boardY - 8 - (24 + hash(k + 2) * 70) * age + 18 * age * age;
    const big = hash(k + 5) < 0.06;
    list.push({ x, y, r: big ? 6 + hash(k + 6) * 7 : 1.1 + hash(k + 4) * 2.6, a: (big ? 0.2 : 0.95) * Math.sin(Math.PI * Math.min(1, u * 1.4)) * (1 - u * 0.4) });
  }
  return list;
}
// the typewriter: keys on a sixteenth-note pattern (the same as lofi.py), the bell at 12 beats
const PATTERN = 'x.xxx.x.xx.xxx.x';
const KEYS = [];
for (let i = 8 * 4; i < 17 * 4; i++) {
  const at = i * (BEAT / 4);
  if (at >= b(12) - 1e-6 && at < b(12.5) - 1e-6) continue;
  if (PATTERN[i % 16] === 'x') KEYS.push(at);
}
const BELL = b(12);
const RETURN = [BELL + 0.12, BELL + 0.34];
function typing(g) {
  const before = KEYS.filter((k) => k <= g);
  const last = before.at(-1) ?? -9;
  const sinceReturn = before.filter((k) => k > RETURN[1]).length;
  const line = before.filter((k) => k < BELL).length;
  let carriage;
  if (g < RETURN[0]) carriage = 46 + line * 2.4;
  else if (g < RETURN[1]) carriage = (46 + line * 2.4) * (1 - easeOut((g - RETURN[0]) / (RETURN[1] - RETURN[0])));
  else carriage = sinceReturn * 2.4;
  return {
    carriage,
    feed: g >= RETURN[1] ? 1 : 0,
    bob: Math.exp(-(g - last) * 22),
    arm: before.length % 2 ? 1 : -1,
    flinch: g >= BELL ? Math.exp(-(g - BELL) * 5) * (g - BELL < 0.6 ? 1 : 0) : 0,
  };
}

const SCENE_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  #motes { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 950; pointer-events: none; }
  #dz { position: fixed; left: 0; top: 0; width: 220px; height: 330px; margin: -60px 0 0 -110px; transform-origin: 110px 60px; z-index: 951; pointer-events: none; display: none; }
  #dz.on { display: block; }
  #dz svg { width: 100%; height: 100%; overflow: visible; }
` + TYPIST_CSS;

// the duster: a fan of soft grey ostrich feathers on a wooden handle, drawn around the
// middle of the feathers (110, 60); the handle runs down to the right
const FEATHERS = Array.from({ length: 30 }, (_, i) => {
  const a = (-212 + (i * 227) / 29 + ((i * 53) % 7) - 3) * (Math.PI / 180);
  const len = 58 + ((i * 37) % 31);
  const w = 11 + ((i * 17) % 7);
  const tone = ['#9b9187', '#b8ae9f', '#857b71', '#c9bfb0', '#a89e92'][i % 5];
  const tip = [128 + Math.cos(a) * len, 92 + Math.sin(a) * len];
  const side = [Math.cos(a + Math.PI / 2) * w, Math.sin(a + Math.PI / 2) * w];
  const mid = [128 + Math.cos(a) * len * 0.55, 92 + Math.sin(a) * len * 0.55];
  const f = (n) => n.toFixed(1);
  return `<path d="M128 92Q${f(mid[0] + side[0])} ${f(mid[1] + side[1])} ${f(tip[0])} ${f(tip[1])}Q${f(mid[0] - side[0])} ${f(mid[1] - side[1])} 128 92z" fill="${tone}"/>` +
    `<path d="M128 92L${f(tip[0] * 0.9 + 12.8)} ${f(tip[1] * 0.9 + 9.2)}" stroke="#6e655c" stroke-width="1" opacity=".5"/>`;
}).join('');
const DUSTER_HTML = `<div id="dz"><svg viewBox="0 0 220 330">
  <defs><filter id="dz-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation=".9"/></filter></defs>
  <path d="M128 92L196 318" stroke="#6b4228" stroke-width="13" stroke-linecap="round"/>
  <path d="M125 92L193 318" stroke="#8a5a38" stroke-width="4" stroke-linecap="round" opacity=".6"/>
  <g class="plume"><g filter="url(#dz-soft)">${FEATHERS}</g></g>
  <rect x="116" y="82" width="24" height="24" rx="5" fill="#c9a45c" transform="rotate(-17 128 93)"/>
</svg></div>`;

function pageSetup({ html }) {
  const lib = window.__lib;
  window.__setPresence = lib.hall.setPresence;
  lib.hall.setPresence = () => {};
  document.body.insertAdjacentHTML('beforeend', html);
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
  const canvas = document.getElementById('motes');
  const ctx = canvas.getContext('2d');
  window.__frame = ({ hall, dz, motes, typist }) => {
    if (hall) {
      lib.hall.teleport(hall.x);
      lib.hall.setCloseUp(hall.zoom, hall.focusY);
    }
    const el = document.getElementById('dz');
    el.classList.toggle('on', Boolean(dz));
    if (dz) {
      el.style.transform = `translate(${dz.x.toFixed(1)}px, ${dz.y.toFixed(1)}px) rotate(${dz.rot.toFixed(1)}deg)`;
      // the feathers trail behind the movement, and flatten a little when it's fast
      el.querySelector('.plume').setAttribute('transform', `rotate(${dz.lag.toFixed(1)} 128 92) translate(128 92) scale(1 ${dz.squash.toFixed(3)}) translate(-128 -92)`);
    }
    const w = (canvas.width = canvas.clientWidth * devicePixelRatio);
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.clearRect(0, 0, w, canvas.height);
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);
    for (const m of motes ?? []) {
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 2.4);
      g.addColorStop(0, `rgba(255,236,190,${m.a})`);
      g.addColorStop(0.4, `rgba(255,214,150,${m.a * 0.5})`);
      g.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    if (typist) window.__typist(typist);
    else if (document.getElementById('tw').dataset.ready) window.__typist({ on: false });
  };
}

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-04T21:15:00'),
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: false, time: 'night', rain: true, pace: 1, demo: 0 },
    storage: { 'ql.local.library': { version: 1, books: [] } }, // the story shelves are still empty
  });
  await page.addStyleTag({ content: KIN_CSS + SCENE_CSS });
  await page.evaluate(`window.__typist = ${typistFrame.toString()}`);
  await page.evaluate(pageSetup, { html: `<canvas id="motes"></canvas>${DUSTER_HTML}${TYPIST_HTML}` });

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

  async function cut(until, { setup, frame, events = [] }) {
    await settle();
    if (setup) await setup();
    const queue = [...events].sort((a, c) => a.at - c.at);
    while (n < Math.round(until * FPS)) {
      const g = n / FPS;
      while (queue.length && queue[0].at <= g) await queue.shift().run();
      await js((f) => window.__frame(f), frame(g));
      await film.shoot();
    }
  }
  const life = await js(() => window.__lib.hall.spot('shelf:life').cx);
  const letters = await js(() => window.__lib.hall.spot('shelf:letters').cx);
  // where a shelf board (world y) lands on screen for a camera
  const screenY = (worldY, zoom, focusY) => 480 + (worldY - focusY) * 1.6 * zoom;
  const dusterPose = (g, boardY) => {
    const d = duster(g);
    return {
      x: d.x,
      y: boardY - 34 - d.lift,
      rot: -8 + clamp(d.vx / 60, -9, 9),
      lag: clamp(-d.vx / 45, -14, 14),
      squash: 1 - 0.06 * Math.min(1, Math.abs(d.vx) / 900),
    };
  };

  // 1 · the hook: dusting an empty shelf, the motes already in the air on frame 0
  const cam1 = { x: life, zoom: 2.4, focusY: 300 };
  await cut(b(4), {
    setup: async () => {
      await say('making room|for a *new book.*', { step: 0 });
      await settle();
    },
    frame: (g) => {
      const zoom = tween(g, 0, b(4), 2.4, 2.5, easeOut);
      const board = screenY(278, zoom, cam1.focusY);
      return { hall: { ...cam1, zoom }, dz: dusterPose(g, board), motes: motes(g, board) };
    },
  });

  // 2 · along the shelves
  await cut(b(8), {
    frame: (g) => {
      const x = tween(g, b(4), b(8), life + 20, letters - 20);
      const board = screenY(342, 1.8, 300);
      return { hall: { x, zoom: 1.8, focusY: 300 }, dz: dusterPose(g, board), motes: motes(g, board) };
    },
    events: [{ at: b(4), run: () => say('it isn’t finished|*yet.*', { step: 0.06 }) }],
  });

  // 3 · the writer at the typewriter, from behind
  await cut(b(13), {
    frame: (g) => ({ typist: { on: true, t: g, ...typing(g), cam: { scale: tween(g, b(8), b(13), 1.0, 1.07), x: 0, y: tween(g, b(8), b(13), 0, 18) } } }),
    events: [{ at: b(8), run: () => say('someone is|*still writing it.*', { step: 0.06 }) }],
  });

  // 4 · over their shoulder: the page is hidden by their head
  await cut(b(17), {
    frame: (g) => ({ typist: { on: true, t: g, ...typing(g), cam: { scale: tween(g, b(13), b(17), 1.36, 1.46), x: 0, y: tween(g, b(13), b(17), 150, 170) } } }),
    events: [{ at: b(13), run: () => say('no peeking.|*not yet.*', { step: 0.06 }) }],
  });

  // 5 · the dusted shelf, waiting; the last of the dust settling
  await cut(LENGTH, {
    frame: (g) => {
      const zoom = tween(g, b(17), LENGTH, 2.0, 2.3);
      const board = screenY(278, zoom, 300);
      return { hall: { x: life, zoom, focusY: 300 }, motes: motes(g - b(17) + 1.2, board, 0.9).map((m) => ({ ...m, a: m.a * 0.55 })) };
    },
    events: [
      { at: b(17), run: () => say('a new book is|*coming soon.*', { kicker: 'the quiet library', step: 0.06 }) },
      { at: b(19.5), run: () => say('*follow* so you|don’t miss it.', { kicker: 'the quiet library', step: 0.06 }) },
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
