// Ink, close up and posable, for scenes drawn just for a video. He's the same drawing as
// the cat in the library's window (catSVG in public/js/art.js): the same shapes and
// colours, in the same 120 x 116 coordinates, with his parts split out so they can move.
//
// inkBig() is an SVG <g>; drop it into a scene's <svg>. In the page, poseInk(g, st)
// (installed as window.__poseInk by INK_POSE_JS) poses it for one frame:
//
//   x, y      where his feet are, in the scene (the middle of the shadow)
//   s         size (1 = 120 x 116 scene units); sx, sy squash and stretch (a landing)
//   tilt      head tilt, degrees;  hx, hy  head offset (hy > 0 looks down a little)
//   px, py    where he looks: pupils offset, about -3..3
//   pupil     0 = slit (calm), 1 = round (surprised, or very interested)
//   lids      0 = eyes open .. 1 = closed (0.4 is unimpressed)
//   ears      0 = up .. 1 = flat (oops);  twitch 0..1 flicks the right ear
//   tail      tail swing, degrees;  breath 0..1 (the chest rises)
//   pawL/pawR {x, y} in his own coordinates to lift that front paw there, or null
//   inky      true: his left front paw is black with ink
//   rimL/rimR 0..1 warm light just inside that edge (the lamp side)
//   shadow    0..1 (0 while he's in the air)

const FUR = '#141214';
const WHITE = '#f2f0ea';
const TOES = '#c9c4ba';
const BODY = 'M30 108c-4-30 4-52 26-56 24-4 34 22 30 56z';

function paw(cls) {
  return `<g class="${cls}" style="display:none">
    <path class="bi-leg" fill="none" stroke="${FUR}" stroke-width="11" stroke-linecap="round"/>
    <g class="bi-foot"><ellipse rx="8.5" ry="5.6" fill="${WHITE}"/><path d="M-3 -2.4v4.4M1.6 -2.4v4.4" stroke="${TOES}" stroke-width="1"/>
      <path class="bi-gloss" d="M-5 -2.6q4-2.2 8 0" fill="none" stroke="#9fb3d6" stroke-width="1.2" opacity="0"/></g>
  </g>`;
}

function inkBig(cls = '') {
  return `<g class="bi ${cls}">
    <defs>
      <clipPath id="bi-clip-body"><path d="${BODY}"/></clipPath>
      <clipPath id="bi-clip-head"><ellipse cx="57" cy="38" rx="27" ry="24"/></clipPath>
      <linearGradient id="bi-rimgrad-r" x1="0" y1="0" x2="1" y2="0"><stop offset=".5" stop-color="#ffd99a" stop-opacity="0"/><stop offset="1" stop-color="#ffd99a" stop-opacity=".85"/></linearGradient>
      <linearGradient id="bi-rimgrad-l" x1="1" y1="0" x2="0" y2="0"><stop offset=".5" stop-color="#ffd99a" stop-opacity="0"/><stop offset="1" stop-color="#ffd99a" stop-opacity=".85"/></linearGradient>
    </defs>
    <ellipse class="bi-shadow" cx="58" cy="112" rx="40" ry="4.5" fill="#000" opacity=".3"/>
    <g class="bi-tail"><path d="M80 104c18 2 30-6 30-20 0-10-6-16-12-24" fill="none" stroke="${FUR}" stroke-width="9" stroke-linecap="round"/><path d="M98 60c-2-3-4-5-6-6" stroke="${WHITE}" stroke-width="7" stroke-linecap="round"/></g>
    <g class="bi-body">
      <path d="${BODY}" fill="${FUR}"/>
      <path d="M48 62c4 10 14 10 16 0 6 16 4 34-6 46-10-10-14-30-10-46z" fill="${WHITE}"/>
      <path class="bi-rim-l" d="${BODY}" fill="none" stroke="url(#bi-rimgrad-l)" stroke-width="5" clip-path="url(#bi-clip-body)" opacity="0"/>
      <path class="bi-rim-r" d="${BODY}" fill="none" stroke="url(#bi-rimgrad-r)" stroke-width="5" clip-path="url(#bi-clip-body)" opacity="0"/>
      <g class="bi-rest-l"><ellipse cx="46" cy="108" rx="9" ry="5" fill="${WHITE}"/><path d="M43 106v4M47 106v4" stroke="${TOES}" stroke-width="1"/>
        <path class="bi-gloss" d="M41 105.6q4-2.2 8 0" fill="none" stroke="#9fb3d6" stroke-width="1.2" opacity="0"/></g>
      <g class="bi-rest-r"><ellipse cx="66" cy="108" rx="9" ry="5" fill="${WHITE}"/><path d="M63 106v4M67 106v4" stroke="${TOES}" stroke-width="1"/></g>
    </g>
    ${paw('bi-paw-l')}
    ${paw('bi-paw-r')}
    <g class="bi-head">
      <g class="bi-ear-l"><path d="M34 34L30 6l22 16z" fill="${FUR}"/><path d="M36 28l-2-14 10 9z" fill="#c98f8f"/></g>
      <g class="bi-ear-r"><path d="M80 34l4-28-22 16z" fill="${FUR}"/><path d="M78 28l2-14-10 9z" fill="#c98f8f"/></g>
      <ellipse cx="57" cy="38" rx="27" ry="24" fill="${FUR}"/>
      <ellipse class="bi-rim-l" cx="57" cy="38" rx="27" ry="24" fill="none" stroke="url(#bi-rimgrad-l)" stroke-width="4.5" clip-path="url(#bi-clip-head)" opacity="0"/>
      <ellipse class="bi-rim-r" cx="57" cy="38" rx="27" ry="24" fill="none" stroke="url(#bi-rimgrad-r)" stroke-width="4.5" clip-path="url(#bi-clip-head)" opacity="0"/>
      <path d="M57 22c-3 8-14 16-14 26 0 8 6 12 14 12s14-4 14-12c0-10-11-18-14-26z" fill="${WHITE}"/>
      <ellipse cx="45" cy="36" rx="5.5" ry="6" fill="#c8d65a"/><ellipse cx="69" cy="36" rx="5.5" ry="6" fill="#c8d65a"/>
      <ellipse class="bi-pupil" data-x="45" cx="45" cy="36" rx="1.8" ry="4.8" fill="#0b0a0b"/>
      <ellipse class="bi-pupil" data-x="69" cx="69" cy="36" rx="1.8" ry="4.8" fill="#0b0a0b"/>
      <g class="bi-shine"><circle cx="46.5" cy="33.5" r="1.1" fill="#fff" opacity=".85"/><circle cx="70.5" cy="33.5" r="1.1" fill="#fff" opacity=".85"/></g>
      <g fill="${FUR}"><rect class="bi-lid" x="38" y="29" width="15" height="14" rx="6"/><rect class="bi-lid" x="62" y="29" width="15" height="14" rx="6"/></g>
      <path d="M54 46h6l-3 3.5z" fill="#d18c92"/>
      <path d="M57 49.5v2.5M57 52c-2 2-5 2-6 0M57 52c2 2 5 2 6 0" stroke="#8a7a74" stroke-width="1" fill="none" stroke-linecap="round"/>
      <g stroke="#ece8de" stroke-width=".8" opacity=".85" stroke-linecap="round"><path d="M46 49l-20-3M46 51l-19 3M68 49l20-3M68 51l19 3"/></g>
    </g>
  </g>`;
}

// Runs in the page (it's sent over as a string).
function poseInk(g, st) {
  const q = (s) => g.querySelector(s);
  const qa = (s) => g.querySelectorAll(s);
  const f = (v, d = 2) => Number(v).toFixed(d);
  const s = st.s ?? 1;
  g.setAttribute('transform', `translate(${f(st.x)} ${f(st.y)}) scale(${f(s * (st.sx ?? 1), 4)} ${f(s * (st.sy ?? 1), 4)}) translate(-58 -112)`);
  q('.bi-shadow').setAttribute('opacity', f(0.3 * (st.shadow ?? 1), 3));
  q('.bi-tail').setAttribute('transform', `rotate(${f(st.tail ?? 0)} 80 104)`);
  q('.bi-body').setAttribute('transform', `translate(58 108) scale(1 ${f(1 + 0.025 * (st.breath ?? 0), 4)}) translate(-58 -108)`);
  q('.bi-head').setAttribute('transform', `translate(${f(st.hx ?? 0)} ${f((st.hy ?? 0) - 1.5 * (st.breath ?? 0))}) rotate(${f(st.tilt ?? 0)} 57 60)`);
  const ears = st.ears ?? 0;
  q('.bi-ear-l').setAttribute('transform', `rotate(${f(-ears * 40)} 40 30)`);
  q('.bi-ear-r').setAttribute('transform', `rotate(${f(ears * 40 - (st.twitch ?? 0) * 22)} 74 30)`);
  const px = st.px ?? 0;
  const py = st.py ?? 0;
  const pu = st.pupil ?? 0;
  for (const p of qa('.bi-pupil')) {
    p.setAttribute('cx', f(Number(p.dataset.x) + px));
    p.setAttribute('cy', f(36 + py));
    p.setAttribute('rx', f(1.8 + 2.9 * pu));
    p.setAttribute('ry', f(4.8 + 0.4 * pu));
  }
  q('.bi-shine').setAttribute('transform', `translate(${f(px * 0.35)} ${f(py * 0.35)})`);
  const lids = Math.min(1, Math.max(0, st.lids ?? 0));
  for (const l of qa('.bi-lid')) {
    l.setAttribute('transform', `translate(0 29) scale(1 ${f(lids, 4)}) translate(0 -29)`);
    l.style.display = lids < 0.01 ? 'none' : '';
  }
  for (const side of ['l', 'r']) {
    const at = st[side === 'l' ? 'pawL' : 'pawR'];
    const leg = q(`.bi-paw-${side}`);
    q(`.bi-rest-${side}`).style.display = at ? 'none' : '';
    leg.style.display = at ? '' : 'none';
    if (!at) continue;
    const sx = side === 'l' ? 47 : 67;
    const sy = 76;
    const dx = at.x - sx;
    const dy = at.y - sy;
    const len = Math.hypot(dx, dy) || 1;
    const bend = (side === 'l' ? -1 : 1) * Math.min(6, len * 0.12); // a soft elbow
    const cx = sx + dx / 2 - (dy / len) * bend;
    const cy = sy + dy / 2 + (dx / len) * bend;
    leg.querySelector('.bi-leg').setAttribute('d', `M${f(sx)} ${f(sy)}Q${f(cx)} ${f(cy)} ${f(at.x)} ${f(at.y)}`);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    leg.querySelector('.bi-foot').setAttribute('transform', `translate(${f(at.x)} ${f(at.y)}) rotate(${f(ang * 0.25 + (side === 'l' ? 45 : -45) * 0.25)})`);
  }
  const inky = Boolean(st.inky);
  for (const sel of ['.bi-rest-l', '.bi-paw-l .bi-foot']) {
    const node = q(sel);
    node.querySelector('ellipse').setAttribute('fill', inky ? '#1c1e29' : '#f2f0ea');
    node.querySelector('path').setAttribute('stroke', inky ? '#2c2f3d' : '#c9c4ba');
    node.querySelector('.bi-gloss').setAttribute('opacity', inky ? '.9' : '0');
  }
  for (const r of qa('.bi-rim-l')) r.setAttribute('opacity', f(st.rimL ?? 0, 3));
  for (const r of qa('.bi-rim-r')) r.setAttribute('opacity', f(st.rimR ?? 0, 3));
}

const INK_POSE_JS = `window.__poseInk = ${poseInk.toString()};`;

module.exports = { inkBig, INK_POSE_JS };
