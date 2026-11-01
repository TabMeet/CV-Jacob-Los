// Films the local edition into a 1080x1920 TikTok with an original lo-fi track.
//
//   npm run build:local
//   python3 promo/lofi.py /tmp/lofi.wav 38
//   node promo/make-tiktok.cjs /tmp/lofi.wav promo/quiet-library-tiktok.mp4
//
// Needs Playwright (with Chromium) and ffmpeg. Every frame is rendered on a fake
// clock, so walks, blinks and page turns are perfectly smooth and the cuts land
// on the music's bar lines (72 BPM: one bar = 3.333 s).

const { spawn } = require('node:child_process');
const path = require('node:path');
const { openLibrary, createFilm, FPS } = require('./film-lib.cjs');

const [audio, out = path.join(__dirname, 'quiet-library-tiktok.mp4')] = process.argv.slice(2);
if (!audio) {
  console.error('usage: node make-tiktok.cjs <lofi.wav> [out.mp4]');
  process.exit(1);
}
const FILE = path.join(__dirname, '..', 'dist', 'quiet-library-local.html');
const BAR = 60 / 72 * 4;
const LENGTH = 38;

// Warm, soft, a little filmic: lift the reds, cool nothing, add bloom, vignette and grain.
const GRADE = [
  'format=gbrp',
  'eq=contrast=0.95:saturation=0.9:gamma=1.04',
  'colorbalance=rs=0.04:gs=0.01:bs=-0.05:rm=0.05:bm=-0.04:rh=0.03:bh=-0.03',
  'split[a][b]', '[b]gblur=sigma=16[g]', '[a][g]blend=all_mode=screen:all_opacity=0.13',
  'vignette=angle=PI/4.6',
  'noise=alls=5:allf=t+u',
  'fade=t=in:st=0:d=0.3',
  `fade=t=out:st=${LENGTH - 0.8}:d=0.8`,
  'format=yuv420p',
].join(',').replace('split[a][b],[b]', 'split[a][b];[b]').replace('[g],[a]', '[g];[a]');

const ffmpeg = spawn('ffmpeg', [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-i', audio,
  '-filter_complex', `[0:v]${GRADE}[v];[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]`,
  '-map', '[v]', '-map', '[a]',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-maxrate', '14M', '-bufsize', '28M', '-profile:v', 'high', '-level', '4.2', '-r', String(FPS),
  '-c:a', 'aac', '-b:a', '192k',
  '-t', String(LENGTH), '-movflags', '+faststart', out,
], { stdio: ['pipe', 'inherit', 'inherit'] });

const FILM_CSS = `
  .studio-toggle, .frame-label, .reader-bar, .reader-foot, .hint, .toasts { display: none !important; }
  #tt-shade { position: fixed; left: 0; right: 0; top: 0; height: 260px; z-index: 998; pointer-events: none;
    background: linear-gradient(rgba(14,9,6,.62), rgba(14,9,6,.25) 55%, rgba(14,9,6,0)); opacity: 0; transition: opacity .6s; }
  #tt-shade.on { opacity: 1; }
  .tt-cap { position: fixed; left: 5%; right: 5%; z-index: 999; text-align: center; pointer-events: none;
    animation: tt-in .7s cubic-bezier(.2,.7,.2,1) both; }
  .tt-cap.top { top: 78px; }
  .tt-cap.mid { top: 54%; }
  .tt-cap.mid .tt-line { background: rgba(24,16,11,.72); border-radius: 18px; padding: 10px 18px; display: inline-block; }
  .tt-cap.out { animation: tt-out .5s ease both; }
  .tt-kicker { font: 600 28px/1 'Caveat', cursive; color: #e9c98a; margin-bottom: 4px; text-shadow: 0 2px 10px rgba(0,0,0,.8); }
  .tt-line { font: italic 600 34px/1.14 'Cormorant Garamond', serif; color: #fbf1dc; letter-spacing: .01em;
    text-shadow: 0 2px 14px rgba(0,0,0,.9), 0 0 3px rgba(0,0,0,.7); }
  @keyframes tt-in { from { opacity: 0; transform: translateY(10px); filter: blur(5px); } }
  @keyframes tt-out { to { opacity: 0; transform: translateY(-8px); filter: blur(5px); } }
  #tt-end { position: fixed; inset: 0; z-index: 997; display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; gap: 6px; padding-bottom: 120px; color: #fbf1dc;
    background: radial-gradient(ellipse at 50% 42%, rgba(20,13,9,.55), rgba(10,6,4,.88) 70%);
    backdrop-filter: blur(3px); animation: tt-fade 1s ease both; }
  #tt-end .por { width: 120px; height: 120px; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 3px #c9a45c, 0 0 40px rgba(255,217,154,.25);
    background: radial-gradient(circle at 50% 30%, #3b2a20, #1b1209); margin-bottom: 14px; animation: tt-in 1s .1s both; }
  #tt-end .por svg { width: 100%; height: 100%; }
  #tt-end h1 { margin: 0; font: 700 54px/1 'Cormorant Garamond', serif; letter-spacing: .01em; text-shadow: 0 0 30px rgba(255,217,154,.25); animation: tt-in 1s .25s both; }
  #tt-end .sub { font: 600 34px/1.1 'Caveat', cursive; color: #e9c98a; animation: tt-in 1s .55s both; }
  #tt-end .soon { margin-top: 18px; font: 500 15px/1 'EB Garamond', serif; letter-spacing: .32em; text-transform: uppercase; color: rgba(251,241,220,.75); animation: tt-in 1s .9s both; }
  @keyframes tt-fade { from { opacity: 0; } }
`;

(async () => {
  const { browser, page } = await openLibrary({
    file: FILE,
    startTime: new Date('2026-11-01T22:40:00'),
    studio: { frame: 'fill', zoom: 'fill', clean: true, showVisitor: true, time: 'night', rain: true, pace: 0.55, demo: 7 },
  });
  await page.addStyleTag({ content: FILM_CSS });
  await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', '<div id="tt-shade"></div>');
    window.__caption = (lines, { kicker = '', pos = 'top' } = {}) => {
      for (const old of document.querySelectorAll('.tt-cap:not(.out)')) {
        old.classList.add('out');
        setTimeout(() => old.remove(), 600);
      }
      document.getElementById('tt-shade').classList.toggle('on', Boolean(lines) && pos === 'top');
      if (!lines) return;
      const box = document.createElement('div');
      box.className = `tt-cap ${pos}`;
      if (kicker) box.insertAdjacentHTML('beforeend', `<div class="tt-kicker">${kicker}</div>`);
      const line = document.createElement('div');
      line.className = 'tt-line';
      line.innerHTML = lines;
      box.append(line);
      document.body.append(box);
    };
    window.__click = (sel) => {
      const node = typeof sel === 'string' ? document.querySelector(sel) : sel;
      if (!node) throw new Error(`nothing to click: ${sel}`);
      node.click();
    };
  });

  let written = 0;
  const film = createFilm(page, (buf) => new Promise((resolve) => {
    written++;
    if (written % 150 === 0) console.log(`  ${(written / FPS).toFixed(1)}s filmed`);
    if (!ffmpeg.stdin.write(buf)) ffmpeg.stdin.once('drain', resolve);
    else resolve();
  }));
  const js = (fn, arg) => page.evaluate(fn, arg);
  const caption = (lines, opts) => js(([l, o]) => window.__caption(l, o), [lines, opts]);
  const click = (sel) => js((s) => window.__click(s), sel);

  // 1 · The hook: a rainy night, you step in from the street.
  await js(() => __lib.hall.teleport(105));
  await caption('you found a library where every book<br>was written by a stranger', { kicker: 'pov:' });
  await film.until(2.6);
  await js(() => __lib.hall.walkTo(470));
  await film.until(6.25);
  await caption(null);

  // 2 · Ink, in the window.
  await film.until(BAR * 2);
  await js(() => __lib.cat.greet());
  await caption('ink keeps watch over<br>everyone who comes in');
  await film.until(BAR * 3 - 0.35);
  await caption(null);

  // 3 · Mrs. Wren at the front desk.
  await js(() => __lib.hall.teleport(700));
  await js(() => __lib.hall.setPace(0.8));
  await film.until(BAR * 3 + 0.1);
  await caption('tell mrs. wren how you’re feeling');
  await click('button.hotspot[aria-label^="Talk to"]');
  // A first-visit greeting that fits the "pov" (the page says "welcome back" to returning visitors),
  // swapped in the same frame the dialog appears.
  while (!(await js(() => Boolean(document.querySelector('.desk-panel .speech'))))) await film.shoot();
  await js(() => { document.querySelector('.desk-panel .speech').textContent = 'Good evening, dear. Come in out of the rain. What are you in the mood for tonight?'; });
  await film.until(BAR * 3 + 1.6);
  await film.type('i feel a bit lonely tonight', 2);
  await film.hold(0.35);
  await page.keyboard.press('Enter');
  await film.until(BAR * 5 - 0.3);
  await caption(null);

  // 4 · Along the shelves; other readers are soft silhouettes.
  await page.keyboard.press('Escape');
  await js(() => { __lib.hall.teleport(1080); __lib.hall.setPace(0.85); });
  await film.until(BAR * 5);
  await caption('no names. no likes. no followers.');
  await click('button.hotspot[aria-label="Browse Poetry"]');
  await film.until(BAR * 6 - 0.15);

  // 5 · The poetry shelf, and a book nobody has read yet.
  await caption('just stories, and how many<br>people read them');
  await film.until(BAR * 6 + 1.1);
  await click('.spine');
  await film.until(BAR * 7 - 0.25);
  await caption(null);
  await click('.book-card .btn');

  // 6 · Sit down and read: the title page, the poem, and the last page.
  await film.until(BAR * 7 + 2.05);
  const pages = await js(() => {
    const flow = document.querySelector('.flow');
    const book = document.querySelector('.open-book');
    return flow && book ? Math.max(1, Math.round(flow.scrollWidth / book.clientWidth)) : 1;
  });
  const turns = Math.max(1, pages - 1);
  const firstTurn = turns === 1 ? BAR * 7 + 3.9 : BAR * 7 + 2.05;
  for (let i = 0; i < turns; i++) {
    await film.until(turns === 1 ? firstTurn : firstTurn + i * (1.85 / (turns - 1)));
    await page.keyboard.press('ArrowRight');
  }
  console.log(`  the poem took ${pages} pages`);
  await film.until(BAR * 9 - 0.2);

  // 7 · The writing rooms.
  await page.keyboard.press('Escape');
  await js(() => __lib.hall.teleport(__lib.hall.spot('writing').cx - 20));
  await click('button.hotspot[aria-label="Go into the writing rooms"]');
  await film.until(BAR * 9 + 0.15);
  await click('button.room-door[aria-label^="Writing room 2"]');
  await caption('or write your own. anonymously.', { pos: 'mid' });
  await film.hold(0.6);
  await js(() => document.querySelector('.story-input').focus());
  await film.type('dear stranger,\nI hope tonight is gentle with you.', 1);
  await film.until(BAR * 10 - 0.3);
  await caption(null);

  // 8 · The end card, over the window where Ink sits.
  await film.until(BAR * 10);
  await js(() => {
    const cat = document.querySelector('.cat svg').outerHTML.replace('viewBox="0 0 120 116"', 'viewBox="20 0 80 70"');
    document.body.insertAdjacentHTML('beforeend', `<div id="tt-end"><div class="por">${cat}</div><h1>The Quiet Library</h1>
      <div class="sub">read. write. you’re not alone.</div><div class="soon">opening soon</div></div>`);
  });
  await film.hold(0.6);
  await page.keyboard.press('Escape');
  await film.hold(0.1);
  await page.keyboard.press('Escape');
  await js(() => {
    document.head.insertAdjacentHTML('beforeend', '<style>.cat-bubble { display: none !important; }</style>');
    __lib.hall.teleport(430);
  });
  await film.until(LENGTH);

  await browser.close();
  ffmpeg.stdin.end();
  await new Promise((r) => ffmpeg.on('close', r));
  console.log(`done: ${out} (${(written / FPS).toFixed(1)} s, ${written} frames)`);
})().catch((err) => {
  console.error(err);
  ffmpeg.stdin.end();
  process.exit(1);
});
