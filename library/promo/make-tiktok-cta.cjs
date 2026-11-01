// TikTok #3: "the blank page", with a call to action.
// Someone writes a few lines to a stranger, the library binds and shelves them,
// a stranger reads them; then the viewer is asked to leave their own sentence in
// the comments (an arrow points at TikTok's comment button) and to follow for
// opening night. Cut to the "letter" lo-fi preset (72 BPM, one bar = 3.333 s).
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-letter.wav 34 letter
//   node promo/make-tiktok-cta.cjs promo/lofi-letter.wav promo/quiet-library-cta.mp4

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-cta.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-cta.cjs <lofi-letter.wav> [out.mp4]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const AVATAR = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, 'profile', 'ink-profile.png')).toString('base64')}`;
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-cta-'));
const B = (60 / 72) * 4;
const LENGTH = 32.5;

const TITLE = 'For Whoever Reads This';
const LETTER = 'Dear stranger,\nI don’t know you, but I hope tonight is gentle with you.';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const tween = (g, t0, t1, a, b, fn = ease) => a + (b - a) * fn(clamp((g - t0) / (t1 - t0)));

const FILM_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  #world { will-change: auto !important; }
  #tt-dust { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 60; pointer-events: none; mix-blend-mode: screen; }
  #tt-shade { position: fixed; left: 0; right: 0; top: 0; height: 290px; z-index: 998; pointer-events: none;
    background: linear-gradient(rgba(14,9,6,.66), rgba(14,9,6,.25) 58%, rgba(14,9,6,0)); opacity: 0; transition: opacity .7s; }
  #tt-shade.on { opacity: 1; }
  .tt-cap { position: fixed; left: 5%; right: 5%; top: 84px; z-index: 999; text-align: center; pointer-events: none;
    animation: tt-in .9s cubic-bezier(.2,.7,.2,1) both; }
  .tt-cap.out { animation: tt-out .6s ease both; }
  .tt-kicker { font: 600 29px/1 'Caveat', cursive; color: #e9c98a; margin-bottom: 6px; text-shadow: 0 2px 10px rgba(0,0,0,.85); }
  .tt-line { font: italic 600 35px/1.14 'Cormorant Garamond', serif; color: #fbf1dc; letter-spacing: .01em;
    text-shadow: 0 2px 16px rgba(0,0,0,.9), 0 0 3px rgba(0,0,0,.7); }
  .tt-cap.big .tt-line { font-size: 41px; line-height: 1.12; }
  @keyframes tt-in { from { opacity: 0; transform: translateY(12px); filter: blur(6px); } }
  @keyframes tt-out { to { opacity: 0; transform: translateY(-8px); filter: blur(6px); } }

  /* the call to action */
  #tt-cta { position: fixed; inset: 0; z-index: 999; pointer-events: none; }
  #tt-cta .wrap { position: absolute; left: 6%; right: 6%; top: 15%; text-align: center; }
  #tt-cta .ask { font: 700 47px/1.08 'Cormorant Garamond', serif; color: #fff4dc; text-shadow: 0 0 30px rgba(255,214,140,.35), 0 2px 16px rgba(0,0,0,.9);
    animation: tt-in .9s cubic-bezier(.2,.7,.2,1) both; }
  #tt-cta .ask em { color: #f2c46d; font-style: italic; }
  #tt-cta .sub { margin-top: 12px; font: 600 33px/1 'Caveat', cursive; color: #e9c98a; text-shadow: 0 2px 10px rgba(0,0,0,.85);
    animation: tt-in .9s .5s cubic-bezier(.2,.7,.2,1) both; }
  #tt-cta svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  #tt-cta svg path { fill: none; stroke: #fbe7b8; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,.7)); stroke-dasharray: 600; stroke-dashoffset: 600; animation: tt-draw 1.1s .9s ease forwards; }
  #tt-cta svg path.head { stroke-dasharray: 80; stroke-dashoffset: 80; animation: tt-draw .35s 1.95s ease forwards; }
  #tt-cta svg circle { fill: none; stroke: #fbe7b8; stroke-width: 4; opacity: 0; transform-box: fill-box; transform-origin: center;
    animation: tt-ping 1.4s 2.2s ease-out infinite; }
  @keyframes tt-draw { to { stroke-dashoffset: 0; } }
  @keyframes tt-ping { 0% { opacity: .9; transform: scale(.4); } 100% { opacity: 0; transform: scale(1.6); } }
  #tt-cta.out { animation: tt-out .6s ease both; }

  /* follow card */
  #tt-follow { position: fixed; inset: 0; z-index: 997; display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; gap: 4px; padding: 0 8% 170px; color: #fbf1dc;
    background: radial-gradient(ellipse at 50% 40%, rgba(22,14,9,.55), rgba(10,6,4,.92) 72%);
    backdrop-filter: blur(6px); animation: tt-fade 1s ease both; }
  #tt-follow .av { position: relative; width: 190px; height: 190px; margin-bottom: 30px; animation: tt-in 1s .1s both; }
  #tt-follow .av img { width: 100%; height: 100%; border-radius: 50%; display: block; box-shadow: 0 0 0 4px #fbf1dc, 0 0 50px rgba(255,214,140,.35); }
  #tt-follow .plus { position: absolute; left: 50%; bottom: -18px; width: 44px; height: 44px; margin-left: -22px; border-radius: 50%;
    background: #fe2c55; color: #fff; font: 700 36px/42px system-ui, sans-serif; box-shadow: 0 4px 14px rgba(0,0,0,.5);
    animation: tt-pulse 1.2s 1s ease-in-out infinite; }
  @keyframes tt-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.18); } }
  #tt-follow .l1 { font: 600 42px/1.1 'Caveat', cursive; animation: tt-in 1s .45s both; }
  #tt-follow .orn { font-size: 24px; color: rgba(233,201,138,.75); margin: 20px 0 8px; animation: tt-in 1s .8s both; }
  #tt-follow h1 { margin: 0; font: 700 54px/1 'Cormorant Garamond', serif; text-shadow: 0 0 30px rgba(255,214,140,.25); animation: tt-in 1s .9s both; }
  #tt-follow .soon { margin-top: 16px; font: 500 17px/1 'EB Garamond', serif; letter-spacing: .32em; text-transform: uppercase;
    color: rgba(251,241,220,.8); animation: tt-in 1s 1.2s both; }
  @keyframes tt-fade { from { opacity: 0; } }
`;

function pageSetup() {
  document.body.insertAdjacentHTML('beforeend', '<canvas id="tt-dust"></canvas><div id="tt-shade"></div>');
  const lib = window.__lib;
  window.__setPresence = lib.hall.setPresence;
  lib.hall.setPresence = () => {};

  window.__caption = (html, { kicker = '', big = false } = {}) => {
    for (const old of document.querySelectorAll('.tt-cap:not(.out)')) {
      old.classList.add('out');
      setTimeout(() => old.remove(), 700);
    }
    document.getElementById('tt-shade').classList.toggle('on', Boolean(html));
    if (!html) return;
    const box = document.createElement('div');
    box.className = `tt-cap${big ? ' big' : ''}`;
    box.innerHTML = `${kicker ? `<div class="tt-kicker">${kicker}</div>` : ''}<div class="tt-line">${html}</div>`;
    document.body.append(box);
  };

  const canvas = document.getElementById('tt-dust');
  const ctx = canvas.getContext('2d');
  let s = 4321;
  const r = () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x6d2b79f5) >>> 0) / 4294967296);
  const motes = Array.from({ length: 60 }, () => ({ x: r(), y: r(), vx: (r() - 0.5) * 10, vy: -2 - r() * 9, size: 0.7 + r() * 2.2, ph: r() * 6.28, tw: 0.6 + r() * 1.6, sway: 4 + r() * 10 }));
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

  // Per frame: the hall camera, or a "camera" on one element (a slow zoom on an overlay).
  window.__frame = ({ hall, el, t, dust }) => {
    if (hall) {
      lib.hall.teleport(hall.x);
      lib.hall.setCloseUp(hall.zoom, hall.focusY);
    }
    for (const n of document.querySelectorAll('[data-tt-cam]')) {
      if (!el || !n.matches(el.sel)) {
        n.style.transform = '';
        delete n.dataset.ttCam;
      }
    }
    if (el) {
      const n = document.querySelector(el.sel);
      if (n) {
        n.dataset.ttCam = '1';
        n.style.transformOrigin = el.origin ?? '50% 50%';
        n.style.transform = `scale(${el.scale.toFixed(4)})`;
      }
    }
    window.__dust(t, dust);
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
  const caption = (html, opts) => js(([h, o]) => window.__caption(h, o), [html, opts ?? {}]);
  const click = (sel) => js((s) => {
    const node = document.querySelector(s);
    if (!node) throw new Error(`nothing to click: ${s}`);
    node.click();
  }, sel);
  const quietly = (ms) => page.clock.runFor(ms); // let time pass between shots without filming

  async function shot(name, { start, end, setup, camera, events = [], dust = 1 }) {
    dir = path.join(WORK, name);
    fs.mkdirSync(dir);
    n = 0;
    if (setup) await setup();
    const queue = [...events].sort((a, b) => a.at - b.at);
    const frames = Math.round((end - start) * FPS);
    let typing = null;
    for (let i = 0; i < frames; i++) {
      const g = start + i / FPS;
      while (queue.length && queue[0].at <= g) {
        const ev = queue.shift();
        if (ev.type) typing = { text: [...ev.type], every: ev.every ?? 2, k: 0 };
        else await ev.run();
      }
      if (typing && i % typing.every === 0 && typing.k < typing.text.length) {
        const ch = typing.text[typing.k++];
        await (ch === '\n' ? page.keyboard.press('Enter') : page.keyboard.type(ch));
      }
      const c = camera(g);
      await js((f) => window.__frame(f), { hall: c.hall ?? null, el: c.el ?? null, t: g, dust: typeof dust === 'function' ? dust(g) : dust });
      await film.shoot();
    }
    console.log(`  shot ${name}: ${frames} frames`);
    return dir;
  }

  const shots = [];

  // 1 · The blank page: a few lines to a stranger, bound and shelved by the librarian.
  shots.push(await shot('a', {
    start: 0, end: 4 * B + 0.4,
    setup: async () => {
      const x = await js(() => window.__lib.hall.spot('writing').cx);
      await js((x) => window.__lib.hall.teleport(x), x);
      await click('button.hotspot[aria-label="Go into the writing rooms"]');
      await quietly(600);
      await click('button.room-door[aria-label^="Writing room 2"]');
      await quietly(900);
      await js((title) => {
        const input = document.querySelector('.title-input');
        input.value = title;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        document.querySelector('.story-input').focus();
      }, TITLE);
    },
    camera: (g) => (g < 9.3
      ? { el: { sel: '.room', scale: tween(g, 0, 7.6, 1.62, 1.0), origin: '50% 31%' } }
      : { el: { sel: '.overlay .panel.shelved', scale: tween(g, 9.3, 13.8, 1.0, 1.07), origin: '50% 40%' } }),
    events: [
      { at: 0.0, run: () => caption('every book here starts<br>with a blank page.', { kicker: 'the quiet library' }) },
      { at: 0.9, type: LETTER, every: 2 },
      { at: 6.2, run: () => caption(null) },
      { at: 6.9, run: () => caption('no name. no profile.<br>just your words.') },
      { at: 8.0, run: () => click('.sheet-foot .btn') },
      { at: 12.9, run: () => caption(null) },
    ],
    dust: (g) => tween(g, 0, 2, 0.35, 0.6),
  }));

  // 2 · It lands on the Letters & Diaries shelf, glowing.
  let ids;
  shots.push(await shot('b', {
    start: 4 * B - 0.4, end: 5 * B + 0.4,
    setup: async () => {
      await page.keyboard.press('Escape');
      await quietly(500);
      ids = await js(() => {
        const lib = JSON.parse(localStorage.getItem('ql.local.library'));
        return lib.books.filter((b) => b.genre === 'letters').sort((a, b) => a.createdAt - b.createdAt).map(({ id, title }) => ({ id, title, reads: 0 }));
      });
      await js((first) => window.__lib.hall.updateShelves([{ id: 'letters', books: first }], { quiet: true }), ids.slice(0, -1));
    },
    camera: (g) => ({ hall: { x: tween(g, 12.9, 17.1, 1568, 1650), zoom: tween(g, 12.9, 17.1, 2.3, 1.35), focusY: tween(g, 12.9, 17.1, 192, 280) } }),
    events: [
      { at: 13.5, run: () => caption('it finds a place on a shelf…') },
      { at: 13.65, run: () => js((all) => window.__lib.hall.updateShelves([{ id: 'letters', books: all }]), ids) },
      { at: 16.4, run: () => caption(null) },
    ],
  }));

  // 3 · …and one day, a stranger sits down and reads it.
  shots.push(await shot('c', {
    start: 5 * B - 0.4, end: 6 * B + 0.5,
    setup: async () => {
      await click('button.hotspot[aria-label="Browse Letters & Diaries"]');
      await quietly(900);
      await click(`.spine[aria-label^="${TITLE}"]`);
      await quietly(400);
      await click('.book-card .btn');
      await quietly(2600);
    },
    camera: (g) => ({ el: { sel: '.reading-room .open-book', scale: tween(g, 16.2, 20.6, 0.8, 0.86), origin: '50% 100%' } }),
    events: [
      { at: 16.8, run: () => caption('…and one day, a stranger<br>sits down and reads it.') },
      { at: 18.4, run: () => page.keyboard.press('ArrowRight') },
      { at: 19.9, run: () => caption(null) },
    ],
    dust: 0.4,
  }));

  // 4 · The question, the call to action, and the follow card, all in Ink's window.
  shots.push(await shot('d', {
    start: 6 * B - 0.5, end: LENGTH,
    setup: async () => {
      await page.keyboard.press('Escape');
      await quietly(600);
    },
    camera: (g) => ({ hall: { x: tween(g, 19.5, 32.5, 478, 494), zoom: tween(g, 19.5, 32.5, 1.42, 1.72), focusY: tween(g, 19.5, 32.5, 285, 300) } }),
    events: [
      { at: 20.1, run: () => caption('if you could leave one sentence<br>for a stranger,<br>what would it say?', { big: true }) },
      { at: 23.0, run: () => caption(null) },
      { at: 23.4, run: () => js(() => document.body.insertAdjacentHTML('beforeend', `<div id="tt-cta">
          <div class="wrap"><div class="ask">leave it in<br><em>the comments.</em></div><div class="sub">Ink reads every single one.</div></div>
          <svg viewBox="0 0 540 960" preserveAspectRatio="none" aria-hidden="true">
            <path d="M330 342C420 360 474 440 478 588"/><path class="head" d="M458 566L478 594L497 568"/>
            <circle cx="490" cy="612" r="26"/>
          </svg></div>`)) },
      { at: 26.7, run: () => js(() => {
          const cta = document.getElementById('tt-cta');
          cta.classList.add('out');
          setTimeout(() => cta.remove(), 700);
        }) },
      { at: 27.0, run: () => js((avatar) => document.body.insertAdjacentHTML('beforeend', `<div id="tt-follow">
          <div class="av"><img src="${avatar}" alt=""><span class="plus">+</span></div>
          <div class="l1">follow, so you’re here<br>when the doors open.</div>
          <div class="orn">❦</div><h1>The Quiet Library</h1><div class="soon">opening soon</div></div>`), AVATAR) },
    ],
    dust: 0.7,
  }));

  await browser.close();
  assemble({
    shots,
    transitions: [
      { kind: 'fade', at: 4 * B, duration: 0.8 },
      { kind: 'fade', at: 5 * B, duration: 0.8 },
      { kind: 'fadeblack', at: 6 * B, duration: 1.0 },
    ],
    audio,
    out,
    length: LENGTH,
  });
  fs.rmSync(WORK, { recursive: true, force: true });
  console.log(`done: ${out}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
