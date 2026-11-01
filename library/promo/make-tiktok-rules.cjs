// TikTok #4: "this library has 3 rules" - a fast, beat-cut listicle in the style
// that works on TikTok in late 2026: a half-second payoff flash before the hook,
// a numbered promise, chapter cards every ~5 s, hard cuts on the beat, kinetic
// word-by-word captions with gold keywords, a riser and a tape-stop into a silent
// freeze frame before the punchline, and a short end card with a comment question.
// Cut to the "rules" lo-fi preset (88 BPM: one beat = 0.682 s, one bar = 2.727 s).
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-rules.wav 29.5 rules
//   node promo/make-tiktok-rules.cjs promo/lofi-rules.wav promo/quiet-library-rules.mp4

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-rules.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-rules.cjs <lofi-rules.wav> [out.mp4]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-rules-'));
const BEAT = 60 / 88;
const BAR = 4 * BEAT;
const at = (bar, beat = 0) => bar * BAR + beat * BEAT;
const LENGTH = 28.4;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const tween = (g, t0, t1, a, b, fn = ease) => a + (b - a) * fn(clamp((g - t0) / (t1 - t0)));

// -- a staged library: titles and read counts for the "only number" rule ----------
const READS = {
  'The Night Bus': 143, 'To Whoever Sits Here Next': 214, 'Inventory of a Small Kitchen': 189, 'On Leaving the Porch Light On': 57,
  'The Piano Upstairs': 41, 'Forty Years of Crosswords': 88, 'Returned Thirty-One Years Late': 64, "The Lamplighter's Apprentice": 72,
  'Signal from the Last Lighthouse': 35, 'The Knocking': 49, 'My Cat Has Filed a Formal Complaint': 121, 'The Hedgehog Who Collected Echoes': 66,
};
const EXTRA = {
  letters: [['Dear Mum, I Got the Job', 167], ['A Postcard I Never Sent', 98], ['Notes From the Night Shift', 76], ['Things I Should Have Said at the Station', 61],
    ['Diary of a First Winter Away', 44], ['For My Brother, Who Is Fine Now', 39], ['To My Seventeen-Year-Old Self', 27], ['To the Neighbour With the Piano', 18],
    ['Thank You, Bus Driver', 9], ['Before I Forget Your Voice', 3], ['To the Stranger on Platform 4', 0]],
  poetry: [['Small Hours', 120], ['What the Kettle Knows', 77], ['Ode to the Last Bus Home', 52], ['Rain, Again', 33], ['How to Hold Still', 12], ['Spare Key', 0]],
};
const FILLER = ['Small Mercies', 'The Long Way Home', 'Paper Boats', 'After the Rain', 'Lamplight', 'Somebody Else’s Sunday', 'The Spare Room', 'Winter Coats',
  'Open Windows', 'A Kind of Quiet', 'Last Orders', 'Borrowed Time', 'Salt and Honey', 'The Green Door', 'Night Trains', 'Second Chances'];
const PLATFORM_4 = 'You dropped your glove on the 8:14 and I picked it up a second too late.\nI hope your hands were warm anyway. I hope the day was kind to you.';

async function stagedLibrary() {
  const { STARTER_BOOKS } = await import('../shared/starter-books.js');
  const now = Date.parse('2026-11-01T22:40:00');
  let id = 0;
  const book = (title, genre, reads, body) => ({
    id: `staged${(id++).toString(36).padStart(4, '0')}`, title, genre, reads,
    body: body ?? `${title}. A story left here by someone who needed to write it, for whoever needed to read it.`,
    summary: '', themes: [], readers: [], namedByLibrary: false, deleteKey: null, createdAt: now - (300 - id) * 3600_000,
  });
  const books = STARTER_BOOKS.map((b) => book(b.title, b.genre, READS[b.title] ?? 20, b.body));
  for (const [genre, list] of Object.entries(EXTRA)) for (const [title, reads] of list) books.push(book(title, genre, reads, title.includes('Platform 4') ? PLATFORM_4 : undefined));
  // the other shelves get some company too, so the hall looks lived-in
  for (const genre of ['life', 'essays', 'literary', 'romance', 'mystery', 'fantasy', 'scifi', 'horror', 'humor', 'fables']) {
    for (let i = 0; i < 12; i++) books.push(book(FILLER[(i * 5 + genre.length) % FILLER.length], genre, (i * 37 + genre.length * 11) % 90));
  }
  return { version: 1, books };
}

// -- kinetic captions: words pop in one by one, *keywords* in gold ------------------
const escHTML = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function kin(text, { kicker = '', size = '', step = 0.075 } = {}) {
  let i = 0;
  let key = false;
  const lines = text.split('|').map((line) => line.split(' ').map((raw) => {
    let w = raw;
    if (w.startsWith('*')) { key = true; w = w.slice(1); }
    const k = key;
    if (w.endsWith('*')) { key = false; w = w.slice(0, -1); }
    return `<span class="w${k ? ' k' : ''}" style="animation-delay:${(i++ * step).toFixed(3)}s">${escHTML(w)}</span>`;
  }).join(' '));
  return `<div class="tt-kin ${size}">${kicker ? `<div class="kk">${escHTML(kicker)}</div>` : ''}${lines.map((l) => `<div class="ln">${l}</div>`).join('')}</div>`;
}

const FILM_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  #world { will-change: auto !important; }
  #tt-shade { position: fixed; left: 0; right: 0; top: 0; height: 300px; z-index: 998; pointer-events: none;
    background: linear-gradient(rgba(14,9,6,.7), rgba(14,9,6,.28) 60%, rgba(14,9,6,0)); }
  .tt-kin { position: fixed; left: 4%; right: 4%; top: 80px; z-index: 999; text-align: center; pointer-events: none; }
  .tt-kin.out { animation: kin-out .16s ease-in both; }
  .tt-kin .kk { font: 700 30px/1 'Caveat', cursive; color: #f2c46d; margin-bottom: 6px; text-shadow: 0 2px 10px rgba(0,0,0,.9);
    animation: kin-pop .35s cubic-bezier(.2,1.5,.35,1) both; }
  .tt-kin .ln { font: 700 46px/1.06 'Cormorant Garamond', serif; color: #fff6e2; letter-spacing: .005em;
    text-shadow: 0 3px 14px rgba(0,0,0,.95), 0 0 2px rgba(0,0,0,.8); }
  .tt-kin.xl .ln { font-size: 60px; }
  .tt-kin .w { display: inline-block; animation: kin-pop .42s cubic-bezier(.2,1.6,.35,1) both; }
  .tt-kin .k { color: #f6c25b; text-shadow: 0 0 24px rgba(246,194,91,.45), 0 3px 14px rgba(0,0,0,.95); }
  @keyframes kin-pop { 0% { opacity: 0; transform: translateY(14px) scale(1.45); filter: blur(5px); } 55% { opacity: 1; transform: scale(.95); filter: blur(0); } 100% { transform: none; } }
  @keyframes kin-out { to { opacity: 0; transform: translateY(-10px); } }

  #tt-chap { position: fixed; inset: 0; z-index: 997; display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: rgba(12,8,5,.62); backdrop-filter: blur(6px); animation: chap 0.48s ease both; pointer-events: none; }
  #tt-chap .r { font: 700 44px/1 'Caveat', cursive; color: #f2c46d; }
  #tt-chap .n { font: 700 260px/0.9 'Cormorant Garamond', serif; color: #fff6e2; text-shadow: 0 0 60px rgba(246,194,91,.45); }
  @keyframes chap { 0% { opacity: 0; transform: scale(1.15); } 22% { opacity: 1; transform: scale(1); } 78% { opacity: 1; } 100% { opacity: 0; transform: scale(.94); } }

  .tt-mrrp { position: fixed; left: 0; right: 0; top: 66%; z-index: 999; text-align: center; font: 700 46px/1 'Caveat', cursive; color: #fff6e2;
    text-shadow: 0 3px 14px rgba(0,0,0,.95); animation: kin-pop .5s cubic-bezier(.2,1.6,.35,1) both; pointer-events: none; }

  #tt-end4 { position: fixed; inset: 0; z-index: 997; pointer-events: none;
    background: radial-gradient(ellipse at 50% 38%, rgba(22,14,9,.45), rgba(10,6,4,.88) 74%); animation: chap-in .5s ease both; }
  @keyframes chap-in { from { opacity: 0; } }
  #tt-end4 .wrap { position: absolute; left: 5%; right: 5%; top: 17%; text-align: center; }
  #tt-end4 svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  #tt-end4 svg path { fill: none; stroke: #fbe7b8; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 2px 6px rgba(0,0,0,.7));
    stroke-dasharray: 600; stroke-dashoffset: 600; animation: draw .9s .7s ease forwards; }
  #tt-end4 svg path.head { stroke-dasharray: 80; stroke-dashoffset: 80; animation: draw .3s 1.55s ease forwards; }
  #tt-end4 svg circle { fill: none; stroke: #fbe7b8; stroke-width: 4; opacity: 0; transform-box: fill-box; transform-origin: center; animation: ping 1.3s 1.8s ease-out infinite; }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  @keyframes ping { 0% { opacity: .9; transform: scale(.4); } 100% { opacity: 0; transform: scale(1.6); } }
  #tt-end4 .brand { position: absolute; left: 0; right: 0; top: 57%; text-align: center; animation: kin-pop .6s 1.1s cubic-bezier(.2,1.4,.35,1) both; }
  #tt-end4 .brand b { display: block; font: 700 46px/1 'Cormorant Garamond', serif; color: #fff6e2; text-shadow: 0 0 30px rgba(255,214,140,.3); }
  #tt-end4 .brand small { display: block; margin-top: 12px; font: 500 16px/1 'EB Garamond', serif; letter-spacing: .26em; text-transform: uppercase; color: rgba(251,241,220,.82); }
`;

function pageSetup() {
  document.body.insertAdjacentHTML('beforeend', '<div id="tt-shade"></div>');
  const lib = window.__lib;
  window.__setPresence = lib.hall.setPresence;
  lib.hall.setPresence = () => {};
  window.__kin = (html) => {
    for (const old of document.querySelectorAll('.tt-kin:not(.out)')) {
      old.classList.add('out');
      setTimeout(() => old.remove(), 200);
    }
    if (html) document.body.insertAdjacentHTML('beforeend', html);
  };
  window.__chapter = (n) => {
    document.getElementById('tt-chap')?.remove();
    document.body.insertAdjacentHTML('beforeend', `<div id="tt-chap"><div class="r">rule</div><div class="n">${n}</div></div>`);
    setTimeout(() => document.getElementById('tt-chap')?.remove(), 480);
  };
  // Finish every finite animation now (overlays opened between cuts appear fully formed).
  window.__settle = () => {
    for (const a of document.getAnimations()) {
      const t = a.effect?.getComputedTiming?.();
      if (t && Number.isFinite(t.endTime)) try { a.finish(); } catch { /* ignore */ }
    }
  };
  window.__frame = ({ hall, el, px }) => {
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
    document.documentElement.style.setProperty('--px', `${(px ?? 0).toFixed(2)}px`);
  };
}

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-01T22:40:00'),
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: false, time: 'night', rain: true, pace: 1, demo: 0 },
    storage: { 'ql.local.library': await stagedLibrary() },
  });
  await page.addStyleTag({ content: FILM_CSS });
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
  const click = (sel) => js((s) => {
    const node = document.querySelector(s);
    if (!node) throw new Error(`nothing to click: ${s}`);
    node.click();
  }, sel);
  const quietly = (ms) => page.clock.runFor(ms);
  const settle = () => js(() => window.__settle());
  const closeAll = async () => {
    for (let i = 0; i < 3; i++) {
      const open = await js(() => document.querySelectorAll('#overlays > *').length);
      if (!open) break;
      await page.keyboard.press('Escape');
      await quietly(320);
    }
  };
  const openShelf = async (genre, label) => {
    const x = await js((g) => window.__lib.hall.spot(`shelf:${g}`).cx, genre);
    await js((xx) => window.__lib.hall.teleport(xx), x);
    await click(`button.hotspot[aria-label="Browse ${label}"]`);
    await quietly(600);
  };

  /** A cut: from the current time to `until`, with a camera and timed events. */
  async function cut(until, { setup, camera, events = [], freezeFrom }) {
    if (setup) await setup();
    await settle();
    const queue = [...events].sort((a, b) => a.at - b.at);
    while (n < Math.round(until * FPS)) {
      const g = n / FPS;
      if (freezeFrom !== undefined && g >= freezeFrom && lastFrame) {
        write(lastFrame); // freeze frame: the silent beat before the punchline
        continue;
      }
      while (queue.length && queue[0].at <= g) await queue.shift().run();
      const c = camera(g);
      await js((f) => window.__frame(f), { hall: c.hall ?? null, el: c.el ?? null, px: c.px ?? 0 });
      await film.shoot();
    }
  }

  const ink = (zoom, focusY = 306) => ({ x: 497, zoom, focusY });

  // People quietly about: readers in armchairs, someone at the shelves, two writers in the back.
  await js(() => window.__setPresence({ total: 9, zones: { reading: 3, 'shelf:romance': 1, 'shelf:mystery': 1, 'shelf:fantasy': 1, 'writing:2': 2 } }, 'hall'));
  await quietly(1600);

  // 0 · half a second of the payoff: Ink's eyes
  await cut(at(0, 1), { camera: (g) => ({ hall: ink(tween(g, 0, at(0, 1), 3.9, 3.6)) }) });

  // 1 · the hook
  await cut(at(1), {
    camera: (g) => ({ hall: { x: 830, zoom: tween(g, at(0, 1), at(1), 1.0, 1.14), focusY: 290 } }),
    events: [{ at: at(0, 1) + 0.05, run: () => say('this library has|*3 rules.*', { size: 'xl', step: 0.12 }) }],
  });

  // 2 · rule 1: no names
  const letters = 'Letters & Diaries';
  await cut(at(1, 2), {
    camera: (g) => ({ hall: { x: tween(g, at(1), at(1, 2), 1600, 1640), zoom: tween(g, at(1), at(1, 2), 2.05, 1.85), focusY: 205 } }),
    events: [
      { at: at(1), run: () => js(() => window.__chapter(1)) },
      { at: at(1) + 0.42, run: () => say('*no names.*', { kicker: 'rule 1', size: 'xl' }) },
    ],
  });
  await cut(at(2), {
    setup: () => openShelf('letters', letters),
    camera: (g) => ({ el: { sel: '.overlay .shelf-panel', scale: tween(g, at(1, 2), at(2), 1.14, 1.05), origin: '50% 46%' } }),
    events: [{ at: at(1, 2) + 0.03, run: () => say('nobody knows|who *wrote what.*', { kicker: 'rule 1' }) }],
  });
  await cut(at(2, 2), {
    setup: closeAll,
    camera: (g) => ({ hall: { x: 820, zoom: tween(g, at(2), at(2, 2), 2.3, 2.5), focusY: 214 } }),
    events: [{ at: at(2) + 0.03, run: () => say('not even|*mrs. wren.*', { kicker: 'rule 1' }) }],
  });
  await cut(at(3), {
    setup: async () => {
      await openShelf('letters', letters);
      await click('.spine[aria-label^="To Whoever Sits Here Next"]');
      await quietly(400);
    },
    camera: (g) => ({ el: { sel: '.overlay .panel', scale: tween(g, at(2, 2), at(3), 1.12, 1.04), origin: '50% 62%' } }),
    events: [{ at: at(2, 2) + 0.03, run: () => say('no author.|*just the story.*', { kicker: 'rule 1' }) }],
  });

  // 3 · rule 2: the only number is how many people read it
  await cut(at(3, 2), {
    setup: closeAll,
    camera: (g) => ({ hall: { x: tween(g, at(3), at(3, 2), 1905, 1945), zoom: tween(g, at(3), at(3, 2), 2.05, 1.85), focusY: 205 } }),
    events: [
      { at: at(3), run: () => js(() => window.__chapter(2)) },
      { at: at(3) + 0.42, run: () => say('the only number:|*how many read it.*', { kicker: 'rule 2' }) },
    ],
  });
  await cut(at(4), {
    setup: () => openShelf('poetry', 'Poetry'),
    camera: (g) => ({ el: { sel: '.overlay .shelf-panel', scale: tween(g, at(3, 2), at(4), 1.16, 1.06), origin: '50% 46%' } }),
    events: [{ at: at(3, 2) + 0.03, run: () => say('no likes.|*no followers.*', { kicker: 'rule 2' }) }],
  });
  await cut(at(4, 2), {
    setup: async () => {
      await closeAll();
      await openShelf('letters', letters);
      await click('.spine[aria-label^="To the Stranger on Platform 4"]');
      await quietly(400);
    },
    camera: (g) => ({ el: { sel: '.overlay .panel', scale: tween(g, at(4), at(4, 2), 1.12, 1.04), origin: '50% 62%' } }),
    events: [{ at: at(4) + 0.03, run: () => say('nobody has read|this one *yet…*', { kicker: 'rule 2' }) }],
  });
  await cut(at(5), {
    setup: async () => {
      await click('.book-card .btn');
      await quietly(2600);
      const pages = await js(() => {
        const flow = document.querySelector('.flow');
        const book = document.querySelector('.open-book');
        return flow && book ? Math.max(1, Math.round(flow.scrollWidth / book.clientWidth)) : 1;
      });
      for (let i = 1; i < pages; i++) {
        await page.keyboard.press('ArrowRight');
        await quietly(600);
      }
    },
    camera: (g) => ({ el: { sel: '.reading-room .open-book', scale: tween(g, at(4, 2), at(5), 0.82, 0.88), origin: '50% 100%' } }),
    events: [{ at: at(4, 2) + 0.03, run: () => say('so…|*be the first.*', { kicker: 'rule 2' }) }],
  });

  // 4 · rule 3: you're never the only one here
  await cut(at(5, 2), {
    setup: closeAll,
    camera: (g) => ({ hall: { x: 2275, zoom: tween(g, at(5), at(5, 2), 1.6, 1.78), focusY: 335 } }),
    events: [
      { at: at(5), run: () => js(() => window.__chapter(3)) },
      { at: at(5) + 0.42, run: () => say('you’re never|*the only one here.*', { kicker: 'rule 3' }) },
    ],
  });
  const writingX = await js(() => window.__lib.hall.spot('writing').cx);
  await cut(at(6), {
    camera: (g) => ({ hall: { x: writingX, zoom: tween(g, at(5, 2), at(6), 1.3, 1.45), focusY: 235 } }),
    events: [{ at: at(5, 2) + 0.03, run: () => say('someone’s always|*writing…*', { kicker: 'rule 3' }) }],
  });
  await cut(at(6, 2), {
    camera: (g) => ({ hall: { x: tween(g, at(6), at(6, 2), 2980, 3900, (t) => t), zoom: 1.18, focusY: 300 } }),
    events: [{ at: at(6) + 0.03, run: () => say('someone’s always|*reading…*', { kicker: 'rule 3' }) }],
  });
  await cut(at(7), {
    camera: (g) => ({ hall: { x: 3478, zoom: tween(g, at(6, 2), at(7), 1.35, 1.52), focusY: 338 } }),
    events: [{ at: at(6, 2) + 0.03, run: () => say('even at|*3 a.m.*', { kicker: 'rule 3' }) }],
  });

  // 5 · the build, the tape stop (a frozen, silent beat), and the drop
  const stop = at(8) - 0.26;
  await cut(at(8), {
    camera: (g) => ({ hall: { x: tween(g, at(7), stop, 470, 492), zoom: tween(g, at(7), stop, 1.3, 1.85), focusY: tween(g, at(7), stop, 290, 304) } }),
    events: [{ at: at(7) + 0.03, run: () => say('oh, and|*one more thing…*') }],
    freezeFrom: stop,
  });
  await js(() => document.head.insertAdjacentHTML('beforeend',
    '<style id="tt-eyes">.cat .cat-pupils { transform: translate(var(--px), 0.8px) !important; transition: none !important; }</style>'));
  await cut(at(9), {
    camera: (g) => {
      const beat = Math.floor((g - at(8)) / BEAT);
      const dir = [0, -1, 1, -1, 1, 0][Math.min(5, beat)];
      const within = clamp(((g - at(8)) % BEAT) / 0.12);
      const prev = [0, 0, -1, 1, -1, 1][Math.min(5, beat)];
      return { hall: ink(tween(g, at(8), at(9), 3.25, 3.6)), px: (prev + (dir - prev) * ease(within)) * 2.6 };
    },
    events: [
      { at: at(8), run: () => say('the cat|*sees everything.*', { size: 'xl', step: 0.09 }) },
      { at: at(8, 2.5), run: () => js(() => document.body.insertAdjacentHTML('beforeend', '<div class="tt-mrrp">mrrp.</div>')) },
    ],
  });

  // 6 · the end card: one question, one arrow to the comments, the name
  await cut(LENGTH, {
    setup: () => js(() => {
      document.getElementById('tt-eyes')?.remove();
      document.querySelector('.tt-mrrp')?.remove();
    }),
    camera: (g) => ({ hall: { x: 560, zoom: tween(g, at(9), LENGTH, 1.25, 1.38), focusY: 300 } }),
    events: [
      { at: at(9), run: () => say(null) },
      { at: at(9), run: () => js(() => document.body.insertAdjacentHTML('beforeend', `<div id="tt-end4">
          <div class="wrap"></div>
          <svg viewBox="0 0 540 960" preserveAspectRatio="none" aria-hidden="true">
            <path d="M360 330C440 350 478 440 480 588"/><path class="head" d="M460 566L480 594L499 568"/><circle cx="492" cy="612" r="26"/>
          </svg>
          <div class="brand"><b>The Quiet Library</b><small>opening soon · follow for opening night</small></div></div>`)) },
      { at: at(9) + 0.05, run: () => say('which rule would|you *break first?*', { kicker: 'your turn', step: 0.09 }) },
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
