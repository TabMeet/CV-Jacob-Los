// TikTok #17: "what happens to the story you send me", in four steps. 14.3 seconds.
// The new plan, explained: you send a story (no name needed), it's bound into a book,
// it goes on a shelf, and a stranger reads it. It shows how it works; it doesn't claim
// any real story is on the shelves yet (they're still empty, as in "day 1").
//
//   what happens to the story you send me   an envelope lands on the worktable (the hook)
//   1. you send it. no name needed.          the "from:" line left blank; a postmark thumps down
//   2. I bind it into a book.                the stamp: "Your Story", by no one
//   3. it goes on a shelf.                   it glows onto an empty shelf
//   4. a stranger reads it.                  someone in an armchair under the lamp
//   and feels a little less alone.
//   send me yours. no names. ever.
//
// Cut to the "how" lo-fi preset (88 BPM: one beat = 0.682 s).
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-how.wav 14.4 how
//   node promo/make-tiktok-how.cjs promo/lofi-how.wav promo/quiet-library-how.mp4

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, kin, KIN_CSS, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-how.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-how.cjs <lofi-how.wav> [out.mp4]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-how-'));
const BEAT = 60 / 88;
const b = (beats) => beats * BEAT;
const LENGTH = b(21); // 14.3 s

const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v));
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeIn = (t) => t * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const tween = (g, t0, t1, a, c, fn = ease) => a + (c - a) * fn(clamp((g - t0) / (t1 - t0)));

// -- the worktable, seen from above (the press from videos 8 and 11, and an envelope) ---
const PRINT_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  #pr { position: fixed; inset: 0; z-index: 900; overflow: hidden; display: none; }
  #pr.on { display: block; }
  #pr .stage { position: absolute; inset: 0; transform-origin: 0 0; }
  #pr .env { position: absolute; left: 105px; top: 410px; width: 330px; height: 220px; transform-origin: 165px 110px; display: none;
      filter: drop-shadow(10px 16px 18px rgba(0,0,0,.5)); }
  #pr .env.on { display: block; }
  /* step 4: the reader in the armchair, more present than the library's usual faint visitors */
  .ghost.show { opacity: .58 !important; }
  .ghost .tt-book { opacity: 1; }
  #pr .env svg { width: 100%; height: 100%; overflow: visible; }
  #pr .table { position: absolute; inset: -30px; background:
      radial-gradient(ellipse at 32% 28%, rgba(255,214,150,.34), rgba(255,214,150,0) 58%),
      repeating-linear-gradient(90deg, rgba(0,0,0,.22) 0 2px, transparent 2px 108px),
      repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 1px, transparent 1px 9px),
      repeating-linear-gradient(0deg, rgba(0,0,0,.05) 0 3px, transparent 3px 23px),
      linear-gradient(180deg, #5d3c27, #4a2f1f 60%, #39231a); }
  #pr .vig { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 52%, transparent 42%, rgba(0,0,0,.6) 100%); }
  #pr .pile { position: absolute; left: -70px; top: 760px; width: 210px; height: 300px; }
  #pr .pile i { position: absolute; inset: 0; border-radius: 4px 10px 10px 4px; box-shadow: 6px 8px 16px rgba(0,0,0,.45); }
  #pr .cov { position: absolute; left: 120px; top: 300px; width: 300px; height: 450px; border-radius: 6px 14px 14px 6px;
      background: linear-gradient(90deg, rgba(0,0,0,.35), rgba(0,0,0,0) 7%, rgba(255,255,255,.07) 8%, rgba(0,0,0,0) 13%), var(--c);
      box-shadow: 14px 18px 32px rgba(0,0,0,.55), inset 0 0 0 1px rgba(0,0,0,.25); }
  #pr .cov .fr { position: absolute; inset: 20px 18px 20px 30px; border: 2px solid rgba(233,201,138,.5); border-radius: 3px; }
  #pr .cov .orn { position: absolute; left: 30px; right: 18px; text-align: center; font: 28px/1 'Cormorant Garamond', serif; color: rgba(233,201,138,.78); top: 52px; }
  #pr .cov .dots { position: absolute; left: 30px; right: 18px; text-align: center; font: 600 16px/1 'Cormorant Garamond', serif; letter-spacing: .5em; color: rgba(233,201,138,.6); bottom: 108px; }
  #pr .cov .lib { position: absolute; left: 30px; right: 18px; bottom: 58px; text-align: center; font: italic 600 17px/1 'Cormorant Garamond', serif; color: rgba(233,201,138,.75); }
  #pr .cov .nm { position: absolute; left: 34px; right: 22px; top: 172px; text-align: center; white-space: nowrap; font-weight: 700; font-family: 'Cormorant Garamond', serif; line-height: 1.1;
      background: linear-gradient(100deg, #b4863a 0%, #e9c46f 34%, #fff4c8 50%, #e9c46f 66%, #b4863a 100%); background-size: 340% 100%;
      -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 1px 0 rgba(0,0,0,.5)) drop-shadow(0 0 8px rgba(255,214,120,.35)); }
  #pr .cov .no { position: absolute; left: 30px; right: 18px; top: 236px; text-align: center; font: italic 600 20px/1 'Cormorant Garamond', serif;
      color: #f0cf82; text-shadow: 0 1px 0 rgba(0,0,0,.45); font-variant-numeric: lining-nums; font-feature-settings: 'lnum' 1; }
  #pr .cov .blank { position: absolute; left: 58px; right: 46px; top: 172px; height: 46px; border-bottom: 2px dashed rgba(240,207,130,.7); text-align: center;
      font: italic 600 26px/46px 'Cormorant Garamond', serif; color: rgba(240,207,130,.72); }
  #pr .shadow { position: absolute; left: 125px; top: 432px; width: 290px; height: 126px; border-radius: 14px; background: #000; }
  #pr .stamp { position: absolute; left: 125px; top: 432px; width: 290px; height: 126px; border-radius: 14px;
      background: linear-gradient(160deg, #6b4630, #4a2e1d 55%, #3a2316); box-shadow: inset 0 0 0 6px #b8913f, inset 0 0 0 8px #7a5a26, inset 0 10px 18px rgba(255,255,255,.12); }
  #pr .stamp .knob { position: absolute; left: 50%; top: 50%; width: 78px; height: 78px; margin: -39px 0 0 -39px; border-radius: 50%;
      background: radial-gradient(circle at 36% 32%, #c79a6b, #7a4a2b 45%, #4b2c1a 80%); box-shadow: 0 6px 12px rgba(0,0,0,.45), inset 0 -4px 8px rgba(0,0,0,.35); }
  #pr .stamp .tag { position: absolute; left: 18px; top: 50%; margin-top: -9px; font: 700 12px/18px 'Cormorant Garamond', serif; letter-spacing: .22em; color: #e6c983; }
  #pr .stamp .tag.r { left: auto; right: 18px; }
  #pr .flash { position: absolute; left: 70px; top: 380px; width: 400px; height: 240px; border-radius: 50%;
      background: radial-gradient(ellipse at 50% 50%, rgba(255,236,170,.9), rgba(255,214,120,.35) 40%, rgba(255,214,120,0) 70%); mix-blend-mode: screen; opacity: 0; }
  #pr .spark { position: absolute; width: 14px; height: 14px; margin: -7px 0 0 -7px; opacity: 0;
      background: radial-gradient(circle, #fff6d8 0 20%, rgba(255,214,120,.9) 30%, rgba(255,214,120,0) 70%);
      clip-path: polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%); }
  /* the bookcase up close: just the bookcase standing in the room */
  .tt-bare .friends-panel .shelf-head, .tt-bare .friends-panel .find-note, .tt-bare .friends-panel .shelf-more,
  .tt-bare .friends-panel .close, .tt-bare .friends-panel .empty-shelf { display: none !important; }
  /* light cloth (cream, pale gold) gets dark foil, as the library does on its light spines */
  #pr .cov.light .nm { background-image: linear-gradient(100deg, #3b2a1a 0%, #5b4024 34%, #9a7a45 50%, #5b4024 66%, #3b2a1a 100%); filter: drop-shadow(0 1px 0 rgba(255,255,255,.25)); }
  #pr .cov.light .no, #pr .cov.light .lib { color: #4a3420; text-shadow: none; }
  #pr .cov.light .orn, #pr .cov.light .dots { color: rgba(74,52,32,.75); }
  #pr .cov.light .fr { border-color: rgba(74,52,32,.45); }
  .tt-bare .friends-panel { background: transparent; box-shadow: none; max-height: none; overflow: visible; }
  .tt-bare .friends-panel .case { min-height: var(--case-h, 0); }
  .tt-bare .friends-panel .spine-reads { visibility: hidden; } /* no follower numbers */
  .spine.tt-plain .spine-title { visibility: hidden; } /* the books already on the shelf */
  /* a handle has no spaces to wrap at: let a long one break, a little smaller, instead of being cut off */
  .tt-bare .friends-panel .spine-title { overflow-wrap: anywhere; text-overflow: clip; }
  .tt-bare .friends-panel .spine.tt-long .spine-title { font-size: 11.5px; line-height: 1.1; }
`;

function pageSetup(earlier) {
  const lib = window.__lib;
  // the books already on the shelf stay plain, however often the bookcase is redrawn
  const plain = new Set(earlier);
  const mark = (root) => {
    for (const spine of [...(root.matches?.('.spine') ? [root] : []), ...(root.querySelectorAll?.('.spine') ?? [])]) {
      const title = spine.querySelector('.spine-title')?.textContent ?? '';
      if (plain.has(title)) spine.classList.add('tt-plain');
      if (title.length > 18) spine.classList.add('tt-long');
    }
  };
  new MutationObserver((records) => records.forEach((r) => r.addedNodes.forEach((node) => node.nodeType === 1 && mark(node))))
    .observe(document.body, { childList: true, subtree: true });
  window.__setPresence = lib.hall.setPresence;
  lib.hall.setPresence = () => {};
  Element.prototype.scrollIntoView = function () {};
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
  window.__frame = ({ hall, el }) => {
    if (hall) {
      lib.hall.teleport(hall.x);
      lib.hall.setCloseUp(hall.zoom, hall.focusY);
    }
    if (el) {
      const n = document.querySelector(el.sel);
      if (n) {
        n.style.transformOrigin = el.origin ?? '50% 50%';
        n.style.transform = el.css;
      }
    }
  };

  // the press table
  const pr = document.createElement('div');
  pr.id = 'pr';
  const cover = (id) => `<div class="cov" id="${id}"><div class="fr"></div><div class="orn">❦</div><div class="nm"></div><div class="blank">your name here</div>
    <div class="no"></div><div class="dots">· · ·</div><div class="lib">The Quiet Library</div></div>`;
  pr.innerHTML = `<div class="stage"><div class="table"></div>
    <div class="pile"><i style="background:#2f4b62;transform:rotate(-8deg)"></i><i style="background:#5a3d63;transform:rotate(-3deg) translate(14px,-16px)"></i><i style="background:#7b2e2a;transform:rotate(4deg) translate(26px,-34px)"></i></div>
    ${cover('c1')}${cover('c0')}
    <div class="flash"></div>${'<div class="spark"></div>'.repeat(12)}
    <div class="env"><svg viewBox="0 0 330 220">
      <rect width="330" height="220" rx="6" fill="#f1e6cf"/>
      <path d="M0 0L165 118 330 0M0 220L132 112M330 220L198 112" fill="none" stroke="#dccdaf" stroke-width="2"/>
      <g transform="translate(252 16)"><rect width="56" height="66" fill="#fbf6ea" stroke="#e9dcc0" stroke-width="4" stroke-dasharray="4 3"/>
        <rect x="6" y="6" width="44" height="54" fill="#2f4b62"/><circle cx="28" cy="30" r="10" fill="#141214"/><path d="M20 24l-2-10 7 6M36 24l2-10-7 6" fill="#141214"/>
        <path d="M24 30q4 3 8 0" stroke="#c8d65a" stroke-width="1.4" fill="none"/><path d="M12 50h32" stroke="#c9a45c" stroke-width="2"/></g>
      <g class="postmark" opacity="0" stroke="#7b2e2a" stroke-width="2.4" fill="none">
        <circle cx="262" cy="70" r="24"/><path d="M180 58q12-8 24 0t24 0M180 70q12-8 24 0t24 0M180 82q12-8 24 0t24 0"/>
        <text x="262" y="74" text-anchor="middle" font-family="Cormorant Garamond, serif" font-weight="700" font-size="10" fill="#7b2e2a" stroke="none">LATE</text></g>
      <g font-family="Caveat, cursive" fill="#3a2b20">
        <text x="28" y="40" font-size="20">from:</text><path d="M82 42h110" stroke="#9a8a74" stroke-width="1.6" stroke-dasharray="2 5"/>
        <text x="96" y="146" font-size="30" font-weight="700">to: the quiet library</text>
        <path d="M100 156q90 10 180-4" fill="none" stroke="#3a2b20" stroke-width="1.6" opacity=".5"/>
      </g>
    </svg></div>
    <div class="shadow"></div><div class="stamp"><span class="tag">THE QUIET</span><span class="tag r">LIBRARY</span><div class="knob"></div></div>
    <div class="vig"></div></div>`;
  document.body.append(pr);
  const sizes = new Map();
  function fit(nm, name) {
    if (!sizes.has(name)) {
      let px = 44;
      nm.style.fontSize = `${px}px`;
      nm.textContent = name;
      while (px > 18 && nm.scrollWidth > nm.clientWidth) nm.style.fontSize = `${--px}px`;
      sizes.set(name, px);
    }
    nm.style.fontSize = `${sizes.get(name)}px`;
    nm.textContent = name;
  }
  function paint(id, book) {
    const el = document.getElementById(id);
    if (!book) { el.style.display = 'none'; return; }
    el.style.display = '';
    el.style.setProperty('--c', book.color);
    el.classList.toggle('light', Boolean(book.light));
    el.style.transform = `translateX(${book.x.toFixed(1)}px) scale(${book.squash ?? 1})`;
    const nm = el.querySelector('.nm');
    fit(nm, book.name);
    nm.style.opacity = book.printed ? 1 : 0;
    nm.style.backgroundPosition = `${(100 - book.shine * 100).toFixed(1)}% 0`;
    const no = el.querySelector('.no');
    no.textContent = book.line ?? '';
    no.style.opacity = book.printed || book.blank ? 1 : 0;
    el.querySelector('.blank').style.display = book.blank ? '' : 'none';
  }
  window.__print = (st) => {
    pr.classList.toggle('on', st.on);
    if (!st.on) return;
    const env = pr.querySelector('.env');
    env.classList.toggle('on', Boolean(st.env));
    if (st.env) {
      env.style.transform = `translate(${st.env.x.toFixed(1)}px, ${st.env.y.toFixed(1)}px) rotate(${st.env.rot.toFixed(2)}deg)`;
      env.querySelector('.postmark').setAttribute('opacity', (0.75 * st.env.mark).toFixed(2));
    }
    const cam = st.cam ?? { s: 1, x: 0, y: 0 };
    pr.querySelector('.stage').style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})`;
    if (st.shake) pr.querySelector('.stage').style.transform += ` translate(${st.shake.toFixed(1)}px, ${(st.shake * 0.6).toFixed(1)}px)`;
    paint('c0', st.cur);
    paint('c1', st.prev);
    pr.querySelector('.stamp').style.display = st.h === null ? 'none' : '';
    pr.querySelector('.shadow').style.display = st.h === null ? 'none' : '';
    if (st.h === null) return;
    const h = st.h; // 0 = pressing down, 1 = high above
    const stamp = pr.querySelector('.stamp');
    stamp.style.transform = `translateY(${(-h * 430).toFixed(1)}px) scale(${(1 + 0.45 * h).toFixed(3)})`;
    const shadow = pr.querySelector('.shadow');
    shadow.style.transform = `translate(${(6 + 34 * h).toFixed(1)}px, ${(8 + 40 * h).toFixed(1)}px) scale(${(1 + 0.12 * h).toFixed(3)})`;
    shadow.style.filter = `blur(${(6 + 22 * h).toFixed(1)}px)`;
    shadow.style.opacity = (0.55 - 0.3 * h).toFixed(2);
    const f = st.flash; // seconds since the stamp hit, or null
    pr.querySelector('.flash').style.opacity = f === null ? 0 : Math.max(0, 1 - f / 0.28).toFixed(3);
    pr.querySelectorAll('.spark').forEach((s, i) => {
      if (f === null || f > 0.4) { s.style.opacity = 0; return; }
      const a = (i / 12) * Math.PI * 2 + 0.3;
      const r = 70 + 260 * (1 - (1 - f / 0.4) ** 2);
      s.style.left = `${(270 + Math.cos(a) * r * 1.2).toFixed(1)}px`;
      s.style.top = `${(495 + Math.sin(a) * r * 0.7).toFixed(1)}px`;
      s.style.opacity = (1 - f / 0.4).toFixed(2);
      s.style.transform = `scale(${(1.4 - f * 2).toFixed(2)})`;
    });
  };
}

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-06T21:30:00'),
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: false, time: 'night', rain: true, pace: 1, demo: 0 },
    storage: { 'ql.local.library': { version: 1, books: [] } }, // the story shelves are still empty
  });
  await page.addStyleTag({ content: KIN_CSS + PRINT_CSS });
  await page.evaluate(pageSetup, []);

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
      await frame(g);
      await film.shoot();
    }
  }
  const spot = (id) => js((s) => window.__lib.hall.spot(s).cx, id);
  const letters = await spot('shelf:letters');
  const chair = await spot('chair:0');
  const hallFrame = (cam) => js((f) => window.__frame(f), { hall: cam });

  // the envelope: slides in from the top right and lands on the table at 0.62 s
  const envAt = (g) => {
    const p = easeOut(clamp((g + 0.25) / 0.87));
    return { x: 380 * (1 - p), y: -520 * (1 - p), rot: -3 + 28 * (1 - p), mark: easeOut(clamp((g - b(3) - 0.5) / 0.12)) };
  };
  const tableCam = (g) => {
    const p = ease(clamp((g - b(3)) / 0.6));
    const s = 1 + 0.32 * p;
    // lean in on the blank "from:" line, the top left of the envelope (about 220, 450 on screen)
    return { s, x: -(220 * (s - 1)), y: -(450 * (s - 1)) };
  };

  // 0-1 · the hook, then step 1: you send it (no name needed)
  await cut(b(6), {
    setup: async () => {
      await say('what happens to|*the story you send me*', { step: 0 });
      await settle(); // all there on frame 0
    },
    frame: (g) => js((st) => window.__print(st), { on: true, env: envAt(g), cam: tableCam(g), cur: null, prev: null, h: null, flash: null, shake: 0 }),
    events: [{ at: b(3), run: () => say('*1.* you send it.|no name needed.', { step: 0.06 }) }],
  });

  // 2 · I bind it into a book: the stamp, "Your Story", by no one
  const cover = { name: 'Your Story', line: 'by no one', color: '#2f4b62' };
  await cut(b(9), {
    frame: (g) => {
      const t = g - b(6);
      const x = 560 * (1 - easeOut(clamp(t / 0.3)));
      let h = 1;
      if (t < 0.45) h = 1;
      else if (t < 0.8) h = 1 - easeIn((t - 0.45) / 0.35);
      else if (t < 0.88) h = 0;
      else h = easeOut(clamp((t - 0.88) / 0.4));
      const since = t - 0.8;
      return js((st) => window.__print(st), {
        on: true,
        env: null,
        cur: { ...cover, x, printed: since >= 0, shine: since >= 0 ? clamp(since / 0.7) : 0, squash: since >= 0 && since < 0.07 ? 0.985 : 1 },
        prev: null,
        h,
        flash: since >= 0 ? since : null,
        shake: since >= 0 && since < 0.12 ? Math.sin(since * 95) * 5 * (1 - since / 0.12) : 0,
      });
    },
    events: [{ at: b(6), run: () => say('*2.* I bind it|into a book.', { step: 0.06 }) }],
  });

  // 3 · it goes on a shelf (an empty one: it glows in)
  await cut(b(12), {
    setup: () => js(() => window.__print({ on: false })),
    frame: (g) => hallFrame({ x: letters - 65, zoom: tween(g, b(9), b(12), 1.75, 1.86), focusY: 220 }),
    events: [
      { at: b(9), run: () => say('*3.* it goes|on a shelf.', { step: 0.06 }) },
      // the id picks the spine colour: this one comes out the same blue as the stamped cover
      { at: b(9) + 0.5, run: () => js(() => window.__lib.hall.updateShelves([{ id: 'letters', books: [{ id: 'your-story-46', title: 'Your Story', reads: 0 }] }])) },
    ],
  });

  // 4 · a stranger reads it, in an armchair under the lamp; and the ask
  await cut(LENGTH, {
    setup: async () => {
      await js(() => window.__setPresence({ total: 2, zones: { reading: 1 } }, 'hall'));
      await page.clock.runFor(1600);
      // an open book in the reader's hands
      await js(() => {
        const svg = document.querySelector('.ghost.seated svg');
        svg.insertAdjacentHTML('beforeend', `<g class="tt-book" transform="translate(30 56) rotate(-8)">
          <path d="M-14 0q7-4 14 0v12q-7-4-14 0z" fill="#2f4b62"/><path d="M14 0q-7-4-14 0v12q7-4 14 0z" fill="#2f4b62"/>
          <path d="M-12 1q6-3 12 0v9q-6-3-12 0zM12 1q-6-3-12 0v9q6-3 12 0z" fill="#fbf6ea"/></g>`);
      });
      await settle();
    },
    frame: (g) => hallFrame({ x: chair - 20, zoom: tween(g, b(12), LENGTH, 1.85, 1.55), focusY: tween(g, b(12), LENGTH, 345, 330) }),
    events: [
      { at: b(12), run: () => say('*4.* a stranger|reads it.', { step: 0.06 }) },
      { at: b(15), run: () => say('and feels|*a little less alone.*', { step: 0.06 }) },
      { at: b(18), run: () => say('*send me yours.*|no names. ever.', { kicker: 'the quiet library', step: 0.06 }) },
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
