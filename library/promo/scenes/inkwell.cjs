// A writing desk at night, for "how the library cat got his name": a letter half
// written, an inkwell with a quill in it, the banker's lamp, rain on the window, a shelf
// of books, and Ink (scenes/ink-big.cjs) sitting right next to the ink.
//
// The inkwell can be pushed and tipped over to the left. Ink pours out across the
// letter, drops splash, and a trail of inky paw prints can appear, leading straight to
// the cat. The handwriting on the letter is just wavy strokes, not words.
//
// INKWELL_HTML is the markup (540 x 960, the 9:16 frame); inkwellFrame(st) runs in the
// page and poses it for one frame:
//   t       seconds (rain, the lamp's flicker)
//   cam     { s, fx, fy, ax, ay }: scale s, with scene point (fx, fy) at screen (ax, ay)
//   well    { dx, ang }: the inkwell pushed dx px and tipped ang degrees (-90 = on its side)
//   pour    0..1: how far the spilled ink has spread
//   splash  seconds since it landed (the drops fly, then stay as spots), or null
//   prints  how many paw prints show (fractional: the last one fades in)
//   ink     Ink's pose (see poseInk)

const { inkBig } = require('./ink-big.cjs');

// where things are, in the scene
const WELL = { x: 196, y: 776 }; // the inkwell's base (middle of its bottom edge)
const INK_FEET = { x: 338, y: 746 };
const INK_SIZE = 2.5;
const PUDDLE = { x: 98, y: 790 };

const INKWELL_CSS = `
  #iw { position: fixed; inset: 0; z-index: 900; overflow: hidden; display: none; background: #120e0b; }
  #iw.on { display: block; }
  #iw .cam { position: absolute; left: 0; top: 0; width: 540px; height: 960px; transform-origin: 0 0; }
  #iw svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
`;

const BOOKS = [
  ['#7b2e2a', 22, 86], ['#2f4b62', 18, 78], ['#b8934f', 14, 70], ['#3f6b5a', 24, 90], ['#5a3d63', 16, 74],
  ['#a5443a', 20, 82], ['#d6c6a3', 14, 68], ['#2b3a4a', 22, 88], ['#8a6a2f', 18, 76], ['#46553a', 20, 84],
];
function shelfBooks() {
  let x = 318;
  let out = '';
  for (const [color, w, h] of BOOKS) {
    out += `<rect x="${x}" y="${330 - h}" width="${w}" height="${h}" rx="2" fill="${color}"/>`;
    out += `<path d="M${x + 3} ${330 - h + 10}h${w - 6}M${x + 3} ${330 - 14}h${w - 6}" stroke="#e6c983" stroke-width="1.6" opacity=".55"/>`;
    x += w + 2;
  }
  // one leaning against the rest
  out += `<g transform="rotate(14 ${x + 4} 330)"><rect x="${x + 4}" y="250" width="18" height="80" rx="2" fill="#6d3b2e"/></g>`;
  return out;
}

const INKWELL_HTML = `<div id="iw"><div class="cam"><svg viewBox="0 0 540 960" aria-hidden="true">
  <defs>
    <pattern id="iw-stripes" width="44" height="40" patternUnits="userSpaceOnUse"><rect width="22" height="40" fill="#24322a"/><rect x="22" width="22" height="40" fill="#28372e"/><circle cx="11" cy="14" r="1.6" fill="#c9a45c" opacity=".14"/></pattern>
    <linearGradient id="iw-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16223a"/><stop offset="1" stop-color="#2d4060"/></linearGradient>
    <linearGradient id="iw-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5e3d28"/><stop offset=".4" stop-color="#6e4a31"/><stop offset="1" stop-color="#4a2f1f"/></linearGradient>
    <linearGradient id="iw-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#30495a"/><stop offset=".45" stop-color="#1f3240"/><stop offset="1" stop-color="#132029"/></linearGradient>
    <linearGradient id="iw-brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6a2f"/><stop offset=".45" stop-color="#e6c983"/><stop offset="1" stop-color="#9a7638"/></linearGradient>
    <linearGradient id="iw-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f5a48"/><stop offset="1" stop-color="#1f3d31"/></linearGradient>
    <linearGradient id="iw-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe4cc"/><stop offset="1" stop-color="#f7efdd"/></linearGradient>
    <radialGradient id="iw-wallglow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(352 560) scale(300 330)"><stop offset="0" stop-color="#ffcf86" stop-opacity=".5"/><stop offset=".5" stop-color="#e8a85a" stop-opacity=".18"/><stop offset="1" stop-color="#e8a85a" stop-opacity="0"/></radialGradient>
    <radialGradient id="iw-pool" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(330 800) scale(330 150)"><stop offset="0" stop-color="#ffd99a" stop-opacity=".42"/><stop offset="1" stop-color="#ffd99a" stop-opacity="0"/></radialGradient>
    <radialGradient id="iw-vig" cx="50%" cy="52%" r="72%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
    <radialGradient id="iw-wet" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#2a3350"/><stop offset=".35" stop-color="#11131c"/><stop offset="1" stop-color="#090a10"/></radialGradient>
    <clipPath id="iw-glassclip"><rect x="38" y="142" width="196" height="268" rx="3"/></clipPath>
    <clipPath id="iw-paperclip"><path d="M96 770L392 762 448 918 44 930z"/></clipPath>
  </defs>

  <!-- the wall, a window on the left, a shelf of books on the right -->
  <rect x="-300" y="-400" width="1140" height="1110" fill="url(#iw-stripes)"/>
  <rect x="26" y="130" width="220" height="292" rx="8" fill="#3d261b"/>
  <g clip-path="url(#iw-glassclip)">
    <rect x="38" y="142" width="196" height="268" fill="url(#iw-sky)"/>
    <path d="M190 176a22 22 0 1 0 18 34 17 17 0 1 1-18-34z" fill="#f6ecd2" opacity=".9"/>
    <g fill="#f6ecd2" opacity=".7"><circle cx="70" cy="170" r="1.3"/><circle cx="112" cy="204" r="1"/><circle cx="150" cy="160" r="1.1"/><circle cx="214" cy="250" r="1"/></g>
    <path d="M38 410V338h24v-26h20v36h18v-54h28v64h16v-38h30v50h20v-28h24v22h18v66z" fill="#111a24"/>
    <g fill="#ffcf7a" opacity=".85"><rect x="66" y="326" width="5" height="6"/><rect x="108" y="304" width="5" height="6"/><rect x="170" y="360" width="5" height="6"/><rect x="214" y="352" width="5" height="6"/><rect x="88" y="372" width="5" height="6"/></g>
    <g class="rain" stroke="#cfe0f2" stroke-width="1.2" stroke-linecap="round" opacity=".4"></g>
  </g>
  <path d="M136 142v268M38 276h196" stroke="#3d261b" stroke-width="7"/>
  <rect x="16" y="418" width="240" height="13" rx="3" fill="#4b2f21"/>
  <g>${shelfBooks()}</g>
  <rect x="300" y="330" width="280" height="12" rx="2" fill="#4b2f21"/>
  <path d="M330 342l14 22M520 342l-14 22" stroke="#3a2419" stroke-width="5" stroke-linecap="round"/>
  <rect x="-300" y="-400" width="1140" height="1110" fill="url(#iw-wallglow)" class="glow"/>

  <!-- the desk -->
  <rect x="-300" y="700" width="1140" height="500" fill="url(#iw-desk)"/>
  <path d="M-300 700h1140" stroke="#9a6c48" stroke-width="3"/>
  <g stroke="#3e2617" stroke-width="1.3" opacity=".35" fill="none"><path d="M-20 740q220 6 600-4M-20 810q260 8 600-6M-20 880q240 4 600-2M-20 940q200 6 600 0"/></g>
  <rect x="-300" y="700" width="1140" height="500" fill="url(#iw-pool)" class="glow"/>

  <!-- the banker's lamp, right -->
  <g>
    <ellipse cx="512" cy="712" rx="50" ry="9" fill="#000" opacity=".35"/>
    <path d="M478 712q0-16 34-18 34 2 34 18z" fill="#b8913f"/>
    <rect x="508" y="604" width="8" height="94" fill="#a8823a"/>
    <path d="M452 608q0-32 60-34 60 2 60 34z" fill="url(#iw-shade)"/>
    <path d="M452 608h120" stroke="#e6c983" stroke-width="3"/>
    <ellipse cx="512" cy="610" rx="42" ry="5" fill="#fff1c9"/>
  </g>

  <!-- the letter, half written -->
  <g>
    <path d="M100 776L396 768 452 924 48 936z" fill="#000" opacity=".22"/>
    <path d="M96 770L392 762 448 918 44 930z" fill="url(#iw-paper)"/>
    <path d="M96 770L392 762 448 918 44 930z" fill="none" stroke="#d8cdb6" stroke-width="1.5"/>
    <g class="writing" clip-path="url(#iw-paperclip)" fill="none" stroke="#3b3f5a" stroke-width="1.6" stroke-linecap="round" opacity=".55"></g>
    <g class="spots" fill="#12131b"></g>
    <g class="puddle-desk"></g>
    <g class="prints" fill="#14151e"></g>
  </g>

  <!-- the inkwell, with a quill (drawn around the middle of its base) -->
  <ellipse class="well-shadow" cx="${WELL.x}" cy="${WELL.y + 2}" rx="40" ry="6" fill="#000" opacity=".35"/>
  <g class="well">
    <g class="well-body">
      <path class="quill" d="M6-66C-6-120-28-180-44-236" fill="none" stroke="#d8ccb2" stroke-width="2.4" stroke-linecap="round"/>
      <path class="quill" d="M2-110C-14-150-34-200-46-240-24-206-10-170-2-118z" fill="#f1e8d4"/>
      <path class="quill" d="M8-100C2-140-14-190-44-236-30-196-14-150-2-104z" fill="#e2d6bc"/>
      <path d="M-36 0v-42q0-14 14-14h44q14 0 14 14v42z" fill="url(#iw-glass)"/>
      <path d="M-31-3v-30q0-10 10-10h42q10 0 10 10v30z" fill="#0a0b11" opacity=".92"/>
      <path d="M-30-40q2-10 14-12" fill="none" stroke="#cfe3ef" stroke-width="3" opacity=".45" stroke-linecap="round"/>
      <rect x="-15" y="-70" width="30" height="16" rx="3" fill="url(#iw-brass)"/>
      <rect x="-18" y="-72" width="36" height="5" rx="2" fill="#e6c983"/>
      <path d="M-36 0h72" stroke="#0b0f13" stroke-width="2"/>
    </g>
  </g>
  <g class="drops" fill="#0c0d14"></g>

  <!-- Ink -->
  ${inkBig('ink')}

  <rect x="-300" y="-400" width="1140" height="1600" fill="url(#iw-vig)" class="vig"/>
</svg></div></div>`;

/** Runs in the page; see the top of the file. */
function inkwellFrame(st) {
  const root = document.getElementById('iw');
  const P = window.__iwPlaces;
  const rand = (seed) => {
    let s = seed >>> 0;
    return () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x6d2b79f5) >>> 0) / 4294967296);
  };
  // a point on the letter: u across (0..1), v down (0..1)
  const onPaper = (u, v) => {
    const top = [96 + (392 - 96) * u, 770 + (762 - 770) * u];
    const bot = [44 + (448 - 44) * u, 930 + (918 - 930) * u];
    return [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v];
  };
  if (!root.dataset.ready) {
    const r = rand(31);
    let rain = '';
    for (let i = 0; i < 40; i++) rain += `<path d="M${(38 + r() * 210).toFixed(1)} ${(120 + r() * 300).toFixed(1)}l-3 ${(10 + r() * 12).toFixed(1)}"/>`;
    root.querySelector('.rain').innerHTML = rain + rain.replace(/M(\d+\.?\d*) (\d+\.?\d*)/g, (m, x, y) => `M${x} ${(Number(y) - 300).toFixed(1)}`);
    // handwriting: rows of wavy strokes (no letters), in perspective
    let w = '';
    for (let row = 0; row < 8; row++) {
      const v = 0.12 + row * 0.1;
      let u = row === 0 ? 0.08 : 0.06 + (row % 3 === 0 ? 0.06 : 0);
      const end = row === 7 ? 0.42 : 0.9 - r() * 0.08;
      while (u < end) {
        const len = 0.04 + r() * 0.1;
        const pts = [];
        for (let k = 0; k <= 8; k++) {
          const [x, y] = onPaper(Math.min(end, u + (len * k) / 8), v);
          pts.push(`${x.toFixed(1)} ${(y + Math.sin(k * 1.9 + row) * 1.6 * (0.7 + v * 0.6)).toFixed(1)}`);
        }
        w += `<path d="M${pts.join('L')}"/>`;
        u += len + 0.025 + r() * 0.02;
      }
    }
    root.querySelector('.writing').innerHTML = w;
    root.dataset.ready = '1';
  }
  root.classList.toggle('on', st.on !== false);
  if (st.on === false) return;
  const t = st.t;
  root.querySelector('.rain').setAttribute('transform', `translate(${(-(t * 36) % 54).toFixed(1)} ${((t * 300) % 300).toFixed(1)})`);
  for (const g of root.querySelectorAll('.glow')) g.setAttribute('opacity', (0.95 + 0.05 * Math.sin(t * 7.3) * Math.sin(t * 3.1)).toFixed(3));

  // the inkwell: pushed along, then tipped over its bottom-left corner
  const well = st.well ?? { dx: 0, ang: 0 };
  const sh = root.querySelector('.well-shadow');
  sh.setAttribute('cx', (P.well.x + well.dx - 72 * (1 - Math.cos((well.ang * Math.PI) / 180))).toFixed(1));
  sh.setAttribute('opacity', (0.35 * (0.4 + 0.6 * Math.cos((well.ang * Math.PI) / 180))).toFixed(3));
  root.querySelector('.well').setAttribute('transform', `translate(${(P.well.x + well.dx).toFixed(2)} ${P.well.y}) rotate(${well.ang.toFixed(2)} -36 0)`);

  // the spill: a wet puddle from the mouth of the fallen inkwell, over the letter and the desk
  const pour = st.pour ?? 0;
  const desk = root.querySelector('.puddle-desk');
  if (pour > 0) {
    const r = rand(77);
    const pts = [];
    const n = 22;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const lobe = 0.75 + r() * 0.5;
      // it runs mostly right and towards us, over the letter
      const rx = (36 + 112 * pour) * lobe * (Math.cos(a) > 0 ? 1 : 0.45);
      const ry = (10 + 34 * pour) * lobe * (Math.sin(a) > 0 ? 1 : 0.35);
      pts.push([P.puddle.x + Math.cos(a) * rx, P.puddle.y + Math.sin(a) * ry]);
    }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let k = 0; k < n; k++) {
      const p1 = pts[(k + 1) % n];
      const p0 = pts[k];
      d += `Q${p0[0].toFixed(1)} ${p0[1].toFixed(1)} ${((p0[0] + p1[0]) / 2).toFixed(1)} ${((p0[1] + p1[1]) / 2).toFixed(1)}`;
    }
    d += 'Z';
    const html = `<path d="${d}" fill="url(#iw-wet)"/><path d="${d}" fill="none" stroke="#2c3550" stroke-width="1.2" opacity=".6"/>
      <ellipse cx="${(P.puddle.x + 30 * pour).toFixed(1)}" cy="${(P.puddle.y - 4).toFixed(1)}" rx="${(10 + 26 * pour).toFixed(1)}" ry="${(2 + 3 * pour).toFixed(1)}" fill="#8fa3c8" opacity=".35"/>`;
    desk.innerHTML = html;
  } else {
    desk.innerHTML = '';
  }

  // the splash: drops thrown up from where it landed; each lands and stays as a spot
  const drops = root.querySelector('.drops');
  const spots = root.querySelector('.spots');
  if (st.splash != null && st.splash >= 0) {
    const r = rand(5);
    let fly = '';
    let stay = '';
    for (let k = 0; k < 14; k++) {
      const vx = -60 + r() * 260;
      const vy = -(120 + r() * 220);
      const land = P.puddle.y - 6 + r() * 120; // where it comes down, nearer or further
      const size = 1.6 + r() * 3.2;
      const g = 1100;
      // time to come down to its landing height
      const dy = land - (P.puddle.y - 10);
      const tl = (-vy + Math.sqrt(vy * vy + 2 * g * dy)) / g;
      const tt = Math.min(st.splash, tl);
      const x = P.puddle.x - 4 + vx * tt;
      const y = P.puddle.y - 10 + vy * tt + 0.5 * g * tt * tt;
      if (st.splash < tl) fly += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}"/>`;
      else stay += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(size * 1.5).toFixed(1)}" ry="${(size * 0.7).toFixed(1)}"/>`;
    }
    drops.innerHTML = fly;
    spots.innerHTML = stay;
  } else {
    drops.innerHTML = '';
    spots.innerHTML = '';
  }

  // inky paw prints, from the puddle to the cat
  const prints = root.querySelector('.prints');
  const shown = st.prints ?? 0;
  let ph = '';
  for (let k = 0; k < Math.ceil(shown); k++) {
    const p = P.prints[k];
    const a = Math.min(1, shown - k);
    const pop = 0.7 + 0.3 * Math.min(1, a * 1.5);
    // flattened onto the desk: the squash is applied after the turn, so it's along the screen's y
    ph += `<g transform="translate(${p.x} ${p.y}) scale(${(p.s * pop).toFixed(3)} ${(p.s * pop * 0.55).toFixed(3)}) rotate(${p.rot})" opacity="${(0.92 * a).toFixed(3)}">
      <path d="M-7 3c-2-6 3-10 7-10s9 4 7 10c-1 4-5 5-7 4-2 1-6 0-7-4z"/>
      <ellipse cx="-9" cy="-9" rx="3" ry="3.8"/><ellipse cx="-3.2" cy="-14" rx="3" ry="3.8"/><ellipse cx="3.2" cy="-14" rx="3" ry="3.8"/><ellipse cx="9" cy="-9" rx="3" ry="3.8"/></g>`;
  }
  prints.innerHTML = ph;

  window.__poseInk(root.querySelector('.bi.ink'), { x: P.feet.x, y: P.feet.y, s: P.size, ...st.ink });

  // the camera: scale s, with scene point (fx, fy) at screen (ax, ay); never past the edges
  const cam = st.cam ?? { s: 1, fx: 270, fy: 480, ax: 270, ay: 480 };
  let tx = cam.ax - cam.fx * cam.s + (cam.sx ?? 0);
  let ty = cam.ay - cam.fy * cam.s + (cam.sy ?? 0);
  tx = Math.min(0, Math.max(540 - 540 * cam.s, tx));
  ty = Math.min(0, Math.max(960 - 960 * cam.s, ty));
  root.querySelector('.cam').style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${cam.s.toFixed(4)})`;
}

// the paw prints: from the right edge of the puddle up to Ink's feet, left, right, left
const PRINTS = Array.from({ length: 6 }, (_, k) => {
  const u = k / 5;
  const x = 214 + (318 - 214) * u;
  const y = 858 + (770 - 858) * u;
  const side = k % 2 ? 1 : -1;
  return { x: +(x + side * 9 * 0.65).toFixed(1), y: +(y + side * 9 * 0.76).toFixed(1), rot: 33, s: +(1.25 - 0.3 * u).toFixed(3) };
});

const PLACES = { well: WELL, feet: INK_FEET, size: INK_SIZE, puddle: PUDDLE, prints: PRINTS };

module.exports = { INKWELL_CSS, INKWELL_HTML, inkwellFrame, PLACES, INK_FEET, INK_SIZE, WELL };
