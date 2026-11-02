// TikTok #5: the making of the library, as a fast devlog montage.
// Everything shown is a real part of how it was built: the idea list (the
// original brief), the hall's real layout, the real character art going from
// outline to colour, the world assembling layer by layer, the real code that
// makes Ink's eyes follow you, three real bugs from along the way, and the real
// test run. No claims about who typed what.
// Cut to the "making" lo-fi preset (88 BPM: one beat = 0.682 s, one bar = 2.727 s).
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-making.wav 31.5 making
//   node promo/make-tiktok-making.cjs promo/lofi-making.wav promo/quiet-library-making.mp4

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, kin, KIN_CSS, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-making.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-making.cjs <lofi-making.wav> [out.mp4]');
  process.exit(1);
}
const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-making-'));
const BEAT = 60 / 88;
const BAR = 4 * BEAT;
const at = (bar, beat = 0) => bar * BAR + beat * BEAT;
const LENGTH = 31.0;
const EARLY_AVATAR = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, 'making', 'ink-avatar-early.png')).toString('base64')}`;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const tween = (g, t0, t1, a, b, fn = ease) => a + (b - a) * fn(clamp((g - t0) / (t1 - t0)));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// -- the real code, from the real file --------------------------------------------
const catSrc = fs.readFileSync(path.join(ROOT, 'public', 'js', 'cat.js'), 'utf8').split('\n');
const FIRST = catSrc.findIndex((l) => l.includes('Eyes follow the visitor'));
const CODE = catSrc.slice(FIRST, FIRST + 7);
function highlight(line) {
  if (line.trim().startsWith('//')) return `<span class="c">${esc(line)}</span>`;
  const tokens = line.split(/(`[^`]*`|'[^']*'|\b(?:const|let|return|Math)\b|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_]+(?=\())/g);
  return tokens.map((t) => {
    if (!t) return '';
    if (/^[`']/.test(t)) return `<span class="s">${esc(t)}</span>`;
    if (/^(const|let|return)$/.test(t)) return `<span class="kw">${t}</span>`;
    if (t === 'Math') return `<span class="ty">${t}</span>`;
    if (/^\d/.test(t)) return `<span class="n">${t}</span>`;
    if (/^[a-zA-Z_]+$/.test(t)) return `<span class="f">${t}</span>`;
    return esc(t);
  }).join('');
}
// Wrap every visible character so the code can be "typed" with CSS delays.
function typed(html, start, perChar) {
  let i = 0;
  return html.replace(/(<[^>]+>)|(&[a-z]+;|[^<&])/g, (m, tag, ch) => {
    if (tag) return tag;
    return `<i style="animation-delay:${(start + i++ * perChar).toFixed(3)}s">${ch}</i>`;
  });
}

// The same staged Letters titles as video 4 (the library isn't open yet).
const STAGED_LETTERS = [['Dear Mum, I Got the Job', 167], ['A Postcard I Never Sent', 98], ['Notes From the Night Shift', 76],
  ['Things I Should Have Said at the Station', 61], ['Diary of a First Winter Away', 44], ['For My Brother, Who Is Fine Now', 39],
  ['To My Seventeen-Year-Old Self', 27], ['To the Neighbour With the Piano', 18], ['Thank You, Bus Driver', 9], ['Before I Forget Your Voice', 3]];

// -- the hall's real layout, as a blueprint ------------------------------------------
const SHELVES = [['life stories', 1240], ['letters', 1530], ['poetry', 1820], ['essays', 2440], ['literary', 2730], ['romance', 3020],
  ['mystery', 3640], ['fantasy', 3930], ['sci-fi', 4220], ['horror', 4840], ['humour', 5130], ['fables', 5420]];
const NOOKS = [2110, 3310, 4510, 5710];
const HALL = 6400;
function blueprintStrip(from, to, d0) {
  const els = [];
  let d = d0;
  const ln = (shape) => els.push(shape.replace('/>', ` pathLength="1" class="ln" style="animation-delay:${(d += 0.05).toFixed(2)}s"/>`));
  const label = (x, y, text) => els.push(`<text x="${x}" y="${y}" class="lb" style="animation-delay:${(d + 0.15).toFixed(2)}s">${text}</text>`);
  ln(`<path d="M${from} 482H${to}"/>`);
  ln(`<path d="M${from} 28H${to}"/>`);
  if (from < 300) { ln('<path d="M30 482V90a90 60 0 0 1 180 0V482"/>'); label(40, 70, 'street door'); }
  if (from < 600) { ln('<rect x="290" y="110" width="260" height="300"/>'); ln('<circle cx="500" cy="330" r="34"/>'); label(300, 95, 'window + ink'); }
  if (from < 1100) { ln('<rect x="620" y="320" width="400" height="170"/>'); ln('<circle cx="820" cy="230" r="44"/>'); label(650, 300, 'front desk · mrs. wren'); }
  if (from < 1200) { ln('<rect x="1040" y="240" width="122" height="250"/>'); ln('<circle cx="1101" cy="152" r="38"/>'); }
  for (const [name, x] of SHELVES) {
    if (x < from || x > to) continue;
    ln(`<rect x="${x}" y="150" width="250" height="340"/>`);
    ln(`<path d="M${x} 216H${x + 250}M${x} 282H${x + 250}M${x} 348H${x + 250}M${x} 414H${x + 250}"/>`);
    label(x + 8, 135, name);
  }
  for (const x of NOOKS) {
    if (x < from || x > to) continue;
    ln(`<path d="M${x + 96} 480V250q0-50 54-50t54 50V480M${x + 78} 480V380h144V480"/>`);
    ln(`<path d="M${x + 236} 480V170M${x + 206} 170l10-40h40l10 40z"/>`);
    label(x + 70, 160, 'armchair');
  }
  if (to > 6000) { ln('<rect x="6040" y="90" width="300" height="400"/>'); ln('<path d="M6190 90V490"/>'); label(6045, 75, 'writing rooms'); }
  for (let lx = 700; lx < HALL - 100; lx += 560) if (lx >= from && lx <= to) ln(`<path d="M${lx} 28V95M${lx - 26} 120a26 26 0 0 1 52 0z"/>`);
  return `<svg viewBox="${from} 0 ${to - from} 600" preserveAspectRatio="xMidYMid meet">${els.join('')}</svg>`;
}

const SCENE_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  #world { will-change: auto !important; }
  #tt-shade { position: fixed; left: 0; right: 0; top: 0; height: 300px; z-index: 990; pointer-events: none;
    background: linear-gradient(rgba(14,9,6,.6), rgba(14,9,6,.2) 60%, rgba(14,9,6,0)); }
  #mk { position: fixed; inset: 0; z-index: 950; pointer-events: none; }
  #mk:empty { display: none; }
  @keyframes write { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  @keyframes fadein { from { opacity: 0; } }
  @keyframes popin { 0% { opacity: 0; transform: scale(.6); } 60% { opacity: 1; transform: scale(1.08); } 100% { transform: none; } }

  /* the notebook */
  .desk { position: absolute; inset: 0; background:
      radial-gradient(ellipse at 18% 8%, rgba(255,214,150,.35), transparent 55%),
      repeating-linear-gradient(90deg, #3a2419 0 3px, #4a2f21 3px 60px, #41291d 60px 63px, #4f3324 63px 140px); }
  .nb { position: absolute; left: 7%; right: 7%; top: 25%; bottom: 7%; transform: rotate(-2deg); border-radius: 4px;
    background: repeating-linear-gradient(#f7f0e2 0 33px, #c9d6e8 33px 34px) 0 70px / 100% 100% no-repeat, #f7f0e2;
    box-shadow: 0 30px 60px rgba(0,0,0,.55); padding: 26px 26px 0 64px; }
  .nb::before { content: ''; position: absolute; left: 46px; top: 0; bottom: 0; width: 2px; background: rgba(200,80,80,.5); }
  .nb .t { font: 700 44px/1 'Caveat', cursive; color: #2b3a55; animation: write .9s steps(18) both; }
  .nb ul { list-style: none; margin: 22px 0 0; padding: 0; }
  .nb li { font: 600 30px/34px 'Caveat', cursive; color: #2b3a55; animation: write .38s steps(10) both; }
  .nb li::before { content: '– '; }
  .nb .ring { position: absolute; right: -30px; bottom: 60px; width: 150px; height: 150px; border-radius: 50%;
    border: 9px solid rgba(120,70,30,.18); box-shadow: inset 0 0 0 2px rgba(120,70,30,.12); }
  .nb svg { position: absolute; right: 22px; bottom: 110px; width: 120px; height: 110px; }
  .nb svg path { fill: none; stroke: #2b3a55; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw .7s ease forwards; }
  .pencil { position: absolute; width: 210px; height: 22px; border-radius: 3px; transform-origin: 0 50%;
    background: linear-gradient(90deg, #2b2622 0 9px, #e8c27a 9px 34px, #f2b84b 34px 190px, #d98f8f 190px); box-shadow: 0 10px 18px rgba(0,0,0,.35); }

  /* the blueprint */
  .bp { position: absolute; inset: 0; background:
      linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px) 0 0 / 20px 20px,
      linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px) 0 0 / 20px 20px, #17345c; }
  .bp .hd { position: absolute; left: 6%; right: 6%; top: 27.5%; font: 600 13px/1.4 ui-monospace, Menlo, monospace; color: #cfe3ff; letter-spacing: .12em; animation: fadein .3s both; }
  .bp .strip { position: absolute; left: 4%; right: 4%; height: 150px; }
  .bp svg { width: 100%; height: 100%; overflow: visible; }
  .bp .ln { fill: none; stroke: #e8f1ff; stroke-width: 7; stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw .55s ease forwards; vector-effect: non-scaling-stroke; }
  .bp svg .ln { stroke-width: 1.6px; }
  .bp .lb { font: 600 46px ui-monospace, Menlo, monospace; fill: #9fc6ff; opacity: 0; animation: fadein .3s forwards; }
  .bp .dim { position: absolute; left: 6%; right: 6%; bottom: 13%; font: 600 14px ui-monospace, Menlo, monospace; color: #cfe3ff; text-align: center;
    border-top: 1.5px solid #cfe3ff; padding-top: 6px; animation: fadein .4s 1.6s both; }

  /* the design canvas */
  .ds { position: absolute; inset: 0; background: radial-gradient(#d6d2cc 1px, transparent 1px) 0 0 / 18px 18px, #ebe8e3; }
  .ds .bar { position: absolute; left: 0; right: 0; top: 268px; height: 40px; background: #26262b; color: #ddd; display: flex; align-items: center; gap: 14px;
    padding: 0 14px; font: 500 13px system-ui, sans-serif; }
  .ds .bar i { width: 18px; height: 18px; border-radius: 4px; background: #44444c; display: inline-block; }
  .ds .bar i.on { background: #3b7bff; }
  .ds .board { position: absolute; background: #fff; box-shadow: 0 4px 18px rgba(0,0,0,.12); }
  .ds .board .nm { position: absolute; left: 0; top: -20px; font: 500 12px system-ui, sans-serif; color: #6a665f; }
  .ds .art { position: absolute; inset: 10px; }
  .ds .art > div { position: absolute; inset: 0; }
  .ds .art svg { width: 100%; height: 100%; }
  .ds .outline svg * { fill: none !important; stroke: #3b7bff !important; stroke-width: 1.2px !important; vector-effect: non-scaling-stroke; filter: none !important; }
  .ds .outline { animation: outline-out .5s 1.1s forwards; }
  .ds .fill { opacity: 0; animation: fill-in .6s 1.0s forwards; }
  @keyframes outline-out { to { opacity: .18; } }
  @keyframes fill-in { to { opacity: 1; } }
  .ds .sel { position: absolute; border: 1.5px solid #3b7bff; animation: fadein .2s .5s both; }
  .ds .sel b { position: absolute; width: 9px; height: 9px; background: #fff; border: 1.5px solid #3b7bff; }
  .ds .sw { position: absolute; left: 6%; right: 6%; top: 700px; display: flex; gap: 8px; justify-content: center; }
  .ds .sw div { width: 64px; text-align: center; font: 500 10px ui-monospace, monospace; color: #555; animation: popin .4s both; }
  .ds .sw span { display: block; height: 46px; border-radius: 8px; margin-bottom: 5px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.12); }
  .cursor { position: absolute; width: 26px; height: 30px; z-index: 5; filter: drop-shadow(0 2px 3px rgba(0,0,0,.4)); }

  /* the scene editor around the real hall */
  .mk-wire .item { outline: 1.5px dashed rgba(110,200,255,.9); outline-offset: -1px; }
  .mk-wire .item::after { content: attr(data-mk); position: absolute; left: 2px; top: 2px; font: 600 13px ui-monospace, monospace; color: #9fdcff;
    background: rgba(8,20,34,.8); padding: 1px 5px; border-radius: 3px; }
  .mk-hidden { opacity: 0 !important; }
  .mk-in { animation: mk-drop .5s cubic-bezier(.2,1.4,.4,1) both; }
  @keyframes mk-drop { from { opacity: 0; translate: 0 -40px; } to { opacity: 1; translate: 0 0; } }
  .mk-wire #stage { background: #17171b; }
  .mk-wire #viewport { top: 334px; bottom: 126px; border-top: 1px solid #333; border-bottom: 1px solid #333; }
  .ed-top { position: absolute; left: 0; right: 0; top: 250px; height: 34px; background: #1f1f24; color: #c9c9d1; display: flex; align-items: center;
    gap: 10px; padding: 0 12px; font: 500 13px ui-monospace, monospace; border-bottom: 1px solid #333; }
  .ed-top .dot { width: 10px; height: 10px; border-radius: 50%; background: #e0605a; display: inline-block; }
  .ed-top .dot + .dot { background: #e5b74c; } .ed-top .dot + .dot + .dot { background: #5cc06c; }
  .layers { position: absolute; left: 0; right: 0; top: 284px; height: 50px; background: #1b1b20; padding: 6px 12px;
    color: #c9c9d1; font: 500 12.5px ui-monospace, monospace; display: flex; flex-wrap: wrap; align-content: center; gap: 4px 14px; }
  .layers div { opacity: .35; }
  .layers div.on { opacity: 1; }
  .layers div.on::before { content: '✓ '; color: #5cc06c; }
  .layers div:not(.on)::before { content: '· '; }

  /* the code editor */
  .ed { position: absolute; left: 0; right: 0; top: 0; height: 52%; background: #1e1e1e; color: #d4d4d4; box-shadow: 0 10px 30px rgba(0,0,0,.6); }
  .ed .tabs { display: flex; background: #252526; height: 34px; margin-top: 150px; font: 500 12px system-ui, sans-serif; }
  .ed .tabs span { padding: 9px 14px; color: #8a8a8a; border-right: 1px solid #1e1e1e; }
  .ed .tabs span.on { background: #1e1e1e; color: #fff; border-top: 2px solid #3b7bff; }
  .ed .body { display: flex; padding: 12px 0; font: 500 13.5px/1.5 ui-monospace, Menlo, Consolas, monospace; }
  .ed .gut { width: 44px; text-align: right; padding-right: 12px; color: #6e7681; }
  .ed pre { margin: 0; white-space: pre-wrap; word-break: break-word; flex: 1; padding-right: 12px; font: inherit; }
  .ed pre i { font-style: normal; animation: fadein 0s both; }
  .ed .c { color: #6a9955; } .ed .s { color: #ce9178; } .ed .kw { color: #569cd6; } .ed .n { color: #b5cea8; } .ed .f { color: #dcdcaa; } .ed .ty { color: #4ec9b0; }
  .ed .st { position: absolute; left: 0; right: 0; bottom: 0; height: 24px; background: #3b7bff; color: #fff; font: 500 11px system-ui, sans-serif;
    display: flex; align-items: center; gap: 16px; padding: 0 12px; }
  .pv { position: absolute; left: 12px; top: calc(52% + 10px); padding: 4px 10px; border-radius: 6px; background: rgba(30,30,30,.85); color: #fff;
    font: 600 12px system-ui, sans-serif; }
  .eyes-free .cat .cat-pupils { transform: translate(var(--px), 0.8px) !important; transition: none !important; }

  /* bugs */
  .bug-ring { position: absolute; z-index: 3; }
  .bug-ring ellipse { fill: none; stroke: #ff4d4d; stroke-width: 6; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw .35s .1s ease forwards; }
  .bug-tag { position: absolute; z-index: 3; padding: 5px 10px; border-radius: 8px; background: #ff4d4d; color: #fff; font: 800 15px system-ui, sans-serif;
    transform: rotate(-4deg); animation: popin .3s .25s both; letter-spacing: .04em; }
  .old-1 { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(12,8,5,.92); }
  .old-1 .r { font: 700 44px/1 'Caveat', cursive; color: #f2c46d; margin-bottom: 40px; }
  .old-1 .n { font: 700 260px/0.9 'Cormorant Garamond', serif; color: #fff6e2; font-variant-numeric: oldstyle-nums; }
  .early { position: absolute; inset: 0; background: #14100d; }
  .early img { position: absolute; left: 50%; top: 52%; width: 420px; height: 420px; margin: -210px 0 0 -210px; border-radius: 50%; }

  /* the terminal */
  .term { position: absolute; left: 4%; right: 4%; top: 25%; bottom: 14%; border-radius: 12px; background: #111214; box-shadow: 0 20px 50px rgba(0,0,0,.6);
    overflow: hidden; font: 500 15px/1.65 ui-monospace, Menlo, Consolas, monospace; color: #d6d6d6; }
  .term .tb { height: 32px; background: #2a2b2e; display: flex; align-items: center; gap: 7px; padding: 0 12px; color: #999; font-size: 12px; }
  .term .tb b { width: 11px; height: 11px; border-radius: 50%; background: #e0605a; } .term .tb b + b { background: #e5b74c; } .term .tb b + b + b { background: #5cc06c; }
  .term .tb span { margin-left: 10px; }
  .term pre { margin: 0; padding: 14px 16px; font: inherit; white-space: pre-wrap; }
  .term .l { display: block; animation: fadein 0s both; }
  .term .p { color: #7fd3ff; } .term .ok { color: #5cc06c; } .term .dim { color: #8a8a8a; }
  .term .big { color: #5cc06c; font-weight: 800; }

  /* end */
  #mk-end { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 8px;
    padding: 0 8% 230px; background: radial-gradient(ellipse at 50% 36%, rgba(22,14,9,.68), rgba(10,6,4,.92) 72%); animation: fadein .6s both; }
  #mk-end .a { font: 600 38px/1.15 'Caveat', cursive; color: #fff6e2; animation: popin .5s .1s both; }
  #mk-end h1 { margin: 18px 0 0; font: 700 56px/1 'Cormorant Garamond', serif; color: #fff6e2; text-shadow: 0 0 30px rgba(255,214,140,.3); animation: popin .5s .5s both; }
  #mk-end .s { margin-top: 14px; font: 500 16px/1.7 'EB Garamond', serif; letter-spacing: .28em; text-transform: uppercase; color: rgba(251,241,220,.82); animation: fadein .5s .9s both; }
`;

function pageSetup() {
  document.body.insertAdjacentHTML('beforeend', '<div id="tt-shade"></div><div id="mk"></div>');
  const lib = window.__lib;
  window.__setPresence = lib.hall.setPresence;
  lib.hall.setPresence = () => {};
  for (const n of document.querySelectorAll('#world .item')) n.dataset.mk = n.className.replace('item ', '').split(' ')[0];
  window.__kin = (html) => {
    for (const old of document.querySelectorAll('.tt-kin:not(.out)')) {
      old.remove();
    }
    if (html) document.body.insertAdjacentHTML('beforeend', html);
  };
  window.__scene = (html) => { document.getElementById('mk').innerHTML = html ?? ''; };
  window.__settle = () => {
    for (const a of document.getAnimations()) {
      const t = a.effect?.getComputedTiming?.();
      if (t && Number.isFinite(t.endTime)) try { a.finish(); } catch { /* ignore */ }
    }
  };
  window.__frame = ({ hall, px, el }) => {
    if (hall) {
      lib.hall.teleport(hall.x);
      lib.hall.setCloseUp(hall.zoom, hall.focusY);
    }
    document.documentElement.style.setProperty('--px', `${(px ?? 0).toFixed(2)}px`);
    if (el) {
      const n = document.querySelector(el.sel);
      if (n) {
        n.style.transformOrigin = el.origin ?? '50% 50%';
        n.style.transform = el.css;
      }
    }
  };
}

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-01T22:40:00'),
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: false, time: 'night', rain: true, pace: 1, demo: 0 },
  });
  await page.addStyleTag({ content: KIN_CSS + SCENE_CSS });
  await page.evaluate(pageSetup);

  const dir = path.join(WORK, 'frames');
  fs.mkdirSync(dir);
  let n = 0;
  let lastFrame = null;
  const write = (buf) => {
    n++;
    lastFrame = buf;
    fs.writeFileSync(path.join(dir, `${String(n).padStart(5, '0')}.jpg`), buf);
  };
  const film = createFilm(page, async (buf) => write(buf));
  const js = (fn, arg) => page.evaluate(fn, arg);
  const say = (text, opts) => js((h) => window.__kin(h), text ? kin(text, opts) : null);
  const scene = (html) => js((h) => window.__scene(h), html);
  const quietly = (ms) => page.clock.runFor(ms);
  // Finish whatever is still moving (the last cut's captions, a zoom change) so
  // a new scene starts clean. Scenes are set up after this, so they still play.
  const settle = () => js(() => window.__settle());

  async function cut(until, { setup, camera = () => ({}), events = [], freezeFrom, settle: doSettle = true }) {
    if (doSettle) await settle();
    if (setup) await setup();
    const queue = [...events].sort((a, b) => a.at - b.at);
    while (n < Math.round(until * FPS)) {
      const g = n / FPS;
      if (freezeFrom !== undefined && g >= freezeFrom && lastFrame) {
        write(lastFrame);
        continue;
      }
      while (queue.length && queue[0].at <= g) await queue.shift().run();
      const c = camera(g);
      await js((f) => window.__frame(f), { hall: c.hall ?? null, px: c.px ?? 0, el: c.el ?? null });
      await film.shoot();
    }
  }

  // 0 · the payoff, for half a second: the finished library
  await cut(at(0, 1), { camera: (g) => ({ hall: { x: tween(g, 0, at(0, 1), 600, 640), zoom: 1.08, focusY: 290 } }) });

  // 1 · the hook: a blank page
  const notebook = (title, items, itemStart) => `<div class="desk"><div class="nb">
      <div class="t" style="animation-delay:${title}s">the quiet library</div>
      <ul>${items.map((t, i) => `<li style="animation-delay:${(itemStart + i * 0.36).toFixed(2)}s">${esc(t)}</li>`).join('')}</ul>
      ${items.length ? `<svg viewBox="0 0 120 110"><path pathLength="1" style="animation-delay:${(itemStart + 2.1).toFixed(2)}s" d="M20 95c-4-30 6-48 30-50 26-2 40 18 38 50M28 50L22 18l22 18M82 50l6-32-22 18M44 70h.1M66 70h.1M52 80q3 4 6 0M30 78l-18-4M30 84l-18 4M80 78l18-4M80 84l18 4"/></svg>` : ''}
      <div class="ring"></div></div></div>`;
  const IDEAS = ['a library you can walk through', 'stories by strangers. no names.', 'only show how often it’s been read', 'writing rooms at the back',
    'a gentle old librarian at the desk', 'a black & white cat in the window ♡'];
  await cut(at(1), {
    setup: () => scene(notebook(0.55, [], 0)),
    events: [{ at: at(0, 1) + 0.04, run: () => say('building a cozy library|*from a blank page.*', { step: 0.1 }) }],
  });

  // 01 · the idea
  await cut(at(2), {
    setup: () => scene(notebook(-5, IDEAS, 0.25)),
    events: [{ at: at(1) + 0.02, run: () => say('*the idea.*', { kicker: '01' }) }],
  });

  // 02 · the layout: the hall's real measurements, drawn as a blueprint
  const third = HALL / 3;
  await cut(at(3), {
    setup: () => scene(`<div class="bp"><div class="hd">THE QUIET LIBRARY · HALL · SIDE ELEVATION<br>12 SHELVES · 4 ARMCHAIRS · 1 CAT</div>
      <div class="strip" style="top:33%">${blueprintStrip(0, third, 0)}</div>
      <div class="strip" style="top:51%">${blueprintStrip(third, 2 * third, 0.55)}</div>
      <div class="strip" style="top:69%">${blueprintStrip(2 * third, HALL, 1.1)}</div>
      <div class="dim">← 6,400 units, street door to writing rooms →</div></div>`),
    events: [{ at: at(2) + 0.02, run: () => say('one long hall.|*12 shelves.*', { kicker: '02' }) }],
  });

  // 03 · the characters: the real art, from outline to colour
  await cut(at(4), {
    setup: async () => {
      const svgs = await js(() => ({ cat: document.querySelector('.cat svg').outerHTML, wren: document.querySelector('.librarian svg').outerHTML }));
      const board = (cls, name, svg, style) => `<div class="board ${cls}" style="${style}"><div class="nm">${name}</div><div class="art"><div class="fill">${svg}</div><div class="outline">${svg}</div></div></div>`;
      const sw = [['#2b2622', 'ink'], ['#f6efe1', 'paper'], ['#c9a45c', 'brass'], ['#7b2e2a', 'wine'], ['#3f6b5a', 'moss'], ['#8f7d9e', 'cardigan']];
      await scene(`<div class="ds"><div class="bar"><i class="on"></i><i></i><i></i><i></i><span>characters.svg — 2 artboards</span></div>
        ${board('b1', 'ink.svg', svgs.cat, 'left:6%;top:350px;width:41%;height:300px')}
        ${board('b2', 'mrs-wren.svg', svgs.wren, 'left:53%;top:350px;width:41%;height:300px')}
        <div class="sel" style="left:calc(6% - 4px);top:346px;width:calc(41% + 8px);height:308px"><b style="left:-5px;top:-5px"></b><b style="right:-5px;top:-5px"></b><b style="left:-5px;bottom:-5px"></b><b style="right:-5px;bottom:-5px"></b></div>
        <div class="sw">${sw.map(([c, nme], i) => `<div style="animation-delay:${(1.3 + i * 0.08).toFixed(2)}s"><span style="background:${c}"></span>${nme}<br>${c}</div>`).join('')}</div>
        <svg class="cursor" id="mk-cursor" viewBox="0 0 26 30"><path d="M2 2l20 12-9 2 5 10-4 2-5-10-7 6z" fill="#111" stroke="#fff" stroke-width="1.6"/></svg></div>`);
    },
    camera: (g) => {
      const u = clamp((g - at(3)) / (at(4) - at(3)));
      const x = 430 - 230 * ease(clamp(u * 2)) + 60 * Math.sin(u * 6);
      const y = 690 - 240 * ease(clamp(u * 2)) + 20 * Math.cos(u * 5);
      return { el: { sel: '#mk-cursor', css: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` } };
    },
    events: [{ at: at(3) + 0.02, run: () => say('a librarian|and *a cat.*', { kicker: '03' }) }],
  });

  // 04 · the world, layer by layer, in an editor view of the real hall
  const groups = [
    ['.layer-ceiling, .layer-wall, .layer-picture-rail', 'wall'], ['.layer-wainscot, .layer-baseboard', 'wainscot'], ['.layer-floor, .layer-runner', 'floor'],
    ['.item.window', 'window'], ['.item.cat', 'ink'], ['.item.counter, .item.librarian, .item.clock, .item.catalog', 'front desk'],
    ['.item.pendant, .pendant-glow', 'lamps'],
  ];
  await cut(at(5), {
    setup: async () => {
      await scene('');
      await js((sels) => {
        window.__lib.hall.setZoom('fit');
        document.body.classList.add('mk-wire');
        for (const s of sels) for (const node of document.querySelectorAll(s)) node.classList.add('mk-hidden');
      }, groups.map((g) => g[0]));
      await settle();
      await scene(`<div class="ed-top"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span>hall.scene — The Quiet Library</span></div>
        <div class="layers" id="mk-layers">${groups.map(([, name]) => `<div>${name}</div>`).join('')}</div>`);
    },
    camera: (g) => ({ hall: { x: 430 + 230 * ease(clamp((g - at(4)) / BAR)), zoom: 1, focusY: 300 } }),
    events: [
      { at: at(4) + 0.02, run: () => say('built|*layer by layer.*', { kicker: '04' }) },
      ...groups.map(([sel], i) => ({
        at: at(4) + 0.15 + i * 0.3,
        run: () => js(([s, k]) => {
          for (const node of document.querySelectorAll(s)) { node.classList.remove('mk-hidden'); node.classList.add('mk-in'); }
          document.querySelectorAll('#mk-layers div')[k].classList.add('on');
        }, [sel, i]),
      })),
    ],
  });

  // 05 · the code: the real lines that make Ink's eyes follow you, with a live preview
  await cut(at(6), {
    setup: async () => {
      await js(() => {
        document.body.classList.remove('mk-wire');
        for (const node of document.querySelectorAll('.mk-in, .mk-hidden')) node.classList.remove('mk-in', 'mk-hidden');
        window.__lib.hall.setZoom('fill');
        document.body.classList.add('eyes-free');
      });
      await settle();
      const html = CODE.map(highlight).join('\n');
      await scene(`<div class="ed"><div class="tabs"><span class="on">cat.js</span><span>hall.js</span><span>art.js</span></div>
        <div class="body"><div class="gut">${CODE.map((_, i) => FIRST + 1 + i).join('<br>')}</div><pre>${typed(html, 0.1, 0.0062)}</pre></div>
        <div class="st"><span>main</span><span>JavaScript</span><span>Ln ${FIRST + 7}, Col 5</span></div></div>
        <div class="pv">▶ live preview</div>`);
    },
    camera: (g) => ({ hall: { x: 497, zoom: 2.35, focusY: 252 }, px: 2.6 * Math.sin((g - at(5)) * 2.6) }),
    events: [{ at: at(5) + 0.02, run: () => say('*ink’s eyes*|follow you.', { kicker: '05', pos: 'mid' }) }],
  });

  // 06 · the bugs: three real ones from along the way
  const ring = (l, t, w, h) => `<svg class="bug-ring" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px" viewBox="0 0 ${w} ${h}"><ellipse pathLength="1" cx="${w / 2}" cy="${h / 2}" rx="${w / 2 - 6}" ry="${h / 2 - 6}"/></svg>`;
  await cut(at(6, 4 / 3), {
    setup: async () => {
      await js(() => {
        document.body.classList.remove('eyes-free');
        document.querySelector('.item.clock').style.left = '780px'; // where the clock first hung: right behind her head
      });
      await settle();
      await scene(`${ring(150, 300, 260, 260)}<div class="bug-tag" style="left:300px;top:560px">BUG #1 · v0.1</div>`);
    },
    camera: () => ({ hall: { x: 820, zoom: 1.75, focusY: 205 } }),
    events: [{ at: at(6) + 0.02, run: () => say('mrs. wren wore|*the clock as a hat.*', { kicker: '06 · bugs' }) }],
  });
  await cut(at(6, 8 / 3), {
    setup: async () => {
      await js(() => { document.querySelector('.item.clock').style.left = '1061px'; });
      await settle();
      await scene(`<div class="old-1"><div class="r">rule</div><div class="n">1</div></div>${ring(170, 395, 200, 250)}<div class="bug-tag" style="left:330px;top:640px">BUG #2</div>`);
    },
    events: [{ at: at(6, 4 / 3) + 0.02, run: () => say('every 1|*looked like an I.*', { kicker: '06 · bugs' }) }],
  });
  await cut(at(7), {
    setup: () => scene(`<div class="early"><img src="${EARLY_AVATAR}" alt=""></div>${ring(345, 450, 150, 150)}<div class="bug-tag" style="left:330px;top:620px">BUG #3</div>`),
    events: [{ at: at(6, 8 / 3) + 0.02, run: () => say('the tail grew|*out of the whiskers.*', { kicker: '06 · bugs' }) }],
  });

  // 07 · testing, then the tape stop and a frozen, silent beat
  const T = (cls, text, d) => `<span class="l ${cls}" style="animation-delay:${d.toFixed(2)}s">${esc(text)}</span>`;
  await cut(at(8), {
    setup: () => scene(`<div class="term"><div class="tb"><b></b><b></b><b></b><span>the-quiet-library — zsh</span></div><pre>${[
      T('p', '$ npm test', 0.05),
      T('ok', '✔ offline helpers (7)', 0.75), T('ok', '✔ the database (5)', 0.85), T('ok', '✔ the API (8)', 0.95),
      T('ok', '✔ local edition backend (6)', 1.05), T('ok', '✔ the librarian without AI (3)', 1.15),
      T('big', 'ℹ tests 29 · pass 29 · fail 0', 1.3),
      T('p', '$ npm run build:local', 1.6),
      T('dim', 'Built dist/quiet-library-local.html (781 KB)', 2.1),
    ].join('\n')}</pre></div>`),
    events: [
      { at: at(7) + 0.02, run: () => say('*testing.*', { kicker: '07' }) },
      { at: at(7) + 1.35, run: () => say('*29 tests.*|all green.', { kicker: '07' }) },
    ],
    freezeFrom: at(8) - 0.26,
  });

  // the reveal: it came alive
  await cut(at(9), {
    setup: () => scene(''),
    camera: (g) => ({ hall: { x: tween(g, at(8), at(9), 420, 620), zoom: tween(g, at(8), at(9), 1.3, 1.12), focusY: 300 } }),
    events: [{ at: at(8), run: () => say('and then…|*it came alive.*', { size: 'xl', step: 0.09 }) }],
  });

  // a place to read, a place to write. The Letters case is staged (the same titles as
  // video 4), so it looks lived-in; then one more book arrives.
  const lettersX = await js(() => window.__lib.hall.spot('shelf:letters').cx);
  const letters = await js(() => JSON.parse(localStorage.getItem('ql.local.library')).books
    .filter((b) => b.genre === 'letters').map(({ id, title, reads }) => ({ id, title, reads: reads ?? 0 })));
  STAGED_LETTERS.forEach(([title, reads], i) => letters.push({ id: `mk-l${i}`, title, reads }));
  await cut(at(9, 2), {
    setup: async () => {
      await js((b) => window.__lib.hall.updateShelves([{ id: 'letters', books: b }], { quiet: true }), letters);
      await settle();
    },
    camera: (g) => ({ hall: { x: lettersX, zoom: tween(g, at(9), at(9, 2), 1.42, 1.3), focusY: 225 } }),
    events: [
      { at: at(9) + 0.02, run: () => say('a place|*to read.*') },
      { at: at(9) + 0.3, run: () => js((b) => window.__lib.hall.updateShelves([{ id: 'letters', books: [...b, { id: 'mk-new', title: 'For Whoever Reads This', reads: 0 }] }]), letters) },
    ],
  });
  const writingX = await js(() => window.__lib.hall.spot('writing').cx);
  await cut(at(10), {
    setup: async () => {
      await js(() => window.__setPresence({ total: 2, zones: { 'writing:1': 1 } }, 'hall'));
      await quietly(1300);
      await settle();
    },
    camera: (g) => ({ hall: { x: writingX, zoom: tween(g, at(9, 2), at(10), 1.3, 1.45), focusY: 235 } }),
    events: [{ at: at(9, 2) + 0.02, run: () => say('a place|*to write.*') }],
  });

  // the end card
  await cut(LENGTH, {
    setup: () => js(() => window.__setPresence({ total: 1, zones: {} }, 'hall')),
    camera: (g) => ({ hall: { x: 500, zoom: tween(g, at(10), LENGTH, 1.2, 1.32), focusY: 245 } }),
    events: [
      { at: at(10), run: () => say(null) },
      { at: at(10), run: () => scene(`<div id="mk-end"><div class="a">made for anyone<br>who feels alone.</div><h1>The Quiet Library</h1>
          <div class="s">opening soon<br>follow to see the doors open</div></div>`) },
    ],
  });

  await browser.close();
  assemble({ shots: [dir], transitions: [], audio, out, length: LENGTH });
  fs.rmSync(WORK, { recursive: true, force: true });
  console.log(`done: ${out} (${n} frames)`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
