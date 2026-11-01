// Hand-drawn SVG for everything in the library. All user text that ends up in
// SVG goes through esc() first.

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic pseudo-random numbers from a seed. */
export function rng(seed) {
  let s = typeof seed === 'number' ? seed : hash(String(seed));
  return () => {
    s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
    s = Math.imul(s ^ (s >>> 13), 3266489909) >>> 0;
    return ((s ^ (s >>> 16)) >>> 0) / 4294967296;
  };
}

export const SPINE_COLORS = [
  '#7b2e2a', '#a5443a', '#3f6b5a', '#2f4b62', '#5a3d63', '#8a6a2f', '#b8934f',
  '#46553a', '#6d3b2e', '#2b3a4a', '#9b7b5a', '#5b2a3a', '#d6c6a3', '#3a5a6a', '#7a6248',
];

export function spineStyle(book) {
  const r = rng(book.id);
  const color = SPINE_COLORS[Math.floor(r() * SPINE_COLORS.length)];
  const light = ['#d6c6a3', '#b8934f'].includes(color);
  return {
    color,
    ink: light ? '#2b2622' : '#f3e7cf',
    height: 0.78 + r() * 0.22, // fraction of the shelf height
    width: Math.min(1, 0.55 + (book.title.length / 40) + r() * 0.2),
    bands: r() < 0.55,
    lean: r() < 0.08,
  };
}

// Shared gradients, inserted once into the page.
export function defsSVG() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color:var(--sky-top)"/><stop offset="1" style="stop-color:var(--sky-bottom)"/>
    </linearGradient>
    <linearGradient id="g-wood" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4b2f21"/><stop offset=".5" stop-color="#57372650"/><stop offset="1" stop-color="#3d261b"/>
    </linearGradient>
    <linearGradient id="g-wood-v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5a3a28"/><stop offset="1" stop-color="#3a2419"/>
    </linearGradient>
    <linearGradient id="g-case-back" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#22160f"/><stop offset="1" stop-color="#2e1e15"/>
    </linearGradient>
    <linearGradient id="g-brass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e6c983"/><stop offset=".55" stop-color="#c9a45c"/><stop offset="1" stop-color="#9a7638"/>
    </linearGradient>
    <linearGradient id="g-shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2f6b4f"/><stop offset="1" stop-color="#1f4a37"/>
    </linearGradient>
    <linearGradient id="g-curtain" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#5e1f1c"/><stop offset=".3" stop-color="#7d2b26"/><stop offset=".6" stop-color="#5a1d1a"/><stop offset="1" stop-color="#7a2a25"/>
    </linearGradient>
    <radialGradient id="g-glow">
      <stop offset="0" stop-color="#ffd99a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd99a" stop-opacity="0"/>
    </radialGradient>
  </defs></svg>`;
}

// ---------------------------------------------------------------------------

export function streetDoorSVG() {
  return `<svg viewBox="0 0 180 400" class="art" aria-hidden="true">
    <path d="M6 400V70Q6 6 90 6t84 64v330z" fill="#24160f"/>
    <path d="M18 400V76q0-56 72-56t72 56v324z" fill="url(#g-wood)"/>
    <path d="M34 170V86q0-48 56-48t56 48v84z" fill="url(#g-sky)"/>
    <g class="window-stars" fill="#fff">
      <circle cx="60" cy="80" r="1"/><circle cx="118" cy="70" r="1.2"/><circle cx="96" cy="112" r=".8"/><circle cx="74" cy="132" r="1"/>
    </g>
    <path d="M34 150l20-10 12 6 18-14 16 10 14-8 32 16v20H34z" fill="var(--city)"/>
    <g class="rain" stroke="#cfe0f0" stroke-width="1" opacity=".5">
      <path d="M50 60l-4 14M80 52l-4 14M112 64l-4 14M136 90l-4 14M64 110l-4 14M100 120l-4 14"/>
    </g>
    <path d="M90 38v132M34 110h112" stroke="#2c1b13" stroke-width="5"/>
    <path d="M34 170V86q0-48 56-48t56 48v84z" fill="none" stroke="#2c1b13" stroke-width="6"/>
    <g fill="none" stroke="#2c1b13" stroke-width="4" opacity=".75">
      <rect x="34" y="190" width="48" height="92" rx="3"/><rect x="98" y="190" width="48" height="92" rx="3"/>
      <rect x="34" y="298" width="48" height="90" rx="3"/><rect x="98" y="298" width="48" height="90" rx="3"/>
    </g>
    <circle cx="150" cy="250" r="6" fill="url(#g-brass)"/>
    <rect x="138" y="262" width="22" height="10" rx="2" fill="url(#g-brass)"/>
    <g transform="translate(58 196)">
      <path d="M8 0L32 -12 56 0" fill="none" stroke="#c9a45c" stroke-width="1.5"/>
      <rect x="0" y="0" width="64" height="22" rx="3" fill="#f3e7cf"/>
      <text x="32" y="15.5" text-anchor="middle" font-family="Cormorant Garamond, serif" font-weight="700" font-size="13" fill="#7b2e2a" letter-spacing="2">OPEN</text>
    </g>
    <g transform="translate(150 22)">
      <path d="M0 0v10" stroke="#9a7638" stroke-width="2"/>
      <path d="M-9 26q0-16 9-16t9 16z" fill="url(#g-brass)"/><circle cx="0" cy="28" r="2.5" fill="#9a7638"/>
    </g>
  </svg>`;
}

export function bigWindowSVG() {
  return `<svg viewBox="0 0 340 330" class="art" aria-hidden="true">
    <path d="M40 300V70Q40 18 170 18T300 70v230z" fill="#24160f"/>
    <path d="M52 296V74q0-44 118-44t118 44v222z" fill="url(#g-sky)"/>
    <g class="window-stars" fill="#fff">
      <circle cx="90" cy="70" r="1.2"/><circle cx="130" cy="50" r="1"/><circle cx="210" cy="60" r="1.4"/><circle cx="250" cy="90" r="1"/>
      <circle cx="160" cy="96" r=".9"/><circle cx="110" cy="120" r="1"/><circle cx="268" cy="140" r="1.1"/><circle cx="196" cy="130" r=".8"/>
    </g>
    <g class="window-moon"><circle cx="236" cy="78" r="16" fill="#f4ecd2"/><circle cx="243" cy="73" r="15" fill="url(#g-sky)"/></g>
    <g class="window-sun"><circle cx="110" cy="96" r="26" fill="#fff4cf" opacity=".55"/><circle cx="110" cy="96" r="14" fill="#fff6dc" opacity=".9"/></g>
    <g fill="var(--city)">
      <path d="M52 296V214h22v-20h16v-26h18v26h12v34h20v-50l14-12 14 12v50h16v-18h26v-30h10v-10h8v10h10v62h18v-36h22v-12h12v108z"/>
    </g>
    <g fill="#ffd27a" class="city-lights">
      <rect x="96" y="176" width="5" height="7"/><rect x="104" y="196" width="5" height="7"/><rect x="146" y="166" width="5" height="7"/>
      <rect x="146" y="196" width="5" height="7"/><rect x="214" y="216" width="5" height="7"/><rect x="226" y="196" width="5" height="7"/>
      <rect x="262" y="236" width="5" height="7"/><rect x="62" y="226" width="5" height="7"/>
    </g>
    <g class="rain" stroke="#cfe0f0" stroke-width="1.1" opacity=".45">
      <path d="M70 40l-5 18M100 70l-5 18M130 30l-5 18M160 80l-5 18M190 40l-5 18M220 110l-5 18M250 50l-5 18M280 120l-5 18M84 150l-5 18M120 200l-5 18M176 170l-5 18M236 190l-5 18M270 230l-5 18M150 240l-5 18M96 260l-5 18"/>
    </g>
    <g stroke="#2c1b13" fill="none">
      <path d="M170 30v266M52 160h236M52 230h236" stroke-width="6"/>
      <path d="M52 296V74q0-44 118-44t118 44v222z" stroke-width="8"/>
    </g>
    <path d="M12 0h70v12c-8 70-18 140-6 296H12z" fill="url(#g-curtain)"/>
    <path d="M328 0h-70v12c8 70 18 140 6 296h64z" fill="url(#g-curtain)"/>
    <path d="M30 10c2 90 4 180 0 286M50 12c-4 90-2 190 8 284M290 10c-2 90-4 180 0 286" stroke="#3e1311" stroke-width="2" fill="none" opacity=".6"/>
    <rect x="4" y="0" width="332" height="10" rx="5" fill="url(#g-brass)"/>
    <rect x="24" y="292" width="292" height="16" rx="3" fill="url(#g-wood-v)"/>
    <rect x="30" y="306" width="280" height="10" fill="#2a1a12" opacity=".7"/>
    <g transform="translate(70 254)">
      <path d="M2 38h26l-4 -20H6z" fill="#a5582f"/><rect x="0" y="14" width="30" height="6" rx="2" fill="#b86a3c"/>
      <path d="M15 14C8 4 2 -2 4 -10c6 4 10 12 11 24M15 14c4-12 10-18 18-20-2 8-8 16-18 20M15 14c0-14 2-24 0-34 6 8 6 22 0 34" fill="#4f7a4a"/>
    </g>
  </svg>`;
}

export function catSVG() {
  return `<svg viewBox="0 0 120 116" class="art cat-art" aria-hidden="true">
    <ellipse cx="58" cy="112" rx="40" ry="4" fill="#000" opacity=".25"/>
    <g class="cat-tail"><path d="M80 104c18 2 30-6 30-20 0-10-6-16-12-24" fill="none" stroke="#141214" stroke-width="9" stroke-linecap="round"/><path d="M98 60c-2-3-4-5-6-6" stroke="#f2f0ea" stroke-width="7" stroke-linecap="round"/></g>
    <g class="cat-body">
      <path d="M30 108c-4-30 4-52 26-56 24-4 34 22 30 56z" fill="#141214"/>
      <path d="M48 62c4 10 14 10 16 0 6 16 4 34-6 46-10-10-14-30-10-46z" fill="#f2f0ea"/>
      <ellipse cx="46" cy="108" rx="9" ry="5" fill="#f2f0ea"/><ellipse cx="66" cy="108" rx="9" ry="5" fill="#f2f0ea"/>
      <path d="M43 106v4M47 106v4M63 106v4M67 106v4" stroke="#c9c4ba" stroke-width="1"/>
    </g>
    <g class="cat-head">
      <g class="cat-ear-l"><path d="M34 34L30 6l22 16z" fill="#141214"/><path d="M36 28l-2-14 10 9z" fill="#c98f8f"/></g>
      <g class="cat-ear-r"><path d="M80 34l4-28-22 16z" fill="#141214"/><path d="M78 28l2-14-10 9z" fill="#c98f8f"/></g>
      <ellipse cx="57" cy="38" rx="27" ry="24" fill="#141214"/>
      <path d="M57 22c-3 8-14 16-14 26 0 8 6 12 14 12s14-4 14-12c0-10-11-18-14-26z" fill="#f2f0ea"/>
      <g class="cat-eyes">
        <ellipse cx="45" cy="36" rx="5.5" ry="6" fill="#c8d65a"/><ellipse cx="69" cy="36" rx="5.5" ry="6" fill="#c8d65a"/>
        <g class="cat-pupils" fill="#0b0a0b"><ellipse cx="45" cy="36" rx="1.8" ry="4.8"/><ellipse cx="69" cy="36" rx="1.8" ry="4.8"/></g>
        <circle cx="46.5" cy="33.5" r="1.1" fill="#fff" opacity=".8"/><circle cx="70.5" cy="33.5" r="1.1" fill="#fff" opacity=".8"/>
        <g class="cat-lids" fill="#141214"><rect x="38" y="29" width="15" height="14" rx="6"/><rect x="62" y="29" width="15" height="14" rx="6"/></g>
      </g>
      <path d="M54 46h6l-3 3.5z" fill="#d18c92"/>
      <path d="M57 49.5v2.5M57 52c-2 2-5 2-6 0M57 52c2 2 5 2 6 0" stroke="#8a7a74" stroke-width="1" fill="none" stroke-linecap="round"/>
      <g stroke="#ece8de" stroke-width=".8" opacity=".85" stroke-linecap="round">
        <path d="M46 49l-20-3M46 51l-19 3M68 49l20-3M68 51l19 3"/>
      </g>
    </g>
  </svg>`;
}

export function clockSVG() {
  return `<svg viewBox="0 0 80 80" class="art" aria-hidden="true">
    <circle cx="40" cy="40" r="38" fill="url(#g-wood-v)"/><circle cx="40" cy="40" r="31" fill="#f3e7cf"/>
    <circle cx="40" cy="40" r="31" fill="none" stroke="#c9a45c" stroke-width="2"/>
    <g stroke="#3a2a20" stroke-width="2" stroke-linecap="round">
      <path d="M40 13v5M40 62v5M13 40h5M62 40h5"/>
    </g>
    <g stroke="#3a2a20" stroke-width="1" stroke-linecap="round">
      <path d="M53.5 16.6l-1.5 2.6M63.4 26.5l-2.6 1.5M63.4 53.5l-2.6-1.5M53.5 63.4l-1.5-2.6M26.5 63.4l1.5-2.6M16.6 53.5l2.6-1.5M16.6 26.5l2.6 1.5M26.5 16.6l1.5 2.6"/>
    </g>
    <path class="clock-hour" d="M40 40V24" stroke="#2b2622" stroke-width="3.2" stroke-linecap="round"/>
    <path class="clock-minute" d="M40 40V16" stroke="#2b2622" stroke-width="2" stroke-linecap="round"/>
    <circle cx="40" cy="40" r="2.5" fill="#7b2e2a"/>
  </svg>`;
}

export function librarianSVG() {
  return `<svg viewBox="0 0 180 210" class="art librarian-art" aria-hidden="true">
    <g class="lw-body">
      <path d="M22 210c2-56 18-86 54-96l14 12 14-12c36 10 52 40 54 96z" fill="#8f7d9e"/>
      <path d="M76 114l14 24 14-24c-6 4-22 4-28 0z" fill="#f4efe6"/>
      <path d="M90 138v72" stroke="#7a688a" stroke-width="2"/>
      <circle cx="90" cy="156" r="2.4" fill="#e9dfcf"/><circle cx="90" cy="176" r="2.4" fill="#e9dfcf"/><circle cx="90" cy="196" r="2.4" fill="#e9dfcf"/>
      <g transform="translate(120 140)"><circle r="5" fill="url(#g-brass)"/><circle r="2" fill="#7b2e2a"/></g>
      <path d="M40 150c4 20 6 40 6 60M140 150c-4 20-6 40-6 60" stroke="#7a688a" stroke-width="2" fill="none" opacity=".6"/>
    </g>
    <g class="lw-head">
      <rect x="81" y="96" width="18" height="18" rx="6" fill="#ebc7ad"/>
      <circle cx="90" cy="24" r="17" fill="#e2ddd6"/>
      <path d="M78 18c6-6 18-6 24 0M76 26c8-4 20-4 28 0" stroke="#c7c0b6" stroke-width="1.4" fill="none"/>
      <ellipse cx="90" cy="64" rx="38" ry="38" fill="#e7e2db"/>
      <ellipse cx="61" cy="74" rx="5" ry="7" fill="#ebc7ad"/><ellipse cx="119" cy="74" rx="5" ry="7" fill="#ebc7ad"/>
      <circle cx="61" cy="83" r="2.6" fill="#f6f2ea"/><circle cx="119" cy="83" r="2.6" fill="#f6f2ea"/>
      <ellipse cx="90" cy="72" rx="28" ry="31" fill="#f1d0b8"/>
      <path d="M60 66c2-24 14-34 30-34s28 10 30 34c-6-12-16-20-30-20s-24 8-30 20z" fill="#e7e2db"/>
      <path d="M66 52c8-8 20-10 30-6" stroke="#cfc8be" stroke-width="1.4" fill="none"/>
      <path d="M71 62q7-4 13 0M96 62q7-4 13 0" stroke="#b9b0a6" stroke-width="2" fill="none" stroke-linecap="round"/>
      <g class="lw-eyes" fill="#3b2a22"><ellipse cx="78" cy="72" rx="2.2" ry="2.6"/><ellipse cx="102" cy="72" rx="2.2" ry="2.6"/></g>
      <path d="M70 76l-3 2M110 76l3 2M71 79l-3 1M109 79l3 1" stroke="#d4a98e" stroke-width=".9"/>
      <g fill="none" stroke="#8a6a44" stroke-width="2"><circle cx="78" cy="72" r="9"/><circle cx="102" cy="72" r="9"/><path d="M87 71q3-3 6 0M69 70l-7-3M111 70l7-3"/></g>
      <circle cx="78" cy="72" r="9" fill="#fff" opacity=".12"/><circle cx="102" cy="72" r="9" fill="#fff" opacity=".12"/>
      <path d="M62 68c-2 20 4 40 28 46s30-26 28-46" fill="none" stroke="#c9a45c" stroke-width=".8" opacity=".7"/>
      <path d="M89 76q-2 7 1 9" stroke="#cf9f84" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="72" cy="86" r="5" fill="#e79b8c" opacity=".35"/><circle cx="108" cy="86" r="5" fill="#e79b8c" opacity=".35"/>
      <path class="lw-mouth" d="M81 91q9 7 18 0" stroke="#a5574a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;
}

export function counterSVG() {
  return `<svg viewBox="0 0 400 250" class="art" aria-hidden="true">
    <ellipse cx="62" cy="76" rx="70" ry="44" fill="url(#g-glow)" class="lamp-glow"/>
    <g transform="translate(36 22)">
      <rect x="22" y="40" width="6" height="18" fill="url(#g-brass)"/>
      <ellipse cx="25" cy="58" rx="20" ry="5" fill="url(#g-brass)"/>
      <path d="M2 40q0-22 23-22t23 22z" fill="url(#g-shade)"/><path d="M2 40h46" stroke="#e6c983" stroke-width="2"/>
      <path d="M6 41h38l-3 4H9z" fill="#ffe7b0" opacity=".9"/>
    </g>
    <g transform="translate(262 34)">
      <rect x="0" y="34" width="86" height="12" rx="2" fill="#2f4b62"/><rect x="6" y="22" width="76" height="12" rx="2" fill="#7b2e2a"/>
      <rect x="2" y="10" width="80" height="12" rx="2" fill="#d6c6a3"/><rect x="10" y="0" width="64" height="10" rx="2" fill="#3f6b5a"/>
      <path d="M0 40h86M6 28h76M2 16h80" stroke="#000" opacity=".15"/>
    </g>
    <g transform="translate(212 56)"><path d="M0 14q0-14 13-14t13 14z" fill="url(#g-brass)"/><rect x="-3" y="13" width="32" height="3" rx="1.5" fill="#9a7638"/><circle cx="13" cy="-2" r="2.5" fill="#9a7638"/></g>
    <g transform="translate(120 46)"><rect width="56" height="26" rx="2" fill="#f6efe1" transform="rotate(-6)"/><path d="M6 8h38M6 14h30M6 20h34" stroke="#9a8f80" stroke-width="1" transform="rotate(-6)"/></g>
    <rect x="0" y="70" width="400" height="16" rx="3" fill="#5c3b29"/>
    <rect x="0" y="84" width="400" height="3" fill="url(#g-brass)"/>
    <rect x="10" y="87" width="380" height="163" fill="url(#g-wood)"/>
    <g fill="none" stroke="#2c1b13" stroke-width="3" opacity=".6">
      <rect x="26" y="104" width="100" height="128" rx="4"/><rect x="150" y="104" width="100" height="128" rx="4"/><rect x="274" y="104" width="100" height="128" rx="4"/>
    </g>
    <g transform="translate(160 132)">
      <rect width="80" height="26" rx="3" fill="url(#g-brass)"/>
      <text x="40" y="17.5" text-anchor="middle" font-family="Cormorant Garamond, serif" font-weight="700" font-size="11" fill="#3a2716" letter-spacing="1.5">FRONT DESK</text>
    </g>
  </svg>`;
}

export function cardCatalogSVG() {
  let drawers = '';
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 3; c++) {
      const x = 10 + c * 34;
      const y = 14 + r * 34;
      drawers += `<rect x="${x}" y="${y}" width="30" height="30" rx="2" fill="#5a3a28" stroke="#2c1b13" stroke-width="1.5"/>
        <rect x="${x + 8}" y="${y + 7}" width="14" height="7" fill="#f3e7cf" opacity=".8"/>
        <rect x="${x + 11}" y="${y + 18}" width="8" height="3" rx="1.5" fill="url(#g-brass)"/>`;
    }
  }
  return `<svg viewBox="0 0 122 250" class="art" aria-hidden="true">
    <rect x="0" y="0" width="122" height="230" rx="3" fill="#3d261b"/>${drawers}
    <rect x="4" y="226" width="114" height="10" fill="#2a1a12"/>
    <path d="M14 236v14M108 236v14" stroke="#2a1a12" stroke-width="6"/>
    <g transform="translate(40 -36)"><path d="M6 36l4-20h22l4 20z" fill="#a5582f"/><path d="M21 16c-6-10-14-12-18-10 4 8 10 10 18 10M21 16c4-10 12-14 18-12-2 8-10 12-18 12M21 16c0-10-2-18 0-24 4 6 4 16 0 24" fill="#4f7a4a"/></g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Bookcases

const CASE_W = 250;
const CASE_H = 370;
const ROWS = 5;
const TOP = 30;
const ROW_H = 64;

function decoration(kind, x, baseY) {
  switch (kind) {
    case 'plant':
      return `<g transform="translate(${x} ${baseY - 34})"><path d="M2 34h20l-3-14H5z" fill="#a5582f"/><path d="M12 20C6 12 0 10-2 4c6 0 12 6 14 16M12 20c2-10 8-16 14-16-2 6-6 12-14 16M12 20c-1-8 0-16 2-20 2 6 1 14-2 20" fill="#557f4e"/></g>`;
    case 'candle':
      return `<g transform="translate(${x} ${baseY - 30})"><rect x="4" y="10" width="8" height="20" fill="#efe4cc"/><ellipse cx="8" cy="30" rx="10" ry="3" fill="url(#g-brass)"/><path d="M8 2q3 4 0 8-3-4 0-8z" fill="#ffcf6b"/></g>`;
    case 'globe':
      return `<g transform="translate(${x} ${baseY - 36})"><circle cx="12" cy="13" r="11" fill="#3a5a6a"/><path d="M5 9q5 2 6 8t6 2M14 3q-2 5 3 7" stroke="#8fae7a" stroke-width="3" fill="none"/><path d="M12 24v8M4 36h16" stroke="#b8934f" stroke-width="3"/></g>`;
    case 'hourglass':
      return `<g transform="translate(${x} ${baseY - 30})"><rect x="0" y="0" width="18" height="3" fill="#5a3a28"/><rect x="0" y="27" width="18" height="3" fill="#5a3a28"/><path d="M3 3h12l-5 12 5 12H3l5-12z" fill="#e8dcc2" opacity=".6"/><path d="M5 25h8l-4-7z" fill="#c9a45c"/></g>`;
    case 'frame':
      return `<g transform="translate(${x} ${baseY - 34})"><rect x="0" y="0" width="24" height="30" rx="1" fill="url(#g-brass)" transform="rotate(-6 12 30)"/><rect x="4" y="4" width="16" height="22" fill="#d9cdb6" transform="rotate(-6 12 30)"/><circle cx="12" cy="13" r="4" fill="#b2a58c" transform="rotate(-6 12 30)"/></g>`;
    default: // bookend
      return `<g transform="translate(${x} ${baseY - 30})"><path d="M0 30V4q0-4 4-4h6v30z" fill="url(#g-brass)"/></g>`;
  }
}

function plaque(name) {
  const label = esc(name.toUpperCase());
  const fit = name.length > 14 ? ` textLength="${Math.min(150, name.length * 7.6)}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<g transform="translate(${CASE_W / 2} 4)">
    <rect x="-82" y="0" width="164" height="22" rx="3" fill="url(#g-brass)"/>
    <rect x="-79" y="3" width="158" height="16" rx="2" fill="none" stroke="#9a7638" stroke-width=".8"/>
    <text x="0" y="15.5" text-anchor="middle" font-family="Cormorant Garamond, serif" font-weight="700" font-size="11.5" fill="#3a2716" letter-spacing="1.2"${fit}>${label}</text>
  </g>`;
}

/** A bookcase as seen from the hall. `books` are the most-read books on that shelf. */
export function bookcaseSVG(genre, books) {
  const r = rng(`case:${genre.id}`);
  const decor = ['plant', 'candle', 'globe', 'hourglass', 'frame', 'bookend'];
  let content = '';
  let i = 0;
  for (let row = 0; row < ROWS; row++) {
    const baseY = TOP + ROW_H * (row + 1);
    let x = 18;
    const right = CASE_W - 18;
    let placed = 0;
    while (i < books.length) {
      const s = spineStyle(books[i]);
      const w = Math.round(9 + s.width * 9);
      if (x + w > right - (s.lean ? 10 : 0)) break;
      const h = Math.round((ROW_H - 10) * s.height);
      const y = baseY - h;
      const lean = s.lean && x + w + 14 <= right ? ` transform="rotate(12 ${x + w} ${baseY})"` : '';
      content += `<g class="book" data-book="${esc(books[i].id)}"${lean}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.2" fill="${s.color}"/>`;
      if (s.bands) content += `<path d="M${x} ${y + 6}h${w}M${x} ${baseY - 7}h${w}" stroke="#e6c983" stroke-width="1.2" opacity=".7"/>`;
      content += `<rect x="${x + w - 2}" y="${y}" width="2" height="${h}" fill="#000" opacity=".18"/></g>`;
      x += w + (s.lean ? 6 : 1);
      i++;
      placed++;
    }
    // Something on every shelf: a decoration where books haven't arrived yet.
    if (right - x > 34 && r() < (placed === 0 ? 0.4 : 0.3)) {
      const kind = decor[Math.floor(r() * decor.length)];
      const at = placed === 0 ? 20 + Math.floor(r() * (right - 70)) : Math.min(right - 30, x + 10);
      content += decoration(kind, at, baseY);
    }
  }
  const empty = books.length === 0
    ? `<g transform="translate(${CASE_W / 2} ${TOP + ROW_H * 3 - 26}) rotate(-3)">
        <rect x="-62" y="-14" width="124" height="30" rx="2" fill="#f6efe1"/>
        <text x="0" y="6" text-anchor="middle" font-family="Caveat, cursive" font-size="15" fill="#5b4a3e">waiting for a first story</text>
      </g>`
    : '';

  let boards = '';
  for (let row = 1; row <= ROWS; row++) {
    const y = TOP + ROW_H * row;
    boards += `<rect x="12" y="${y}" width="${CASE_W - 24}" height="7" fill="#5a3a28"/><rect x="12" y="${y + 7}" width="${CASE_W - 24}" height="2" fill="#000" opacity=".3"/>`;
  }
  return `<svg viewBox="0 0 ${CASE_W} ${CASE_H}" class="art" aria-hidden="true">
    <rect x="0" y="22" width="${CASE_W}" height="${CASE_H - 22}" fill="#3d261b"/>
    <rect x="12" y="${TOP}" width="${CASE_W - 24}" height="${ROW_H * ROWS}" fill="url(#g-case-back)"/>
    ${content}${empty}${boards}
    <rect x="0" y="22" width="12" height="${CASE_H - 22}" fill="url(#g-wood)"/><rect x="${CASE_W - 12}" y="22" width="12" height="${CASE_H - 22}" fill="url(#g-wood)"/>
    <path d="M-4 30h${CASE_W + 8}l-6-10H2z" fill="#5c3b29"/>
    ${plaque(genre.name)}
    <rect x="0" y="${TOP + ROW_H * ROWS + 9}" width="${CASE_W}" height="${CASE_H - (TOP + ROW_H * ROWS + 9)}" fill="#2c1b13"/>
  </svg>`;
}

// ---------------------------------------------------------------------------

const CHAIR_COLORS = ['#7b2e2a', '#2f5a52', '#5a3d63', '#8a5a2b'];

export function nookSVG(index) {
  const chair = CHAIR_COLORS[index % CHAIR_COLORS.length];
  return `<svg viewBox="0 0 300 330" class="art" aria-hidden="true">
    <ellipse cx="236" cy="96" rx="96" ry="90" fill="url(#g-glow)" class="lamp-glow"/>
    <ellipse cx="150" cy="316" rx="140" ry="14" fill="#5e2522"/>
    <ellipse cx="150" cy="316" rx="126" ry="10" fill="none" stroke="#c9a45c" stroke-width="1.5" stroke-dasharray="6 4" opacity=".7"/>
    <g transform="translate(236 0)">
      <path d="M0 96v214" stroke="#b8934f" stroke-width="4"/>
      <ellipse cx="0" cy="312" rx="20" ry="5" fill="url(#g-brass)"/>
      <path d="M-30 98l10-46h40l10 46z" fill="#e9cf98"/>
      <path d="M-30 98h60" stroke="#c9a45c" stroke-width="2"/>
      <path d="M-26 98l-1 4h54l-1-4z" fill="#ffe4a8" opacity=".8"/>
    </g>
    <g transform="translate(20 0)">
      <ellipse cx="34" cy="232" rx="32" ry="8" fill="#5c3b29"/>
      <path d="M34 238v70M18 310h32" stroke="#4a2f21" stroke-width="5" stroke-linecap="round"/>
      <g transform="translate(16 214)"><path d="M0 4h18v8q0 6-6 6H6q-6 0-6-6z" fill="#f3e7cf"/><path d="M18 7q6 0 6 4t-6 4" stroke="#f3e7cf" stroke-width="2.5" fill="none"/><path d="M6 0q2-4 0-8M12 0q2-4 0-8" stroke="#fff" opacity=".5" fill="none"/></g>
      <rect x="38" y="222" width="24" height="6" rx="1" fill="#2f4b62" transform="rotate(-4 50 225)"/>
    </g>
    <g class="chair">
      <path d="M96 290V150q0-46 54-46t54 46v140z" fill="${chair}"/>
      <path d="M96 150q0-46 54-46t54 46" fill="none" stroke="#000" stroke-width="2" opacity=".2"/>
      <path d="M118 140v120M150 120v140M182 140v120" stroke="#000" opacity=".12" stroke-width="2"/>
      <path d="M78 300v-80q0-30 30-30v110z" fill="${chair}"/><path d="M222 300v-80q0-30-30-30v110z" fill="${chair}"/>
      <ellipse cx="93" cy="196" rx="16" ry="10" fill="${chair}" stroke="#000" stroke-opacity=".2"/><ellipse cx="207" cy="196" rx="16" ry="10" fill="${chair}" stroke="#000" stroke-opacity=".2"/>
      <rect x="104" y="244" width="92" height="26" rx="10" fill="${chair}" stroke="#000" stroke-opacity=".25"/>
      <rect x="84" y="268" width="132" height="30" rx="4" fill="${chair}"/><rect x="84" y="268" width="132" height="30" rx="4" fill="#000" opacity=".18"/>
      <path d="M92 298l-4 14M208 298l4 14" stroke="#2a1a12" stroke-width="6" stroke-linecap="round"/>
    </g>
  </svg>`;
}

export function writingDoorSVG() {
  return `<svg viewBox="0 0 300 400" class="art" aria-hidden="true">
    <rect x="10" y="20" width="280" height="380" fill="#24160f"/>
    <rect x="24" y="34" width="252" height="366" fill="#3a241a"/>
    <defs>
      <radialGradient id="g-doorlight" cx="50%" cy="58%" r="75%"><stop offset="0" stop-color="#ffe7b4"/><stop offset=".65" stop-color="#f2c37a"/><stop offset="1" stop-color="#c88743"/></radialGradient>
      <filter id="f-frost" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.2"/></filter>
    </defs>
    <g class="door-glow"><rect x="44" y="60" width="96" height="150" rx="4" fill="url(#g-doorlight)"/><rect x="160" y="60" width="96" height="150" rx="4" fill="url(#g-doorlight)"/></g>
    <g class="door-writer" filter="url(#f-frost)" fill="#4a2d1a">
      <circle cx="196" cy="142" r="12"/><path d="M174 192q2-34 22-38 20 4 22 38z"/>
      <rect x="164" y="190" width="80" height="6" rx="2"/><path d="M236 166l-9 14h18z"/><rect x="234" y="179" width="3" height="12"/>
    </g>
    <g class="frost"><rect x="44" y="60" width="96" height="150" rx="4" fill="#e8dcc6"/><rect x="160" y="60" width="96" height="150" rx="4" fill="#e8dcc6"/></g>
    <g font-family="Cormorant Garamond, serif" font-weight="700" fill="#5c3d1c" text-anchor="middle" letter-spacing="3">
      <text x="92" y="128" font-size="15">WRITING</text><text x="208" y="128" font-size="15">ROOMS</text>
      <text x="150" y="160" font-size="10" letter-spacing="2" font-style="italic" font-weight="500">— at the back —</text>
    </g>
    <path d="M150 34v366" stroke="#24160f" stroke-width="4"/>
    <g fill="none" stroke="#24160f" stroke-width="3" opacity=".7"><rect x="44" y="236" width="96" height="140" rx="4"/><rect x="160" y="236" width="96" height="140" rx="4"/></g>
    <rect x="128" y="240" width="8" height="34" rx="3" fill="url(#g-brass)"/><rect x="164" y="240" width="8" height="34" rx="3" fill="url(#g-brass)"/>
    <g transform="translate(150 0)"><path d="M0 0v12" stroke="#9a7638" stroke-width="2"/><path d="M-14 26l6-14h16l6 14z" fill="url(#g-shade)"/><ellipse cx="0" cy="34" rx="40" ry="20" fill="url(#g-glow)"/></g>
  </svg>`;
}

export function pendantSVG() {
  return `<svg viewBox="0 0 80 120" class="art" aria-hidden="true">
    <path d="M40 0v70" stroke="#1a110c" stroke-width="2"/>
    <path d="M14 96q0-26 26-26t26 26z" fill="#2c3b30"/><path d="M14 96h52" stroke="#c9a45c" stroke-width="3"/>
    <ellipse cx="40" cy="97" rx="12" ry="5" fill="#fff1c9"/>
  </svg>`;
}

export function visitorSVG() {
  return `<svg viewBox="0 0 64 124" class="art" aria-hidden="true">
    <ellipse cx="32" cy="120" rx="22" ry="4" fill="#000" opacity=".3"/>
    <g class="leg leg-back"><rect x="25" y="86" width="9" height="30" rx="4" fill="#25232c"/><rect x="23" y="112" width="14" height="7" rx="3" fill="#1a1416"/></g>
    <g class="arm arm-back"><rect x="34" y="50" width="9" height="34" rx="4.5" fill="#a87332"/></g>
    <path d="M16 92q-2-40 16-44 18 4 16 44z" fill="#c58b3e"/>
    <path d="M32 50v42" stroke="#a87332" stroke-width="1.5"/>
    <path d="M18 52q14 8 28 0l-2 8q-12 6-24 0z" fill="#7b2e2a"/><path d="M38 56l6 18-6 2-4-16z" fill="#7b2e2a"/>
    <g class="leg leg-front"><rect x="30" y="86" width="9" height="30" rx="4" fill="#2d2b35"/><rect x="30" y="112" width="15" height="7" rx="3" fill="#1f181a"/></g>
    <g class="arm arm-front"><rect x="24" y="50" width="9" height="34" rx="4.5" fill="#d29a4c"/><circle cx="28.5" cy="85" r="4.5" fill="#e7c3a4"/></g>
    <circle cx="33" cy="30" r="15" fill="#e7c3a4"/>
    <path d="M18 28q0-18 15-18t15 18q-8-6-15-6t-15 6z" fill="#3f6b5a"/><circle cx="33" cy="9" r="4.5" fill="#d6c6a3"/>
    <path d="M18 27h30" stroke="#2f5a4b" stroke-width="3"/>
    <circle cx="40" cy="32" r="1.6" fill="#3b2a22"/><circle cx="43" cy="37" r="2.4" fill="#e79b8c" opacity=".45"/>
  </svg>`;
}

export function ghostSVG(seated = false) {
  if (seated) {
    return `<svg viewBox="0 0 64 100" class="art" aria-hidden="true"><g fill="currentColor">
      <circle cx="30" cy="22" r="13"/><path d="M14 74q-2-36 16-40 18 4 16 40z"/><path d="M18 70h32q6 0 6 6v4H20z"/><rect x="44" y="72" width="9" height="26" rx="4"/>
    </g></svg>`;
  }
  return `<svg viewBox="0 0 64 124" class="art" aria-hidden="true"><g fill="currentColor">
    <circle cx="32" cy="30" r="14"/><path d="M16 92q-2-40 16-44 18 4 16 44z"/><rect x="24" y="86" width="9" height="32" rx="4"/><rect x="32" y="86" width="9" height="32" rx="4"/>
  </g></svg>`;
}

/** Small portrait used in the front-desk dialog. */
export function librarianPortraitSVG() {
  return librarianSVG().replace('viewBox="0 0 180 210"', 'viewBox="20 0 140 150"');
}

export function catPortraitSVG() {
  return catSVG().replace('viewBox="0 0 120 116"', 'viewBox="20 0 80 70"');
}
