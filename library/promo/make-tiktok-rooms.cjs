// TikTok #6: the writing rooms, as a 12-second loop with the hook on frame 0.
// TikTok's feedback on the first five: too long, and the first second needs a
// better hook. So this one is 11.6 s, and its very first frame already has the
// words on screen, the camera moving and two knocks on the soundtrack. It ends
// on the same door it opens on, so the loop runs straight back into the knock.
//
//   shh, don't knock. someone's writing in there.   the glowing writing-room door
//   4 little rooms at the back of a library.          the corridor, room 2 taken
//   write the thing you never said out loud.          a story being typed in room 4
//   no name. no profile. nobody will ever know.
//   then it goes on a shelf, for a stranger to find.  the library names it and binds it
//   what would you write in there?                    back to the door (the loop)
//
// Cut to the "rooms" lo-fi preset (88 BPM: one beat = 0.682 s, one bar = 2.727 s).
//
//   npm run build:local
//   python3 promo/lofi.py promo/lofi-rooms.wav 11.6 rooms
//   node promo/make-tiktok-rooms.cjs promo/lofi-rooms.wav promo/quiet-library-rooms.mp4

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openLibrary, createFilm, assemble, kin, KIN_CSS, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-rooms.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok-rooms.cjs <lofi-rooms.wav> [out.mp4]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-rooms-'));
const BEAT = 60 / 88;
const BAR = 4 * BEAT;
const at = (bar, beat = 0) => bar * BAR + beat * BEAT;
const LENGTH = at(4, 1); // 11.59 s: four bars and the downbeat the loop restarts on

// A staged story (the library isn't open yet). Only the first line is typed on camera;
// the rest is there so the library has something to name it from.
const TYPED = 'I never told anyone this, but after my grandpa died, I kept calling his number.';
const STORY = `${TYPED} Just to hear his voicemail. "You've reached Walt. Leave it after the beep, kiddo." ` +
  'I called every Sunday for two years and told him everything. Last week a stranger answered. I think I can finally say goodbye.';
const OPEN_ZOOM = 1.45; // the first and the last frame share this framing, for the loop

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t) => 1 - (1 - t) ** 3;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const tween = (g, t0, t1, a, b, fn = ease) => a + (b - a) * fn(clamp((g - t0) / (t1 - t0)));

const SCENE_CSS = `
  .studio-toggle, .frame-label, .hint, .toasts, .cat-bubble, .reader-bar, .reader-foot { display: none !important; }
  /* the "shelved" card, trimmed to the book, its title and the librarian's line */
  .shelved .keep-key, .shelved .row, .shelved .close { display: none !important; }
  .room .title-ideas, .room .row:has(> .btn.quiet) { display: none !important; }
  /* the corridor without its heading (the captions say it), so the four doors fit below them */
  .corridor h2, .corridor .lede, .corridor .close { display: none !important; }
  /* room 4, framed for a phone: the page starts below the captions, the story in big type */
  .room { padding-top: 190px; }
  .room .room-bar { display: none !important; }
  .room .story-input { font-size: 29px; line-height: 42px; }
  .room .sheet { background-image: repeating-linear-gradient(transparent 0 41px, rgba(91,79,69,.12) 41px 42px); }
`;

function pageSetup() {
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
  window.__frame = ({ hall, el }) => {
    if (hall) {
      lib.hall.teleport(hall.x);
      lib.hall.setCloseUp(hall.zoom, hall.focusY);
    }
    if (el) {
      const n = document.querySelector(el.sel);
      if (n) {
        n.style.transformOrigin = el.origin ?? '50% 50%';
        n.style.transform = `scale(${el.scale.toFixed(4)})`;
      }
    }
  };
}

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-01T23:10:00'),
    // 3 staged visitors: one of them is writing in room 2 (see DEMO_SPOTS in studio.js)
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: false, time: 'night', rain: true, pace: 1, demo: 3 },
  });
  await page.addStyleTag({ content: KIN_CSS + SCENE_CSS });
  await page.evaluate(pageSetup);

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
  const click = (sel) => js((s) => {
    const node = document.querySelector(s);
    if (!node) throw new Error(`nothing to click: ${s}`);
    node.click();
  }, sel);

  // Hard cuts only. Each cut films until `until`; events fire on their frame, and
  // `type` types one character every 1 or 2 frames (a fast, uneven typist).
  async function cut(until, { setup, camera = () => ({}), events = [] }) {
    await settle();
    if (setup) await setup();
    const queue = [...events].sort((a, b) => a.at - b.at);
    let typing = null;
    while (n < Math.round(until * FPS)) {
      const g = n / FPS;
      while (queue.length && queue[0].at <= g) {
        const ev = queue.shift();
        if (ev.type) typing = { text: [...ev.type], k: 0, next: g };
        else await ev.run();
      }
      if (typing && typing.k < typing.text.length && g >= typing.next - 1e-6) {
        await page.keyboard.type(typing.text[typing.k++]);
        typing.next = g + (typing.k % 3 === 0 ? 2 : 1) / FPS;
      }
      const c = camera(g);
      await js((f) => window.__frame(f), { hall: c.hall ?? null, el: c.el ?? null });
      await film.shoot();
    }
  }

  const writingX = await js(() => window.__lib.hall.spot('writing').cx);
  const doorLit = () => js(() => window.__setPresence({ total: 2, zones: { 'writing:2': 1 } }, 'hall'));

  // 1 · the hook, on frame 0: words already up, the camera already pushing in, two knocks
  await cut(at(0, 2), {
    setup: async () => {
      await doorLit();
      await quietly(1500);
      await settle();
      await say('shh, don’t knock.|*someone’s writing*|*in there.*', { step: 0 });
      await settle(); // fully on screen on the very first frame
    },
    camera: (g) => ({ hall: { x: writingX, zoom: tween(g, 0, at(0, 2), OPEN_ZOOM, 1.74, easeOut), focusY: 245 } }),
  });

  // 2 · the corridor: four rooms, two of them taken
  await cut(at(1), {
    setup: async () => {
      await js((x) => window.__lib.hall.teleport(x), writingX);
      await click('button.hotspot[aria-label="Go into the writing rooms"]');
      await quietly(700);
    },
    camera: (g) => ({ el: { sel: '.panel.corridor', scale: tween(g, at(0, 2), at(1), 0.86, 0.93), origin: '50% 62%' } }),
    events: [{ at: at(0, 2), run: () => say('4 little rooms|*at the back of a library.*', { step: 0.05 }) }],
  });

  // 3 · room 4: a story typed fast, no name anywhere, the library will title it
  await cut(at(2, 2), {
    setup: async () => {
      await click('button.room-door[aria-label^="Writing room 4"]');
      await quietly(800);
      await js(() => {
        const lib = document.querySelector('.room input[value="library"]');
        lib.checked = true;
        lib.dispatchEvent(new Event('change', { bubbles: true }));
        const story = document.querySelector('.story-input');
        story.placeholder = '';
        story.focus();
      });
      await quietly(400);
    },
    camera: (g) => ({ el: { sel: '.room', scale: tween(g, at(1), at(2, 2), 1.05, 1.0), origin: '50% 40%' } }),
    events: [
      { at: at(1), run: () => say('write the thing|*you never said out loud.*', { step: 0.05 }) },
      { at: at(1) + 0.08, type: TYPED },
      { at: at(1, 3), run: () => say('no name. no profile.|*nobody will ever know.*', { step: 0.05 }) },
    ],
  });

  // 4 · the library names it, binds it in cloth, and shelves it
  await cut(at(3, 1), {
    setup: async () => {
      await js((story) => {
        const box = document.querySelector('.story-input');
        box.value = story;
        box.dispatchEvent(new Event('input', { bubbles: true }));
      }, STORY);
      await click('.sheet-foot .btn');
      await quietly(2400);
    },
    camera: (g) => ({ el: { sel: '.overlay .panel.shelved', scale: tween(g, at(2, 2), at(3, 1), 1.0, 1.06), origin: '50% 45%' } }),
    events: [{ at: at(2, 2), run: () => say('then it goes on a shelf,|*for a stranger to find.*', { step: 0.05 }) }],
  });

  // 5 · back at the door, the question, and the loop
  await cut(LENGTH, {
    setup: async () => {
      await page.keyboard.press('Escape');
      await quietly(700);
      await doorLit();
      await quietly(600);
    },
    camera: (g) => ({ hall: { x: writingX, zoom: tween(g, at(3, 1), LENGTH, 1.2, OPEN_ZOOM, easeOut), focusY: 245 } }),
    events: [{ at: at(3, 1), run: () => say('what would *you*|*write* in there?', { kicker: 'the quiet library · opening soon', step: 0.06 }) }],
  });

  await browser.close();
  assemble({ shots: [dir], transitions: [], audio, out, length: LENGTH, fadeIn: 0, fadeOut: 0, audioFadeOut: 0.05 });
  fs.rmSync(WORK, { recursive: true, force: true });
  console.log(`done: ${out} (${n} frames)`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
