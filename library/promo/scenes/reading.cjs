// Your view from a reading table in the library: an open book in front of you, a candle,
// a cup of tea, and the library's bookcases out of focus behind. Ink (scenes/ink-big.cjs)
// can peek over the far edge of the table, hop up onto it, and sit on the book.
//
// The words on the pages are wavy strokes, not text. READING_HTML is the markup (540 x 960,
// the 9:16 frame); readingFrame(st) runs in the page and poses it for one frame:
//   t      seconds (the candle, the steam)
//   cam    { s, fx, fy, ax, ay }: scale s, with scene point (fx, fy) at screen (ax, ay)
//   hidden true while Ink is behind the table (only what's above its far edge shows)
//   ink    Ink's pose (see poseInk); x, y, s place him in the scene

const { inkBig } = require('./ink-big.cjs');

const EDGE = 520; // the far edge of the table
const READING_CSS = `
  #rd { position: fixed; inset: 0; z-index: 900; overflow: hidden; display: none; background: #120e0b; }
  #rd.on { display: block; }
  #rd .cam { position: absolute; left: 0; top: 0; width: 540px; height: 960px; transform-origin: 0 0; }
  #rd svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
`;

const SPINES = ['#7b2e2a', '#a5443a', '#3f6b5a', '#2f4b62', '#5a3d63', '#8a6a2f', '#b8934f', '#46553a', '#6d3b2e', '#2b3a4a', '#9b7b5a', '#5b2a3a', '#d6c6a3', '#3a5a6a', '#7a6248'];
// two bookcases behind the table, far away (they're blurred)
function backShelves() {
  let out = '';
  let k = 0;
  for (const [x0, x1] of [[-60, 250], [290, 600]]) {
    out += `<rect x="${x0 - 14}" y="-120" width="${x1 - x0 + 28}" height="660" fill="#3a2419"/>`;
    for (let row = 0; row < 5; row++) {
      const base = 10 + row * 118;
      out += `<rect x="${x0}" y="${base - 96}" width="${x1 - x0}" height="96" fill="#24160f"/>`;
      let x = x0 + 4;
      while (x < x1 - 10) {
        const w = 12 + ((k * 37) % 13);
        const h = 66 + ((k * 53) % 26);
        out += `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="${SPINES[(k * 7) % SPINES.length]}"/>`;
        x += w + 2;
        k++;
      }
      out += `<rect x="${x0 - 14}" y="${base}" width="${x1 - x0 + 28}" height="14" fill="#4b2f21"/>`;
    }
  }
  return out;
}

const READING_HTML = `<div id="rd"><div class="cam"><svg viewBox="0 0 540 960" aria-hidden="true">
  <defs>
    <linearGradient id="rd-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f3322"/><stop offset=".35" stop-color="#6a4630"/><stop offset="1" stop-color="#4a2f1f"/></linearGradient>
    <linearGradient id="rd-cover" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#244a3c"/><stop offset="1" stop-color="#1b382d"/></linearGradient>
    <linearGradient id="rd-page-l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#efe5cd"/><stop offset=".85" stop-color="#f6eedb"/><stop offset="1" stop-color="#d9cbaa"/></linearGradient>
    <linearGradient id="rd-page-r" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#efe5cd"/><stop offset=".85" stop-color="#f6eedb"/><stop offset="1" stop-color="#d9cbaa"/></linearGradient>
    <radialGradient id="rd-pool" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(250 700) scale(360 260)"><stop offset="0" stop-color="#ffd99a" stop-opacity=".38"/><stop offset="1" stop-color="#ffd99a" stop-opacity="0"/></radialGradient>
    <radialGradient id="rd-candle" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(66 520) scale(230 210)"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset=".4" stop-color="#ffb35c" stop-opacity=".18"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>
    <radialGradient id="rd-flame" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff6d8"/><stop offset=".5" stop-color="#ffcf6b"/><stop offset="1" stop-color="#e8742c"/></radialGradient>
    <radialGradient id="rd-vig" cx="50%" cy="55%" r="72%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
    <filter id="rd-far" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="rd-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    <clipPath id="rd-behind"><rect x="-400" y="-600" width="1340" height="${EDGE + 600}"/></clipPath>
  </defs>

  <!-- the library behind, out of focus, with lamps glowing -->
  <rect x="-300" y="-600" width="1140" height="${EDGE + 600}" fill="#1d1712"/>
  <g filter="url(#rd-far)" opacity=".8">${backShelves()}</g>
  <g filter="url(#rd-soft)" fill="#ffcf86">
    <circle cx="420" cy="150" r="26" opacity=".55"/><circle cx="96" cy="230" r="18" opacity=".4"/><circle cx="300" cy="360" r="12" opacity=".35"/><circle cx="520" cy="420" r="20" opacity=".4"/>
  </g>
  <rect x="-300" y="-600" width="1140" height="${EDGE + 600}" fill="#120c08" opacity=".28"/>

  <!-- the table -->
  <rect x="-300" y="${EDGE}" width="1140" height="700" fill="url(#rd-table)"/>
  <path d="M-300 ${EDGE}h1140" stroke="#9a6c48" stroke-width="3"/>
  <g stroke="#3e2617" stroke-width="1.3" opacity=".3" fill="none"><path d="M-20 560q260 4 600-2M-20 650q240 8 600-4M-20 790q260 6 600-6M-20 920q220 4 600 0"/></g>
  <rect x="-300" y="${EDGE}" width="1140" height="700" fill="url(#rd-pool)" class="glow"/>
  <rect x="-300" y="${EDGE - 400}" width="1140" height="1100" fill="url(#rd-candle)" class="glow"/>

  <!-- a candle, far left -->
  <g>
    <ellipse cx="66" cy="566" rx="34" ry="8" fill="#000" opacity=".35"/>
    <path d="M36 566q0-12 30-14 30 2 30 14z" fill="#b8913f"/>
    <rect x="52" y="486" width="28" height="70" rx="3" fill="#efe6d2"/>
    <path d="M56 490q4 18 0 40" stroke="#d8ccb2" stroke-width="3" fill="none" opacity=".8"/>
    <path d="M66 486v-8" stroke="#2b2622" stroke-width="2"/>
    <path class="flame" d="M66 452q-9 14-6 22 2 6 6 6t6-6q3-8-6-22z" fill="url(#rd-flame)"/>
  </g>

  <!-- a cup of tea, right -->
  <g>
    <ellipse cx="486" cy="600" rx="58" ry="13" fill="#000" opacity=".3"/>
    <ellipse cx="486" cy="596" rx="56" ry="12" fill="#e8dcc6"/>
    <path d="M452 548h68l-6 44q-2 8-12 8h-32q-10 0-12-8z" fill="#efe6d2"/>
    <path d="M520 558q20 0 20 16t-22 16" fill="none" stroke="#efe6d2" stroke-width="6"/>
    <ellipse cx="486" cy="548" rx="34" ry="7" fill="#7a4a26"/>
    <path d="M460 568q26 6 52 0" stroke="#c98f8f" stroke-width="3" fill="none" opacity=".6"/>
    <g class="steam" fill="none" stroke="#f3ead8" stroke-width="3" stroke-linecap="round" opacity=".3"><path d="M478 536q-8-14 0-26t0-26"/><path d="M494 534q8-14 0-26t0-24"/></g>
  </g>

  <!-- the open book -->
  <g>
    <path d="M96 594L444 594 548 946-8 946z" fill="#000" opacity=".3" transform="translate(4 8)"/>
    <path d="M100 592L440 592 544 942-4 942z" fill="url(#rd-cover)"/>
    <path d="M6 936h528l2 6H4z" fill="#e2d6bc"/>
    <path d="M10 932h520" stroke="#cbbd9c" stroke-width="1.5"/>
    <path d="M110 600Q190 588 268 604L270 932Q150 916 10 930Z" fill="url(#rd-page-l)"/>
    <path d="M430 600Q350 588 272 604L270 932Q390 916 530 930Z" fill="url(#rd-page-r)"/>
    <path d="M270 604L270 932" stroke="#bfae8a" stroke-width="2"/>
    <g class="words" fill="none" stroke="#5b4b3c" stroke-linecap="round" opacity=".5"></g>
  </g>

  <!-- Ink: clipped at the table's far edge while he's behind it -->
  <g class="ink-wrap">${inkBig('ink')}</g>

  <rect x="-300" y="-600" width="1140" height="1800" fill="url(#rd-vig)"/>
</svg></div></div>`;

/** Runs in the page; see the top of the file. */
function readingFrame(st) {
  const root = document.getElementById('rd');
  if (!root.dataset.ready) {
    let s = 17;
    const r = () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x6d2b79f5) >>> 0) / 4294967296);
    // lines of "words" on both pages, in perspective: further lines are shorter and thinner
    const page = (left, u, v) => {
      // u across the page from the outer edge (0) to the gutter (1), v from the far edge (0) to the near edge (1)
      const far = left ? [110 + 158 * u, 600 + 4 * u - Math.sin(Math.PI * u) * 10] : [430 - 158 * u, 600 + 4 * u - Math.sin(Math.PI * u) * 10];
      const near = left ? [10 + 260 * u, 930 + 2 * u - Math.sin(Math.PI * u) * 12] : [530 - 260 * u, 930 + 2 * u - Math.sin(Math.PI * u) * 12];
      return [far[0] + (near[0] - far[0]) * v, far[1] + (near[1] - far[1]) * v];
    };
    let w = '';
    for (const left of [true, false]) {
      for (let row = 0; row < 16; row++) {
        const v = 0.07 + row * 0.056;
        if (left && row === 0) continue; // a chapter starts a little lower
        let u = 0.1 + (row % 5 === 0 ? 0.06 : 0);
        const end = row === 15 ? 0.5 : 0.86 - r() * 0.05;
        const width = (0.9 + v * 1.5).toFixed(2);
        while (u < end) {
          const len = 0.05 + r() * 0.12;
          const [x0, y0] = page(left, u, v);
          const [x1, y1] = page(left, Math.min(end, u + len), v);
          w += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke-width="${width}"/>`;
          u += len + 0.03;
        }
      }
    }
    root.querySelector('.words').innerHTML = w;
    root.dataset.ready = '1';
  }
  root.classList.toggle('on', st.on !== false);
  if (st.on === false) return;
  const t = st.t;
  const flick = 0.93 + 0.07 * Math.sin(t * 9.1) * Math.sin(t * 3.7);
  for (const g of root.querySelectorAll('.glow')) g.setAttribute('opacity', flick.toFixed(3));
  root.querySelector('.flame').setAttribute('transform', `translate(66 480) scale(${(0.94 + 0.06 * Math.sin(t * 11)).toFixed(3)} ${(0.9 + 0.12 * Math.sin(t * 7.3)).toFixed(3)}) rotate(${(3 * Math.sin(t * 5.1)).toFixed(2)}) translate(-66 -480)`);
  const steam = root.querySelector('.steam');
  steam.setAttribute('transform', `translate(${(Math.sin(t * 1.3) * 3).toFixed(1)} ${(-((t * 9) % 14)).toFixed(1)})`);
  steam.setAttribute('opacity', (0.2 + 0.12 * Math.sin(t * 2.1)).toFixed(2));

  const wrap = root.querySelector('.ink-wrap');
  if (st.hidden) wrap.setAttribute('clip-path', 'url(#rd-behind)');
  else wrap.removeAttribute('clip-path');
  window.__poseInk(root.querySelector('.bi.ink'), st.ink);

  const cam = st.cam ?? { s: 1, fx: 270, fy: 480, ax: 270, ay: 480 };
  let tx = cam.ax - cam.fx * cam.s + (cam.sx ?? 0);
  let ty = cam.ay - cam.fy * cam.s + (cam.sy ?? 0);
  tx = Math.min(0, Math.max(540 - 540 * cam.s, tx));
  ty = Math.min(0, Math.max(960 - 960 * cam.s, ty));
  root.querySelector('.cam').style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${cam.s.toFixed(4)})`;
}

module.exports = { READING_CSS, READING_HTML, readingFrame, EDGE };
