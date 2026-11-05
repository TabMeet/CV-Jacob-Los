// TikTok #14: new followers get their books printed, newest last, then the camera
// rises through every follower's book on the shelf and pulls back over all of them.
// About 15 seconds. No follower numbers anywhere (covers say "a new friend of the
// library"; spine numbers are hidden).
//
//   6 new followers. 6 new books.           the first one is stamped (the hook, on frame 0)
//   printing them one by one.               the next ones, a beat apart
//   and the newest…                         the stamp holds its breath, then the newest one
//   welcome to the library.                 they drop onto a fresh row of the bookcase
//   and everyone who came before.           up through every row: each row a batch of followers
//   thank you for being here.               the whole bookcase, every name on it
//   follow, and you're next.
//
// The new followers are promo/new-followers.txt and everyone (oldest first, the new
// ones last) is promo/all-followers.txt. Cut to the "everyone" lo-fi preset, made for
// the same number of new followers:
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-everyone.wav 15.05 everyone 6
//   node promo/make-tiktok-everyone.cjs promo/lofi-everyone.wav promo/quiet-library-everyone.mp4

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { openLibrary, createFilm, assemble, kin, KIN_CSS, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-everyone.mp4'), listFile = path.join(__dirname, 'new-followers.txt'), allFile = path.join(__dirname, 'all-followers.txt')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-everyone.cjs <lofi-everyone.wav> [out.mp4] [new-followers.txt] [all-followers.txt]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-everyone-'));
const BEAT = 60 / 88;
const b = (beats) => beats * BEAT;

const readList = (file) => fs.readFileSync(file, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
const NEW = readList(listFile);
const N = NEW.length;
if (N < 2) throw new Error('needs at least two new followers');
// Everyone who followed before, in order, already on the bookcase with their names.
const EARLIER = readList(allFile).filter((name) => !NEW.includes(name));

// -- the timing (lofi.py's "welcome" preset has the same, in beats) ------------------
const HERO = b(N + 1); // the newest one's turn
const SHELF = b(N + 4); // they drop onto the shelf
const RISE = b(N + 8); // up through everyone's books
const PULL = b(N + 12); // back over the whole bookcase
const LENGTH = b(N + 16);
const DROP_EVERY = 0.18;
function schedule() {
  const books = [{ start: -0.6, down: [-0.53, 0.22], up: [0.3, 0.58], slide: null }]; // halfway down on frame 0
  for (let i = 1; i < N - 1; i++) {
    const start = b(3 + i - 1);
    const dur = BEAT;
    books.push({ start, down: [start + 0.12 * dur, start + 0.4 * dur], up: [start + 0.46 * dur, start + 0.72 * dur], slide: [start, start + 0.2 * dur] });
  }
  // the newest: slides in, the stamp comes most of the way and holds, then comes down at 1 s
  books.push({ start: HERO, hover: [HERO + 0.3, HERO + 0.62], down: [HERO + 0.8, HERO + 1.0], up: [HERO + 1.08, HERO + 1.4], slide: [HERO, HERO + 0.3] });
  return books;
}
const BOOKS = schedule();

const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v));
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeIn = (t) => t * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// -- the press table, seen from above (the same as video 8) ---------------------------
const PRINT_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  #pr { position: fixed; inset: 0; z-index: 900; overflow: hidden; display: none; }
  #pr.on { display: block; }
  #pr .stage { position: absolute; inset: 0; }
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
    no.textContent = 'a new friend of the library';
    no.style.opacity = book.printed || book.blank ? 1 : 0;
    el.querySelector('.blank').style.display = book.blank ? '' : 'none';
  }
  window.__print = (st) => {
    pr.classList.toggle('on', st.on);
    if (!st.on) return;
    pr.querySelector('.stage').style.transform = `translate(${st.shake.toFixed(1)}px, ${(st.shake * 0.6).toFixed(1)}px)`;
    paint('c0', st.cur);
    paint('c1', st.prev);
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
  // the books' colours, the same as their spines on the shelf (where they're friends 29, 30, ...)
  const { spineStyle } = await import(pathToFileURL(path.join(__dirname, '..', 'public', 'js', 'art.js')).href);
  const shelfNo = (i) => EARLIER.length + i + 1;
  const book = (i) => {
    const color = spineStyle({ id: `friend-${shelfNo(i)}`, title: NEW[i] }).color;
    return { name: NEW[i], color, light: ['#d6c6a3', '#b8934f'].includes(color) };
  };

  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-03T20:30:00'),
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: false, time: 'night', rain: true, pace: 1, demo: 0 },
    storage: { 'ql.local.friends': { version: 1, friends: EARLIER.map((name, i) => ({ no: i + 1, name, added: Date.parse('2026-11-02') })) } },
  });
  await page.addStyleTag({ content: KIN_CSS + PRINT_CSS });
  await page.evaluate(pageSetup, []); // every name shows

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
  const quietly = (ms) => page.clock.runFor(ms);

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

  // -- the press, as a function of time ---------------------------------------------
  function pressAt(g) {
    let i = 0;
    while (i + 1 < BOOKS.length && BOOKS[i + 1].start <= g) i++;
    const s = BOOKS[i];
    const slideX = s.slide ? 560 * (1 - easeOut(clamp((g - s.slide[0]) / (s.slide[1] - s.slide[0])))) : 0;
    const printed = g >= s.down[1];
    const since = g - s.down[1];
    const held = s.hover ? 0.32 : 1; // how high the stamp is when it starts its last drop
    let h;
    if (s.hover && g < s.down[0]) h = 1 - (1 - held) * easeOut(clamp((g - s.hover[0]) / (s.hover[1] - s.hover[0]))) + (g > s.hover[1] ? 0.02 * Math.sin((g - s.hover[1]) * 14) : 0);
    else if (g < s.down[1]) h = held * (1 - easeIn(clamp((g - s.down[0]) / (s.down[1] - s.down[0]))));
    else if (g < s.up[0]) h = 0;
    else h = easeOut(clamp((g - s.up[0]) / (s.up[1] - s.up[0])));
    const squash = since >= 0 && since < 0.07 ? 0.985 : 1;
    const cur = { ...book(i), x: slideX, printed, shine: printed ? clamp(since / 0.7) : 0, squash };
    const prev = i > 0 && slideX > 0 ? { ...book(i - 1), x: slideX - 560, printed: true, shine: 1 } : null;
    const shake = since >= 0 && since < 0.12 ? Math.sin(since * 95) * 5 * (1 - since / 0.12) : 0;
    return { on: true, cur, prev, h, flash: since >= 0 ? since : null, shake };
  }

  // 1-3 · the hook, the next ones, and the newest one last
  await cut(SHELF, {
    setup: async () => {
      await say(`${N} new followers.|*${N} new books.*`, { step: 0 });
      await settle(); // all there on frame 0
    },
    frame: (g) => js((st) => window.__print(st), pressAt(g)),
    events: [
      ...(N > 2 ? [{ at: b(3), run: () => say('printing them|*one by one.*', { step: 0.05 }) }] : []),
      { at: HERO, run: () => say('and the newest…', { step: 0.08 }) },
    ],
  });

  // 4-6 · onto the shelf, up through everyone's books, and back over the whole bookcase
  let cam = { top: 0, first: 0, pitch: 210, caseTop: 0, caseH: 1200 };
  await cut(LENGTH, {
    setup: async () => {
      await js(() => window.__print({ on: false }));
      await js((x) => window.__lib.hall.teleport(x), await js(() => window.__lib.hall.spot('friends:0').cx));
      await js(() => document.body.classList.add('tt-bare'));
      await js(() => window.__lib.openFriendsCase(0));
      await quietly(900);
      // make room for the new rows before anything arrives, so nothing shifts, then measure
      cam = await js((rowsNeeded) => {
        const rows = [...document.querySelectorAll('.friends-panel .case-row')];
        const pitch = rows[1].getBoundingClientRect().top - rows[0].getBoundingClientRect().top;
        const c = document.querySelector('.friends-panel .case').getBoundingClientRect();
        document.body.style.setProperty('--case-h', `${c.height + pitch * rowsNeeded}px`);
        return { pitch };
      }, Math.ceil(N / 7));
      await quietly(50);
      Object.assign(cam, await js(() => {
        const rows = [...document.querySelectorAll('.friends-panel .case-row')];
        const c = document.querySelector('.friends-panel .case').getBoundingClientRect();
        return { top: rows.at(-1).getBoundingClientRect().top, first: rows[0].getBoundingClientRect().top, caseTop: c.top, caseH: c.height };
      }));
    },
    frame: (g) => {
      const newRow = cam.top + cam.pitch * 1.5; // the middle of the new row
      const firstRow = cam.first + cam.pitch * 0.5;
      let s;
      let ty;
      if (g < RISE) {
        s = 1.28 + 0.06 * ease(clamp((g - SHELF) / (RISE - SHELF)));
        ty = 590 - s * newRow;
      } else if (g < PULL) {
        const p = ease(clamp((g - RISE) / (PULL - RISE)));
        s = 1.34 + (1.12 - 1.34) * p;
        ty = 590 + (520 - 590) * p - s * (newRow + (firstRow - newRow) * p);
      } else {
        const p = ease(clamp((g - PULL) / b(2.4)));
        const fit = (928 - 255) / cam.caseH;
        s = 1.12 + (fit - 1.12) * p;
        ty = (520 - 1.12 * firstRow) + ((255 - fit * cam.caseTop) - (520 - 1.12 * firstRow)) * p;
      }
      return js((f) => window.__frame(f), { el: { sel: '.overlay', css: `translateY(${ty.toFixed(1)}px) scale(${s.toFixed(4)})`, origin: '50% 0' } });
    },
    events: [
      { at: SHELF, run: () => say('welcome to|*the library.*', { step: 0.05 }) },
      ...NEW.map((name, k) => ({ at: SHELF + 0.25 + k * DROP_EVERY, run: () => js((nm) => window.__lib.backend.addFriends([nm]), name) })),
      { at: RISE, run: () => say('and everyone|*who came before.*', { step: 0.06 }) },
      { at: PULL, run: () => say('thank you|*for being here.*', { kicker: 'the quiet library', step: 0.06 }) },
      { at: PULL + b(2.4), run: () => say('*follow,* and|you’re next.', { kicker: 'the quiet library', step: 0.06 }) },
    ],
  });

  await browser.close();
  assemble({ shots: [dir], transitions: [], audio, out, length: LENGTH, fadeIn: 0, fadeOut: 0, audioFadeOut: 0.05, loop: true });
  fs.rmSync(WORK, { recursive: true, force: true });
  console.log(`done: ${out} (${n} frames, ${N} new followers, ${EARLIER.length + N} on the shelf)`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
