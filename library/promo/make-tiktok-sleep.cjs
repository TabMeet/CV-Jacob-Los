// TikTok #15: "shh… Ink is asleep." 14.2 seconds of Ink curled up on the windowsill,
// rain on the glass, breathing slowly, purring, dreaming about books; ending on an easy
// comment: whisper goodnight.
//
//   shh… Ink is asleep.                     close on Ink, asleep (the hook)
//   he guarded the shelves all night.       the big window, rain, Ink on the sill
//   he's dreaming about stories.            a dream bubble with a little open book
//   whisper goodnight in the comments.      Ink, his tail tip flicking
//
// The sleeping Ink is drawn for this video and laid on the hall's windowsill in place
// of the sitting one. Cut to the "sleep" lo-fi preset (72 BPM: one beat = 0.833 s); his
// breathing (one breath every 3.2 s) matches the purr in the music.
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-sleep.wav 14.25 sleep
//   node promo/make-tiktok-sleep.cjs promo/lofi-sleep.wav promo/quiet-library-sleep.mp4

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, kin, KIN_CSS, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-sleep.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-sleep.cjs <lofi-sleep.wav> [out.mp4]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-sleep-'));
const BEAT = 60 / 72;
const b = (beats) => beats * BEAT;
const LENGTH = b(17); // 14.2 s
const BREATH = 3.2; // seconds, the same as the purr in lofi.py

const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const tween = (g, t0, t1, a, c, fn = ease) => a + (c - a) * fn(clamp((g - t0) / (t1 - t0)));

// Ink, curled up asleep, facing left: drawn in the same colours as the sitting Ink.
// 160 x 96, laid on the sill at x 420, y 292 in the hall.
const SLEEPING_INK = `<svg viewBox="0 0 160 96" width="160" height="96" style="overflow:visible">
  <ellipse cx="84" cy="92" rx="70" ry="5" fill="#000" opacity=".3"/>
  <g class="body">
    <path d="M30 89C22 60 54 34 94 36c34 2 56 24 52 53z" fill="#141214"/>
    <path d="M70 42q30-8 56 10" fill="none" stroke="#fff" stroke-width="2" opacity=".07" stroke-linecap="round"/>
    <ellipse cx="54" cy="86" rx="9" ry="5" fill="#f2f0ea"/><ellipse cx="70" cy="88" rx="9" ry="4.5" fill="#f2f0ea"/>
  </g>
  <g class="tail">
    <path d="M140 84c4 8-14 10-48 9-24-1-46-2-56-4" fill="none" stroke="#141214" stroke-width="12" stroke-linecap="round"/>
    <path class="tip" d="M38 89c-6-1-10-2-14-4" fill="none" stroke="#f2f0ea" stroke-width="10" stroke-linecap="round"/>
  </g>
  <g class="head">
    <path d="M28 52L24 28l20 14z" fill="#141214"/><path d="M30 46l-2-12 9 8z" fill="#c98f8f"/>
    <g class="ear"><path d="M54 42l8-22 6 24z" fill="#141214"/><path d="M57 38l4-12 4 13z" fill="#c98f8f"/></g>
    <ellipse cx="46" cy="62" rx="26" ry="22" fill="#141214"/>
    <path d="M46 52c-3 6-12 10-12 18 0 6 6 9 12 9s12-3 12-9c0-8-9-12-12-18z" fill="#f2f0ea"/>
    <path d="M30 59q6 5 12 0M50 59q6 5 12 0" fill="none" stroke="#c8d65a" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>
    <path d="M43 67h6l-3 3.5z" fill="#d18c92"/>
    <g stroke="#ece8de" stroke-width=".8" opacity=".85" stroke-linecap="round"><path d="M38 70l-20-2M38 72l-19 4M54 70l20-2M54 72l19 4"/></g>
  </g>
  <g class="zzz" font-family="Caveat, cursive" font-weight="700" fill="#f3ead8">
    <text class="z0" x="0" y="0">z</text><text class="z1" x="0" y="0">z</text><text class="z2" x="0" y="0">z</text>
  </g>
  <g class="dream" opacity="0">
    <circle class="d0" cx="72" cy="30" r="4" fill="#f6efe1"/>
    <circle class="d1" cx="84" cy="16" r="7" fill="#f6efe1"/>
    <g class="d2"><g transform="translate(-16 0)">
      <path d="M80-20c-2-12 12-20 22-14 6-10 24-10 28 2 12-4 24 6 18 18 10 4 8 20-4 20H88c-14 0-18-18-8-26z" fill="#f6efe1"/>
      <g transform="translate(116 -12)">
        <path d="M-20 4q10-6 20 0v16q-10-6-20 0z" fill="#7b2e2a"/><path d="M20 4q-10-6-20 0v16q10-6 20 0z" fill="#2f4b62"/>
        <path d="M-18 6q9-5 18 0v12q-9-5-18 0zM18 6q-9-5-18 0v12q9-5 18 0z" fill="#fbf6ea"/>
        <path d="M-14 9h10M-14 12h10M4 9h10M4 12h10" stroke="#b7aa94" stroke-width=".8"/>
        <path d="M-4-6l1.5 3 3 1.5-3 1.5L-4 3l-1.5-3-3-1.5 3-1.5zM10-10l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#f2c46d"/>
      </g>
    </g></g>
  </g>
</svg>`;

const SCENE_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  .item.cat { visibility: hidden; } /* the sitting Ink: asleep tonight */
  .tt-sleeping { position: absolute; left: 420px; top: 292px; width: 160px; height: 96px; z-index: 3; pointer-events: none; }
  .tt-sleeping svg { overflow: visible; }
`;

function pageSetup(svg) {
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
  const ink = document.createElement('div');
  ink.className = 'tt-sleeping';
  ink.innerHTML = svg;
  document.getElementById('world').append(ink);
  const $ = (sel) => ink.querySelector(sel);
  // per frame: the camera and Ink (breathing, his ear, his tail, the z's, the dream)
  window.__frame = ({ hall, ink: st }) => {
    lib.hall.teleport(hall.x);
    lib.hall.setCloseUp(hall.zoom, hall.focusY);
    $('.body').setAttribute('transform', `translate(0 ${(89 * (1 - st.chest)).toFixed(2)}) scale(1 ${st.chest.toFixed(4)})`);
    $('.head').setAttribute('transform', `translate(0 ${(-1.6 * st.breath).toFixed(2)}) rotate(${(st.breath * 1.5).toFixed(2)} 46 80)`);
    $('.ear').setAttribute('transform', `rotate(${st.ear.toFixed(1)} 60 42)`);
    $('.tip').setAttribute('transform', `rotate(${st.tip.toFixed(1)} 38 89)`);
    st.z.forEach((z, i) => {
      const el = $(`.z${i}`);
      el.setAttribute('x', z.x.toFixed(1));
      el.setAttribute('y', z.y.toFixed(1));
      el.setAttribute('font-size', z.size.toFixed(1));
      el.setAttribute('opacity', z.a.toFixed(2));
    });
    const dream = $('.dream');
    dream.setAttribute('opacity', st.dream.a.toFixed(2));
    ['.d0', '.d1', '.d2'].forEach((sel, i) => {
      const s = st.dream.parts[i];
      const [cx, cy] = [[72, 30], [84, 16], [94, -8]][i];
      $(sel).setAttribute('transform', `translate(${cx} ${cy}) scale(${s.toFixed(3)}) translate(${-cx} ${-cy})`);
    });
  };
}

// Ink at time g: breathing, an ear twitch now and then, the tip of his tail, three z's, the dream
const TWITCHES = [0.6, b(5.2), b(13.5)];
const FLICKS = [b(2.5), b(9.5), b(14.5)];
function inkAt(g) {
  const breath = 0.5 - 0.5 * Math.cos((2 * Math.PI * g) / BREATH);
  const bump = (t0, len, amp) => {
    const t = g - t0;
    return t < 0 || t > len ? 0 : amp * Math.sin((t / len) * Math.PI * 2) * (1 - t / len);
  };
  const ear = TWITCHES.reduce((a, t0) => a + bump(t0, 0.35, -22), 0);
  const tip = FLICKS.reduce((a, t0) => a + bump(t0, 0.6, 18), 0);
  const z = [0, 1, 2].map((i) => {
    const p = (((g + i * 0.9) % 2.7) + 2.7) % 2.7 / 2.7;
    return { x: 66 + 24 * p + 4 * Math.sin(p * 6), y: 36 - 46 * p, size: 11 + 10 * p, a: Math.sin(Math.PI * p) * 0.9 };
  });
  const dreamOn = clamp((g - b(8) - 0.2) / 0.3) * (1 - clamp((g - b(13)) / 0.6));
  const part = (i) => easeOut(clamp((g - b(8) - 0.2 - i * 0.22) / 0.3));
  return {
    breath,
    chest: 1 + 0.035 * breath,
    ear,
    tip,
    z,
    dream: { a: dreamOn, parts: [part(0), part(1), part(2) * (1 + 0.03 * Math.sin(g * 3))] },
  };
}

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-06T01:30:00'),
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: false, time: 'night', rain: true, pace: 1, demo: 0 },
  });
  await page.addStyleTag({ content: KIN_CSS + SCENE_CSS });
  await page.evaluate(pageSetup, SLEEPING_INK);

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

  async function cut(until, { setup, camera, events = [] }) {
    await settle();
    if (setup) await setup();
    const queue = [...events].sort((a, c) => a.at - c.at);
    while (n < Math.round(until * FPS)) {
      const g = n / FPS;
      while (queue.length && queue[0].at <= g) await queue.shift().run();
      await js((f) => window.__frame(f), { hall: camera(g), ink: inkAt(g) });
      await film.shoot();
    }
  }

  // 1 · the hook: close on Ink, asleep
  await cut(b(4), {
    setup: async () => {
      await say('shh…|*Ink is asleep.*', { step: 0 });
      await settle(); // all there on frame 0
    },
    camera: (g) => ({ x: 492, zoom: tween(g, 0, b(4), 2.0, 2.2, easeOut), focusY: 330 }),
  });

  // 2 · the big window, rain, Ink on the sill
  await cut(b(8), {
    camera: (g) => ({ x: tween(g, b(4), b(8), 438, 452), zoom: tween(g, b(4), b(8), 1.32, 1.4), focusY: 262 }),
    events: [{ at: b(4), run: () => say('he guarded the shelves|*all night.*', { step: 0.06 }) }],
  });

  // 3 · dreaming
  await cut(b(12), {
    camera: (g) => ({ x: 508, zoom: tween(g, b(8), b(12), 2.0, 2.12), focusY: 312 }),
    events: [{ at: b(8), run: () => say('he’s dreaming|*about stories.*', { step: 0.06 }) }],
  });

  // 4 · whisper goodnight
  await cut(LENGTH, {
    camera: (g) => ({ x: 490, zoom: tween(g, b(12), LENGTH, 1.75, 1.95), focusY: 326 }),
    events: [{ at: b(12), run: () => say('whisper goodnight|*in the comments.*', { kicker: 'the quiet library', step: 0.06 }) }],
  });

  await browser.close();
  assemble({ shots: [dir], transitions: [], audio, out, length: LENGTH, fadeIn: 0, fadeOut: 0, audioFadeOut: 0.05, loop: true });
  fs.rmSync(WORK, { recursive: true, force: true });
  console.log(`done: ${out} (${n} frames)`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
