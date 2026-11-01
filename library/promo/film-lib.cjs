// Shared helpers for filming the local edition frame by frame.
// Time inside the page is faked (Playwright clock) and every CSS animation is
// stepped by hand, so each frame is exactly 1/FPS seconds after the last.
const { chromium } = require('playwright');

const FPS = 30;

async function openLibrary({ file, width = 540, height = 960, scale = 2, startTime, studio, seed = 7 }) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  await page.clock.install({ time: startTime });
  await page.addInitScript(({ studio, seed }) => {
    // Same "random" choices on every run.
    let s = seed >>> 0;
    Math.random = () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x6d2b79f5) >>> 0) / 4294967296);
    localStorage.setItem('ql.studio', JSON.stringify(studio));
    localStorage.setItem('ql.local.welcomed', 'true');
    localStorage.setItem('ql.visited', 'true');
    addEventListener('library:ready', (e) => { window.__lib = e.detail; });
    // Step every CSS animation/transition to the page's (fake) time.
    const seen = new WeakMap();
    window.__stepAnimations = (now) => {
      for (const a of document.getAnimations()) {
        let st = seen.get(a);
        if (!st) {
          st = { start: now, offset: a.currentTime ?? 0 };
          seen.set(a, st);
          a.pause();
        }
        a.currentTime = st.offset + (now - st.start);
      }
    };
  }, { studio, seed });
  await page.goto(`file://${file}`);
  await page.waitForFunction(() => window.__lib);
  await page.evaluate(() => document.fonts.ready);
  // An installed clock keeps flowing in real time (screenshots take ~50 ms each,
  // which would leak into the page). Pause it: from now on time only moves
  // when we call runFor(), exactly 1/FPS per frame.
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 1000);
  return { browser, page };
}

function createFilm(page, onFrame) {
  let frame = 0;
  const film = {
    get frame() { return frame; },
    get time() { return frame / FPS; },
    async shoot() {
      await page.clock.runFor(1000 / FPS);
      await page.evaluate(() => window.__stepAnimations(performance.now()));
      const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
      frame++;
      await onFrame(buf, frame);
    },
    async hold(seconds) {
      const n = Math.round(seconds * FPS);
      for (let i = 0; i < n; i++) await film.shoot();
    },
    async until(t) {
      while (frame < Math.round(t * FPS)) await film.shoot();
    },
    /** Type text one key at a time, a few frames per key. */
    async type(text, framesPerKey = 2) {
      for (const ch of text) {
        await page.keyboard.type(ch);
        for (let i = 0; i < framesPerKey; i++) await film.shoot();
      }
    },
  };
  return film;
}

module.exports = { FPS, openLibrary, createFilm };
