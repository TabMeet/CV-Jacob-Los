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
// fadeIn/fadeOut/audioFadeOut are in seconds; 0 leaves that end hard (for a video
// that should hook on its first frame, or loop seamlessly).
// loop: the video loops, so the music's last second is played before frame 0 while
// the loudness is measured, then cut off. Without it the measurement starts cold and
// a loud first beat overshoots; a 20 ms fade-in keeps the encoder from clicking.
function assemble({ shots, transitions, audio, out, length, fadeIn = 0.25, fadeOut = 1.1, audioFadeOut = 1.4, loop = false }) {
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
    ...(fadeIn ? [`fade=t=in:st=0:d=${fadeIn}`] : []), ...(fadeOut ? [`fade=t=out:st=${length - fadeOut}:d=${fadeOut}`] : []), 'format=yuv420p',
  ].join(',');
  const master = 'loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,alimiter=limit=0.72:attack=1:release=80:level=disabled';
  const tail = audioFadeOut ? `,afade=t=out:st=${length - audioFadeOut}:d=${audioFadeOut}` : '';
  const a = shots.length;
  graph += `${last}${grade}[v];` + (loop
    ? `[${a}:a]atrim=0:${length},asetpts=PTS-STARTPTS,asplit[la][lb];[la]atrim=start=${length - 1},asetpts=PTS-STARTPTS[lpre];` +
      `[lpre][lb]concat=n=2:v=0:a=1,${master},atrim=start=1,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.02${tail}[a]`
    : `[${a}:a]${master}${tail}[a]`);
  const res = spawnSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error', ...inputs, '-i', audio,
    '-filter_complex', graph, '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-maxrate', '14M', '-bufsize', '28M',
    '-profile:v', 'high', '-level', '4.2', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k',
    '-t', String(length), '-movflags', '+faststart', out,
  ], { stdio: 'inherit' });
  if (res.status !== 0) throw new Error(`ffmpeg failed (${res.status})`);
}

// Kinetic captions in the late-2026 TikTok style: words pop in one by one, *keywords*
// in gold, each line on a dark rounded box so it reads over anything.
const escHTML = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function kin(text, { kicker = '', size = '', pos = '', step = 0.075 } = {}) {
  let i = 0;
  let key = false;
  const lines = text.split('|').map((line) => line.split(' ').map((raw) => {
    let w = raw;
    if (w.startsWith('*')) { key = true; w = w.slice(1); }
    const k = key;
    if (w.endsWith('*')) { key = false; w = w.slice(0, -1); }
    return `<span class="w${k ? ' k' : ''}" style="animation-delay:${(i++ * step).toFixed(3)}s">${escHTML(w)}</span>`;
  }).join(' '));
  const kk = kicker ? `<div class="kk"><span class="bx">${escHTML(kicker)}</span></div>` : '';
  return `<div class="tt-kin ${size} ${pos}">${kk}${lines.map((l) => `<div class="ln"><span class="bx">${l}</span></div>`).join('')}</div>`;
}
const KIN_CSS = `
  .tt-kin { position: fixed; left: 4%; right: 4%; top: 80px; z-index: 999; text-align: center; pointer-events: none; }
  .tt-kin.mid { top: 46%; }
  .tt-kin.out { animation: kin-out .16s ease-in both; }
  .tt-kin .kk { font: 700 30px/1 'Caveat', cursive; color: #f2c46d; margin-bottom: 6px; }
  .tt-kin .ln { margin-top: 4px; font: 700 46px/1.06 'Cormorant Garamond', serif; font-variant-numeric: lining-nums; font-feature-settings: 'lnum' 1;
    color: #fff6e2; letter-spacing: .005em; text-shadow: 0 2px 8px rgba(0,0,0,.6); }
  .tt-kin.xl .ln { font-size: 60px; }
  .tt-kin .bx { display: inline-block; padding: 2px 16px 8px; border-radius: 16px; background: rgba(22,14,9,.8);
    box-shadow: 0 6px 20px rgba(0,0,0,.35); animation: kin-pop .35s cubic-bezier(.2,1.5,.35,1) both; }
  .tt-kin .kk .bx { padding: 4px 14px 6px; border-radius: 12px; }
  .tt-kin .w { display: inline-block; animation: kin-pop .42s cubic-bezier(.2,1.6,.35,1) both; }
  .tt-kin .k { color: #f6c25b; text-shadow: 0 0 24px rgba(246,194,91,.45), 0 2px 8px rgba(0,0,0,.6); }
  @keyframes kin-pop { 0% { opacity: 0; transform: translateY(14px) scale(1.45); filter: blur(5px); } 55% { opacity: 1; transform: scale(.95); filter: blur(0); } 100% { transform: none; } }
  @keyframes kin-out { to { opacity: 0; transform: translateY(-10px); } }
`;

module.exports = { FPS, openLibrary, createFilm, assemble, kin, KIN_CSS };
