// TikTok #13: Ink asks for a like. 14.3 seconds. A guilt trip from a cat, then the
// call to action: like, comment, and share -> copy link, to support a small creator
// (and Ink). Arrows point at where TikTok puts those buttons, down the right edge.
//
//   Ink would like a word with you.           Ink, close up, staring (the hook)
//   you've been watching for a while now…     half-closed eyes
//   and you still haven't liked it.           his eyes slide to the like button; dun, dun
//   it's okay. he forgives you.               a slow blink
//   support a small creator (and Ink)         Ink looks at the buttons: like, comment, copy link
//
// Cut to the "ink2" lo-fi preset (88 BPM: one beat = 0.682 s).
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-ink2.wav 14.4 ink2
//   node promo/make-tiktok-ink-support.cjs promo/lofi-ink2.wav promo/quiet-library-ink-support.mp4

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, kin, KIN_CSS, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-ink-support.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-ink-support.cjs <lofi-ink2.wav> [out.mp4]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-ink2-'));
const BEAT = 60 / 88;
const b = (beats) => beats * BEAT;
const LENGTH = b(21); // 14.3 s
const CAT_X = 497;
// Where TikTok's buttons sit down the right edge of a 9:16 video (roughly; it varies a
// little by phone): like, comment, share. Arrows aim here.
const BUTTONS = [
  { key: 'like', y: 505, label: 'like', at: b(11.5) },
  { key: 'comment', y: 600, label: 'comment', at: b(13) },
  { key: 'share', y: 760, label: 'copy link', at: b(14.5) },
];

const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const tween = (g, t0, t1, a, c, fn = ease) => a + (c - a) * fn(clamp((g - t0) / (t1 - t0)));

const ICONS = {
  like: '<path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.4 5c2.1 0 3.4 1.2 4.1 2.4h3c.7-1.2 2-2.4 4.1-2.4C21 5 23 8.6 21.6 11.8 19.5 16.4 12 21 12 21z" transform="translate(0 -1)"/>',
  comment: '<path d="M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>',
  share: '<path d="M14 4l8 7.5-8 7.5v-4.6c-5.5 0-9.3 1.7-12 5.6 1.1-5.6 4.4-10.6 12-11.6z"/>',
};

const SCENE_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  .tt-eyes .cat .cat-pupils { transform: translate(var(--px), 0.6px) !important; transition: none !important; }
  .tt-eyes .cat .cat-head { transform: rotate(var(--tilt)) !important; transition: none !important; }
  .tt-judge .cat .cat-lids { transform: scaleY(.5) !important; animation: none !important; }
  .cat.tt-slow .cat-lids { animation: tt-slow-blink 1.5s ease-in-out both; }
  @keyframes tt-slow-blink { 0% { transform: scaleY(0); } 40%, 62% { transform: scaleY(.9); } 100% { transform: scaleY(0); } }

  /* the call to action: arrows to TikTok's like, comment and share buttons */
  #sup { position: fixed; inset: 0; z-index: 990; pointer-events: none; }
  #sup .row { position: absolute; left: 0; right: 0; height: 0; opacity: 0; }
  #sup .pill { position: absolute; right: 112px; top: -27px; display: flex; align-items: center; gap: 10px; padding: 6px 18px 9px 14px; border-radius: 16px;
      background: rgba(22,14,9,.86); box-shadow: 0 6px 20px rgba(0,0,0,.4); font: 700 30px/1 'Cormorant Garamond', serif; color: #fff6e2; white-space: nowrap; }
  #sup .pill svg { width: 28px; height: 28px; fill: #f6c25b; filter: drop-shadow(0 0 10px rgba(246,194,91,.5)); }
  #sup .arrow { position: absolute; right: 44px; top: -18px; width: 66px; height: 36px; overflow: visible; }
  #sup .arrow path { fill: none; stroke: #fbe7b8; stroke-width: 4.5; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 2px 5px rgba(0,0,0,.7)); }
  #sup .ring { position: absolute; right: 12px; top: -24px; width: 48px; height: 48px; border-radius: 50%; border: 3px solid #fbe7b8; opacity: 0; }
`;

function pageSetup({ buttons, icons }) {
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
  const sup = document.createElement('div');
  sup.id = 'sup';
  sup.innerHTML = buttons.map((btn) => `<div class="row" data-key="${btn.key}" style="top:${btn.y}px">
      <span class="pill"><svg viewBox="0 0 24 24">${icons[btn.key]}</svg>${btn.label}</span>
      <svg class="arrow" viewBox="0 0 66 36"><path d="M2 26C20 30 40 26 58 14"/><path d="M47 9l12 5-5 12"/></svg>
      <i class="ring"></i></div>`).join('');
  document.body.append(sup);
  // per frame: the camera, Ink's eyes and head, and the arrows (each pops in, then breathes)
  window.__frame = ({ hall, px = 0, tilt = 0, sup: rows }) => {
    lib.hall.teleport(hall.x);
    lib.hall.setCloseUp(hall.zoom, hall.focusY);
    document.documentElement.style.setProperty('--px', `${px.toFixed(2)}px`);
    document.documentElement.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`);
    for (const row of sup.querySelectorAll('.row')) {
      const st = rows?.[row.dataset.key];
      row.style.opacity = st ? st.in.toFixed(3) : 0;
      if (!st) continue;
      row.style.transform = `translateX(${((1 - st.in) * 40).toFixed(1)}px) scale(${(0.85 + 0.15 * st.pop).toFixed(3)})`;
      row.style.transformOrigin = 'right center';
      const ring = row.querySelector('.ring');
      ring.style.opacity = (st.ring * 0.9).toFixed(3);
      ring.style.transform = `scale(${(0.6 + st.ringGrow * 0.9).toFixed(3)})`;
      row.querySelector('.arrow').style.transform = `translateX(${(st.nudge * 6).toFixed(1)}px)`;
    }
  };
  window.__cat = (cls, on) => {
    const cat = document.querySelector('.item.cat');
    if (on) {
      cat.classList.remove(cls);
      void cat.offsetWidth;
    }
    cat.classList.toggle(cls, on);
  };
  window.__mode = (cls, on) => document.body.classList.toggle(cls, on);
}

// the arrows' state at time g: fade/slide in, a pop, a nudge towards the button, a pulsing ring
function arrowsAt(g) {
  const rows = {};
  for (const btn of BUTTONS) {
    const t = g - btn.at;
    if (t < 0) continue;
    const ring = (t % 1.2) / 1.2;
    rows[btn.key] = {
      in: easeOut(clamp(t / 0.25)),
      pop: t < 0.35 ? 1 + 0.6 * Math.sin((t / 0.35) * Math.PI) : 1,
      nudge: Math.max(0, Math.sin(t * 5)),
      ring: t > 0.2 ? 1 - ring : 0,
      ringGrow: ring,
    };
  }
  return rows;
}

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-04T19:40:00'),
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: false, time: 'night', rain: true, pace: 1, demo: 0 },
  });
  await page.addStyleTag({ content: KIN_CSS + SCENE_CSS });
  await page.evaluate(pageSetup, { buttons: BUTTONS, icons: ICONS });

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

  // 1 · the hook: Ink, close up, staring
  await cut(b(3), {
    setup: async () => {
      await say('Ink would like|*a word with you.*', { step: 0 });
      await settle(); // all there on frame 0
    },
    camera: (g) => ({ hall: { x: CAT_X, zoom: tween(g, 0, b(3), 3.3, 3.6, easeOut), focusY: 312 } }),
    events: [{ at: 0.45, run: () => cat('twitch') }],
  });

  // 2 · half-closed eyes
  await cut(b(6), {
    setup: () => mode('tt-judge'),
    camera: (g) => ({ hall: { x: CAT_X, zoom: tween(g, b(3), b(6), 3.0, 3.2), focusY: 312 } }),
    events: [{ at: b(3), run: () => say('you’ve been watching|*for a while now…*', { step: 0.06 }) }],
  });

  // 3 · his eyes slide over to the like button. dun, dun.
  await cut(b(9), {
    setup: () => mode('tt-eyes'),
    camera: (g) => {
      const look = easeOut(clamp((g - b(6) - 0.1) / 0.3));
      const punch = (g >= b(6) + 0.35 ? 0.15 : 0) + (g >= b(6) + 0.8 ? 0.2 : 0);
      return { hall: { x: CAT_X, zoom: 3.2 + punch, focusY: 312 }, px: 2.8 * look, tilt: 6 * look };
    },
    events: [{ at: b(6), run: () => say('and you still|*haven’t liked it.*', { step: 0.06 }) }],
  });

  // 4 · a slow blink: all is forgiven
  await cut(b(11), {
    setup: async () => {
      await mode('tt-judge', false);
      await mode('tt-eyes', false);
      await cat('tt-slow');
    },
    camera: (g) => ({ hall: { x: CAT_X, zoom: tween(g, b(9), b(11), 3.3, 3.45), focusY: 312 } }),
    events: [{ at: b(9), run: () => say('it’s okay.|*he forgives you.*', { step: 0.06 }) }],
  });

  // 5 · the ask: Ink on the left, looking at the buttons; the arrows pop in one by one
  await cut(LENGTH, {
    setup: async () => {
      await cat('tt-slow', false);
      await mode('tt-eyes');
    },
    camera: (g) => ({
      hall: { x: 540, zoom: tween(g, b(11), LENGTH, 1.5, 1.6), focusY: 345 },
      px: 2.8,
      tilt: 7 + Math.sin(g * 2.2) * 1.2,
      sup: arrowsAt(g),
    }),
    events: [
      { at: b(11), run: () => say('support a small creator|*(and Ink)*', { kicker: 'the quiet library', step: 0.06 }) },
      { at: b(16), run: () => cat('twitch') },
      { at: b(18.5), run: () => cat('tt-slow') },
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
