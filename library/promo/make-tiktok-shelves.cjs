// TikTok #2: "the shelves grow fuller". Seven shots, each with its own camera
// move (push-ins, pull-backs, a focus pull, a long tracking pan), joined with
// crossfades and a fade through black, cut to the bar lines of the "shelves"
// lo-fi preset (72 BPM, so one bar = 3.333 s).
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-shelves.wav 43 shelves
//   node promo/make-tiktok-shelves.cjs promo/lofi-shelves.wav promo/quiet-library-shelves.mp4

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-shelves.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-shelves.cjs <lofi-shelves.wav> [out.mp4]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-shelves-'));
const B = (60 / 72) * 4; // one bar
const LENGTH = 42.5;

// -- the books that will fill the shelves ------------------------------------
// Only spines are ever shown, so titles here just set each spine's width.
const GENRES = ['life', 'letters', 'poetry', 'essays', 'literary', 'romance', 'mystery', 'fantasy', 'scifi', 'horror', 'humor', 'fables'];
let seed = 99;
const rand = () => ((seed = (Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x6d2b79f5) >>> 0) / 4294967296);
const BOOKS = Object.fromEntries(GENRES.map((g) => [g, Array.from({ length: 80 }, (_, i) => ({
  id: `${g}-${i}`, genre: g, reads: 0, title: 'x'.repeat(6 + Math.floor(rand() * 26)),
}))]));
const shelf = (g, n) => ({ id: g, books: BOOKS[g].slice(0, n) });

// -- easing -------------------------------------------------------------------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2); // in-out cubic
const tween = (g, t0, t1, a, b, fn = ease) => a + (b - a) * fn(clamp((g - t0) / (t1 - t0)));

// -- the look of the overlay ---------------------------------------------------
const FILM_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble { display: none !important; }
  #world { will-change: auto !important; } /* re-rasterise every frame, so close-ups stay sharp */
  @property --sky-top { syntax: '<color>'; inherits: true; initial-value: #0b1530; }
  @property --sky-bottom { syntax: '<color>'; inherits: true; initial-value: #26365a; }
  @property --city { syntax: '<color>'; inherits: true; initial-value: #0a1020; }
  :root { transition: --sky-top .8s ease, --sky-bottom .8s ease, --city .8s ease; }
  #tt-dust { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 30; pointer-events: none; mix-blend-mode: screen; }
  #tt-shade { position: fixed; left: 0; right: 0; top: 0; height: 270px; z-index: 998; pointer-events: none;
    background: linear-gradient(rgba(14,9,6,.6), rgba(14,9,6,.22) 58%, rgba(14,9,6,0)); opacity: 0; transition: opacity .7s; }
  #tt-shade.on { opacity: 1; }
  .tt-cap { position: fixed; left: 5%; right: 5%; top: 84px; z-index: 999; text-align: center; pointer-events: none;
    animation: tt-in .9s cubic-bezier(.2,.7,.2,1) both; }
  .tt-cap.out { animation: tt-out .6s ease both; }
  .tt-kicker { font: 600 29px/1 'Caveat', cursive; color: #e9c98a; margin-bottom: 6px; text-shadow: 0 2px 10px rgba(0,0,0,.85); }
  .tt-line { font: italic 600 35px/1.14 'Cormorant Garamond', serif; color: #fbf1dc; letter-spacing: .01em;
    text-shadow: 0 2px 16px rgba(0,0,0,.9), 0 0 3px rgba(0,0,0,.7); }
  #tt-count { position: fixed; left: 50%; top: 69%; z-index: 999; transform: translate(-50%, -50%); text-align: center; pointer-events: none;
    padding: 12px 26px 14px; border-radius: 22px; background: rgba(22,14,9,.62); backdrop-filter: blur(4px);
    box-shadow: 0 0 0 1px rgba(233,201,138,.25), 0 10px 30px rgba(0,0,0,.45); opacity: 0; transition: opacity .6s; }
  #tt-count.on { opacity: 1; }
  #tt-count.high { top: 27%; }
  #tt-count b { display: block; font: 700 58px/1 'Cormorant Garamond', serif; color: #fbe7b8; font-variant-numeric: lining-nums tabular-nums;
    text-shadow: 0 0 22px rgba(255,214,140,.35); }
  #tt-count span { font: 600 25px/1 'Caveat', cursive; color: #e9c98a; }
  @keyframes tt-in { from { opacity: 0; transform: translateY(12px); filter: blur(6px); } }
  @keyframes tt-out { to { opacity: 0; transform: translateY(-8px); filter: blur(6px); } }
  #tt-end { position: fixed; inset: 0; z-index: 997; display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; gap: 4px; padding: 0 8% 150px; color: #fbf1dc;
    background: radial-gradient(ellipse at 50% 40%, rgba(22,14,9,.5), rgba(10,6,4,.9) 72%);
    backdrop-filter: blur(5px); animation: tt-fade 1.4s ease both; }
  #tt-end .l1 { font: 600 41px/1.12 'Caveat', cursive; color: #fbf1dc; animation: tt-in 1s .1s both; }
  #tt-end .l2 { font: italic 600 52px/1.1 'Cormorant Garamond', serif; color: #e9c98a; margin-top: 12px; animation: tt-in 1s .6s both;
    text-shadow: 0 0 26px rgba(255,214,140,.3); }
  #tt-end .orn { font-size: 24px; color: rgba(233,201,138,.75); margin: 24px 0 8px; animation: tt-in 1s 1s both; }
  #tt-end h1 { margin: 0; font: 700 56px/1 'Cormorant Garamond', serif; text-shadow: 0 0 30px rgba(255,214,140,.25); animation: tt-in 1s 1.1s both; }
  #tt-end .soon { margin-top: 16px; font: 500 17px/1 'EB Garamond', serif; letter-spacing: .32em; text-transform: uppercase;
    color: rgba(251,241,220,.8); animation: tt-in 1s 1.4s both; }
  @keyframes tt-fade { from { opacity: 0; } }
`;

// Runs inside the page: overlays, dust in the lamplight, and the per-frame camera.
function pageSetup() {
  document.body.insertAdjacentHTML('beforeend',
    '<canvas id="tt-dust"></canvas><div id="tt-shade"></div><div id="tt-count"><b>1</b><span>story on the shelves</span></div>');
  const lib = window.__lib;
  // The film decides who's in the library (the app's own presence updates are ignored).
  window.__setPresence = lib.hall.setPresence;
  lib.hall.setPresence = () => {};

  window.__caption = (html, kicker = '') => {
    for (const old of document.querySelectorAll('.tt-cap:not(.out)')) {
      old.classList.add('out');
      setTimeout(() => old.remove(), 700);
    }
    document.getElementById('tt-shade').classList.toggle('on', Boolean(html));
    if (!html) return;
    const box = document.createElement('div');
    box.className = 'tt-cap';
    box.innerHTML = `${kicker ? `<div class="tt-kicker">${kicker}</div>` : ''}<div class="tt-line">${html}</div>`;
    document.body.append(box);
  };

  // Dust motes drifting through the lamplight: a pure function of time, so every run matches.
  const canvas = document.getElementById('tt-dust');
  const ctx = canvas.getContext('2d');
  let s = 1234;
  const r = () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x6d2b79f5) >>> 0) / 4294967296);
  const motes = Array.from({ length: 70 }, () => ({
    x: r(), y: r(), vx: (r() - 0.5) * 10, vy: -2 - r() * 9, size: 0.7 + r() * 2.2, ph: r() * 6.28, tw: 0.6 + r() * 1.6, sway: 4 + r() * 10,
  }));
  window.__dust = (t, strength) => {
    const w = (canvas.width = canvas.clientWidth * devicePixelRatio);
    const h = (canvas.height = canvas.clientHeight * devicePixelRatio);
    ctx.clearRect(0, 0, w, h);
    if (!strength) return;
    const k = devicePixelRatio;
    for (const m of motes) {
      const x = ((((m.x * w) / k + m.vx * t + Math.sin(t * 0.4 + m.ph) * m.sway) % (w / k)) + w / k) % (w / k);
      const y = ((((m.y * h) / k + m.vy * t) % (h / k)) + h / k) % (h / k);
      const a = strength * (0.12 + 0.4 * (0.5 + 0.5 * Math.sin(t * m.tw + m.ph))) * (0.35 + 0.65 * Math.sin(Math.PI * (y / (h / k))));
      const g = ctx.createRadialGradient(x * k, y * k, 0, x * k, y * k, m.size * 3 * k);
      g.addColorStop(0, `rgba(255,228,170,${a})`);
      g.addColorStop(1, 'rgba(255,228,170,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x * k, y * k, m.size * 3 * k, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  window.__frame = ({ x, zoom, focusY, blur, t, dust, count, countHigh }) => {
    lib.hall.teleport(x);
    lib.hall.setCloseUp(zoom, focusY);
    document.getElementById('viewport').style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
    window.__dust(t, dust);
    const box = document.getElementById('tt-count');
    box.classList.toggle('on', count != null);
    box.classList.toggle('high', countHigh);
    if (count != null) {
      box.querySelector('b').textContent = Math.round(count).toLocaleString('en');
      box.querySelector('span').textContent = Math.round(count) === 1 ? 'story on the shelves' : 'stories on the shelves';
    }
  };
}

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-01T22:40:00'),
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: false, time: 'night', rain: true, pace: 1, demo: 0 },
  });
  await page.addStyleTag({ content: FILM_CSS });
  await page.evaluate(pageSetup);

  let dir = null;
  let n = 0;
  const film = createFilm(page, async (buf) => {
    n++;
    fs.writeFileSync(path.join(dir, `${String(n).padStart(5, '0')}.jpg`), buf);
  });
  const js = (fn, arg) => page.evaluate(fn, arg);
  const caption = (html, kicker) => js(([h, k]) => window.__caption(h, k), [html, kicker]);
  const shelves = (list, quiet = false) => js(([l, q]) => window.__lib.hall.updateShelves(l, { quiet: q }), [list, quiet]);
  const presence = (zones) => js((z) => window.__setPresence({ total: 1 + Object.values(z).reduce((a, b) => a + b, 0), zones: z }, 'hall'), zones);

  // A shot: from `start` to `end` on the global timeline, with a camera and timed events.
  async function shot(name, { start, end, setup, camera, events = [], dust = 1, count = () => null, countHigh = false }) {
    dir = path.join(WORK, name);
    fs.mkdirSync(dir);
    n = 0;
    if (setup) await setup();
    const queue = [...events].sort((a, b) => a.at - b.at);
    const frames = Math.round((end - start) * FPS);
    for (let i = 0; i < frames; i++) {
      const g = start + i / FPS;
      while (queue.length && queue[0].at <= g) await queue.shift().run();
      const c = camera(g);
      await js((f) => window.__frame(f), { x: c.x, zoom: c.zoom, focusY: c.focusY, blur: c.blur ?? 0, t: g, dust: typeof dust === 'function' ? dust(g) : dust, count: count(g), countHigh });
      await film.shoot();
    }
    console.log(`  shot ${name}: ${frames} frames`);
    return { name, frames };
  }

  const writingX = await js(() => window.__lib.hall.spot('writing').cx);
  const empty = GENRES.map((g) => shelf(g, 0));

  // Transitions sit on bar lines; each shot runs half a transition past its bar line.
  const T = { fade: 0.8, black: 1.0 };
  const shots = [];

  // 1 · It starts with one book: a focus pull and a slow pull-back from a single spine.
  shots.push(await shot('a', {
    start: 0, end: 2 * B + T.fade / 2,
    setup: async () => { await shelves(empty, true); await presence({}); },
    camera: (g) => ({
      x: tween(g, 0.4, 7, 1292, 1365), zoom: tween(g, 0.4, 7, 2.7, 1.12), focusY: tween(g, 0.4, 7, 186, 300),
      blur: tween(g, 0.05, 1.4, 4.5, 0),
    }),
    events: [
      { at: 0.0, run: () => caption('it starts with one book.', 'watch this shelf') },
      { at: 0.7, run: () => shelves([shelf('life', 1)]) },
      { at: 6.1, run: () => caption(null) },
    ],
  }));

  // 2 · Someone is writing in the room at the back: a slow push-in on the glowing door.
  shots.push(await shot('b', {
    start: 2 * B - T.fade / 2, end: 4 * B + T.fade / 2,
    setup: () => presence({ 'writing:1': 1 }),
    camera: (g) => ({ x: writingX, zoom: tween(g, 6.3, 13.8, 1.02, 1.32), focusY: tween(g, 6.3, 13.8, 270, 225) }),
    events: [
      { at: 7.0, run: () => caption('someone writes a story<br>in a room at the back…') },
      { at: 12.6, run: () => caption(null) },
    ],
  }));

  // 3 · …and it finds a place on the shelf. Books arrive, glowing, faster and faster.
  const arrivals = [14.1, 15.0, 15.8, 16.5, 17.1, 17.6, 18.05, 18.45, 18.8, 19.1, 19.4, 19.7];
  shots.push(await shot('c', {
    start: 4 * B - T.fade / 2, end: 6 * B + T.black / 2,
    setup: async () => { await presence({}); await shelves([shelf('life', 1)], true); },
    camera: (g) => ({ x: tween(g, 12.9, 20.5, 1372, 1362), zoom: tween(g, 12.9, 20.5, 1.02, 1.22), focusY: tween(g, 12.9, 20.5, 300, 270) }),
    events: [
      { at: 13.6, run: () => caption('…and it finds a place<br>on a shelf.') },
      ...arrivals.map((at, i) => ({ at, run: () => shelves([shelf('life', 2 + i)]) })),
      { at: 19.2, run: () => caption(null) },
    ],
    count: (g) => (g < 13.9 ? null : 1 + arrivals.filter((a) => a <= g).length),
  }));

  // 4 · Night after night: Ink's window, the sky turning over (after a fade through black).
  shots.push(await shot('d', {
    start: 6 * B - T.black / 2, end: 7 * B + T.fade / 2,
    setup: async () => { await js(() => window.__lib.setTimeOfDay('night')); },
    camera: (g) => ({ x: 470, zoom: tween(g, 19.5, 23.8, 1.18, 1.34), focusY: tween(g, 19.5, 23.8, 250, 240) }),
    events: [
      { at: 20.0, run: () => caption('night after night,') },
      { at: 20.45, run: () => js(() => window.__lib.setTimeOfDay('dawn')) },
      { at: 21.1, run: () => js(() => window.__lib.setTimeOfDay('day')) },
      { at: 21.85, run: () => js(() => window.__lib.setTimeOfDay('dusk')) },
      { at: 22.6, run: () => js(() => window.__lib.setTimeOfDay('night')) },
      { at: 23.0, run: () => caption(null) },
    ],
    dust: 0.6,
    countHigh: true, // keep Ink in view
    count: (g) => tween(g, 20.0, 23.4, 13, 64, (t) => t),
  }));

  // 5 · More people write: letters and poetry fill up in bursts, in time with the hats.
  const burst = [];
  for (let t = 23.9, i = 0; t < 29.9; t += 0.104 * (i % 3 === 2 ? 2 : 1), i++) burst.push({ t, genre: i % 2 ? 'poetry' : 'letters' });
  const fill = { letters: 10, poetry: 6 };
  shots.push(await shot('e', {
    start: 7 * B - T.fade / 2, end: 9 * B + T.fade / 2,
    setup: async () => {
      fill.letters = 10;
      fill.poetry = 6;
      await shelves(GENRES.map((g) => shelf(g, g === 'life' ? 34 : g === 'letters' ? 10 : g === 'poetry' ? 6 : 0)), true);
    },
    camera: (g) => ({ x: tween(g, 23.0, 30.3, 1640, 1960), zoom: tween(g, 23.0, 30.3, 1.3, 1.02), focusY: tween(g, 23.0, 30.3, 280, 300) }),
    events: [
      { at: 23.7, run: () => caption('more people write.<br>the shelves grow fuller.') },
      ...burst.map(({ t, genre }) => ({ at: t, run: () => { fill[genre] += 1; return shelves([shelf(genre, fill[genre])]); } })),
      { at: 29.3, run: () => caption(null) },
    ],
    count: (g) => tween(g, 23.4, 30.0, 64, 431, (t) => t * t * (3 - 2 * t)),
  }));

  // 6 · The reveal: every shelf full, readers in the armchairs, one long tracking shot.
  const late = [];
  for (let t = 30.2, i = 0; t < 36.8; t += 0.33, i++) late.push({ t, genre: GENRES[3 + (i % 9)] });
  const full = Object.fromEntries(GENRES.map((g) => [g, 64]));
  shots.push(await shot('f', {
    start: 9 * B - T.fade / 2, end: 11 * B + T.fade / 2,
    setup: async () => {
      await shelves(GENRES.map((g) => shelf(g, 64)), true);
      await presence({ reading: 3 });
    },
    camera: (g) => ({ x: tween(g, 29.6, 37.1, 2330, 4720), zoom: tween(g, 29.6, 37.1, 1.0, 1.1), focusY: 300 }),
    events: [
      { at: 30.4, run: () => caption('until every shelf<br>is full of someone.') },
      ...late.map(({ t, genre }) => ({ at: t, run: () => { full[genre] = Math.min(76, full[genre] + 1); return shelves([shelf(genre, full[genre])]); } })),
      { at: 35.9, run: () => caption(null) },
    ],
    dust: 0.8,
    count: (g) => tween(g, 29.9, 36.3, 431, 1284),
  }));

  // 7 · Add yours: a push-in on a full bookcase, and the end card.
  shots.push(await shot('g', {
    start: 11 * B - T.fade / 2, end: LENGTH,
    setup: () => presence({ reading: 3 }),
    camera: (g) => ({ x: tween(g, 36.2, LENGTH, 4060, 4050), zoom: tween(g, 36.2, LENGTH, 1.08, 1.42), focusY: tween(g, 36.2, LENGTH, 300, 285) }),
    events: [
      { at: 36.8, run: () => js(() => document.body.insertAdjacentHTML('beforeend', `<div id="tt-end">
        <div class="l1">every story makes the library<br>a little less empty.</div>
        <div class="l2">add yours.</div><div class="orn">❦</div>
        <h1>The Quiet Library</h1><div class="soon">opening soon</div></div>`)) },
    ],
  }));

  await browser.close();

  // -- assemble: crossfades on the bar lines, the warm grade, the music -----------
  const inputs = shots.flatMap((s) => ['-framerate', String(FPS), '-i', path.join(WORK, s.name, '%05d.jpg')]);
  const kinds = ['fade', 'fade', 'fadeblack', 'fade', 'fade', 'fade'];
  const boundaries = [2 * B, 4 * B, 6 * B, 7 * B, 9 * B, 11 * B];
  let graph = '';
  let last = '[0:v]';
  kinds.forEach((kind, i) => {
    const d = kind === 'fadeblack' ? T.black : T.fade;
    const label = `[x${i}]`;
    graph += `${last}[${i + 1}:v]xfade=transition=${kind}:duration=${d}:offset=${(boundaries[i] - d / 2).toFixed(3)}${label};`;
    last = label;
  });
  const grade = [
    'format=gbrp', 'eq=contrast=0.96:saturation=0.92:gamma=1.04',
    'colorbalance=rs=0.04:gs=0.01:bs=-0.05:rm=0.05:bm=-0.04:rh=0.03:bh=-0.03',
    'split[a][b];[b]gblur=sigma=18[g];[a][g]blend=all_mode=screen:all_opacity=0.15',
    'vignette=angle=PI/4.4', 'noise=alls=5:allf=t+u',
    'fade=t=in:st=0:d=0.25', `fade=t=out:st=${LENGTH - 1.1}:d=1.1`, 'format=yuv420p',
  ].join(',');
  graph += `${last}${grade}[v];[${shots.length}:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,alimiter=limit=0.72:attack=1:release=80:level=disabled,afade=t=out:st=${LENGTH - 1.4}:d=1.4[a]`;

  const res = spawnSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error', ...inputs, '-i', audio,
    '-filter_complex', graph, '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-maxrate', '14M', '-bufsize', '28M',
    '-profile:v', 'high', '-level', '4.2', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k',
    '-t', String(LENGTH), '-movflags', '+faststart', out,
  ], { stdio: 'inherit' });
  fs.rmSync(WORK, { recursive: true, force: true });
  if (res.status !== 0) process.exit(res.status ?? 1);
  console.log(`done: ${out}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
