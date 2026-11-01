// Shared helpers for filming the local edition frame by frame.
// Time inside the page is faked (Playwright clock) and every CSS animation is
// stepped by hand, so each frame is exactly 1/FPS seconds after the last.
const { chromium } = require('playwright');

const FPS = 30;

async function openLibrary({ file, width = 540, height = 960, scale = 2, startTime, studio, seed = 7, storage = {} }) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  await page.clock.install({ time: startTime });
  await page.addInitScript(({ studio, seed, storage }) => {
    // Same "random" choices on every run.
    let s = seed >>> 0;
    Math.random = () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x6d2b79f5) >>> 0) / 4294967296);
    localStorage.setItem('ql.studio', JSON.stringify(studio));
    localStorage.setItem('ql.local.welcomed', 'true');
    localStorage.setItem('ql.visited', 'true');
    // Staged content for a video (e.g. a library with read counts), set before the app loads.
    if (!sessionStorage.getItem('tt.staged')) {
      for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      sessionStorage.setItem('tt.staged', '1');
    }
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
  }, { studio, seed, storage });
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

/**
 * Join shots (folders of numbered JPEGs) with transitions on given times, apply the warm
 * grade, and add the music, normalised for TikTok (-14 LUFS, peaks limited).
 * transitions: [{ kind: 'fade' | 'fadeblack' | ..., at: seconds (the cut), duration }]
 */
function assemble({ shots, transitions, audio, out, length }) {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const inputs = shots.flatMap((dir) => ['-framerate', String(FPS), '-i', path.join(dir, '%05d.jpg')]);
  let graph = '';
  let last = '[0:v]';
  transitions.forEach(({ kind, at, duration }, i) => {
    const label = `[x${i}]`;
    graph += `${last}[${i + 1}:v]xfade=transition=${kind}:duration=${duration}:offset=${(at - duration / 2).toFixed(3)}${label};`;
    last = label;
  });
  const grade = [
    'format=gbrp', 'eq=contrast=0.96:saturation=0.92:gamma=1.04',
    'colorbalance=rs=0.04:gs=0.01:bs=-0.05:rm=0.05:bm=-0.04:rh=0.03:bh=-0.03',
    'split[a][b];[b]gblur=sigma=18[g];[a][g]blend=all_mode=screen:all_opacity=0.15',
    'vignette=angle=PI/4.4', 'noise=alls=5:allf=t+u',
    'fade=t=in:st=0:d=0.25', `fade=t=out:st=${length - 1.1}:d=1.1`, 'format=yuv420p',
  ].join(',');
  graph += `${last}${grade}[v];[${shots.length}:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,` +
    `alimiter=limit=0.72:attack=1:release=80:level=disabled,afade=t=out:st=${length - 1.4}:d=1.4[a]`;
  const res = spawnSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error', ...inputs, '-i', audio,
    '-filter_complex', graph, '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-maxrate', '14M', '-bufsize', '28M',
    '-profile:v', 'high', '-level', '4.2', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k',
    '-t', String(length), '-movflags', '+faststart', out,
  ], { stdio: 'inherit' });
  if (res.status !== 0) throw new Error(`ffmpeg failed (${res.status})`);
}

module.exports = { FPS, openLibrary, createFilm, assemble };
