// A writing room at night, seen from behind the writer: someone at a typewriter,
// their head and shoulders hiding the page, so nothing on it can be read. The page
// that peeks out above their head only shows blurred, unreadable marks (not text).
// Rain on the window ahead, a desk lamp, a steaming mug, crumpled drafts, and Ink
// asleep in the lamplight.
//
// TYPIST_HTML is the markup (540 x 960, the 9:16 film frame); typistFrame(state)
// runs in the page and poses it: { t, carriage, feed, bob, arm, flinch }.

const TYPIST_CSS = `
  #tw { position: fixed; inset: 0; z-index: 900; overflow: hidden; display: none; background: #15110d; }
  #tw.on { display: block; }
  #tw .cam { position: absolute; inset: 0; transform-origin: 50% 50%; }
  #tw svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  #tw .rain { animation: none; }
`;

const TYPIST_HTML = `<div id="tw"><div class="cam"><svg viewBox="0 0 540 960" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="tw-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2620"/><stop offset="1" stop-color="#26332b"/></linearGradient>
    <pattern id="tw-stripes" width="44" height="40" patternUnits="userSpaceOnUse"><rect width="22" height="40" fill="#24322a"/><rect x="22" width="22" height="40" fill="#28372e"/><circle cx="11" cy="14" r="1.6" fill="#c9a45c" opacity=".12"/></pattern>
    <linearGradient id="tw-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16223a"/><stop offset="1" stop-color="#2d4060"/></linearGradient>
    <linearGradient id="tw-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3a26"/><stop offset="1" stop-color="#7a5236"/></linearGradient>
    <linearGradient id="tw-sweater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a5a3a"/><stop offset="1" stop-color="#6e3b25"/></linearGradient>
    <linearGradient id="tw-hair" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#22160f"/><stop offset=".72" stop-color="#2e1e15"/><stop offset="1" stop-color="#5a3a24"/></linearGradient>
    <linearGradient id="tw-machine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f4038"/><stop offset="1" stop-color="#1d2823"/></linearGradient>
    <linearGradient id="tw-chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8e4da"/><stop offset=".5" stop-color="#9c978c"/><stop offset="1" stop-color="#d6d1c6"/></linearGradient>
    <linearGradient id="tw-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f5a48"/><stop offset="1" stop-color="#1f3d31"/></linearGradient>
    <radialGradient id="tw-lamp" cx="80%" cy="60%" r="55%"><stop offset="0" stop-color="#ffd99a" stop-opacity=".55"/><stop offset=".45" stop-color="#ffc878" stop-opacity=".16"/><stop offset="1" stop-color="#ffc878" stop-opacity="0"/></radialGradient>
    <radialGradient id="tw-vig" cx="50%" cy="50%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
    <filter id="tw-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="tw-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <clipPath id="tw-glass"><rect x="132" y="150" width="276" height="300" rx="4"/></clipPath>
  </defs>

  <!-- the wall and the window ahead -->
  <rect width="540" height="960" fill="url(#tw-wall)"/>
  <rect width="540" height="620" fill="url(#tw-stripes)" opacity=".9"/>
  <rect x="120" y="138" width="300" height="324" rx="8" fill="#3d261b"/>
  <g clip-path="url(#tw-glass)">
    <rect x="132" y="150" width="276" height="300" fill="url(#tw-sky)"/>
    <path d="M354 186a24 24 0 1 0 20 38 19 19 0 1 1-20-38z" fill="#f6ecd2" opacity=".9"/>
    <g fill="#f6ecd2" opacity=".7"><circle cx="170" cy="182" r="1.4"/><circle cx="214" cy="214" r="1"/><circle cx="300" cy="170" r="1.2"/><circle cx="386" cy="262" r="1"/></g>
    <path d="M132 450V372h26v-28h22v38h20v-58h30v70h18v-40h34v52h22v-30h28v22h22v-52h34v126z" fill="#111a24"/>
    <g fill="#ffcf7a" opacity=".85"><rect x="186" y="352" width="5" height="6"/><rect x="236" y="338" width="5" height="6"/><rect x="306" y="396" width="5" height="6"/><rect x="372" y="360" width="5" height="6"/><rect x="214" y="400" width="5" height="6"/></g>
    <g class="rain" stroke="#cfe0f2" stroke-width="1.2" stroke-linecap="round" opacity=".38"></g>
  </g>
  <path d="M270 150v300M132 300h276" stroke="#3d261b" stroke-width="8"/>
  <rect x="112" y="458" width="316" height="14" rx="3" fill="#4b2f21"/>

  <!-- the desk -->
  <path d="M-20 640h580v320H-20z" fill="url(#tw-desk)"/>
  <path d="M-20 640h580" stroke="#8a6040" stroke-width="3"/>
  <g stroke="#4a2f1f" stroke-width="1.2" opacity=".35" fill="none"><path d="M-20 690q200 6 580-4M-20 760q260 8 580-6M-20 850q240 4 580-2"/></g>

  <!-- a banker's lamp on the right, lighting the page -->
  <g>
    <ellipse cx="482" cy="652" rx="46" ry="9" fill="#000" opacity=".35"/>
    <path d="M450 652q0-16 32-18 32 2 32 18z" fill="#b8913f"/>
    <rect x="478" y="552" width="8" height="86" fill="#a8823a"/>
    <path d="M424 556q0-30 58-32 58 2 58 32z" fill="url(#tw-shade)"/>
    <path d="M424 556h116" stroke="#e6c983" stroke-width="3"/>
    <ellipse class="bulb" cx="482" cy="558" rx="40" ry="5" fill="#fff1c9"/>
    <path d="M500 562v26" stroke="#c9a45c" stroke-width="2"/><circle cx="500" cy="590" r="3" fill="#c9a45c"/>
  </g>

  <!-- a mug, steaming -->
  <g>
    <ellipse cx="404" cy="652" rx="26" ry="6" fill="#000" opacity=".3"/>
    <path d="M382 604h44v40q0 10-10 10h-24q-10 0-10-10z" fill="#e8dcc6"/>
    <path d="M426 614q16 0 16 14t-16 14" fill="none" stroke="#e8dcc6" stroke-width="5"/>
    <ellipse cx="404" cy="604" rx="22" ry="5" fill="#4a2e1d"/>
    <g class="steam" fill="none" stroke="#f3ead8" stroke-width="3" stroke-linecap="round" opacity=".35"><path d="M396 592q-8-14 0-26t0-26"/><path d="M412 590q8-14 0-26t0-24"/></g>
  </g>

  <!-- Ink, asleep in the lamplight on the left of the desk -->
  <g class="ink">
    <ellipse cx="86" cy="652" rx="56" ry="9" fill="#000" opacity=".3"/>
    <path d="M36 650q-4-42 40-52 18-22 34-6 34 4 40 40 2 14-6 18z" fill="#141111"/>
    <path d="M58 600l-6-24 18 14zM98 590l12-20 2 24z" fill="#141111"/>
    <path d="M60 600l-3-14 9 8zM100 588l7-11 1 13z" fill="#d99a9c"/>
    <path d="M70 620q12 8 26 0M66 616q-6 4-14 2M102 616q6 4 14 2" fill="none" stroke="#f4f1ea" stroke-width="2" stroke-linecap="round"/>
    <path d="M62 612q6 4 12 0M90 612q6 4 12 0" fill="none" stroke="#9fae4a" stroke-width="2" stroke-linecap="round"/>
    <path d="M70 640q14-10 28 0v10H70z" fill="#f4f1ea"/>
    <path d="M140 646q30 2 26-20" fill="none" stroke="#141111" stroke-width="9" stroke-linecap="round"/>
  </g>

  <!-- the typewriter: its carriage and page move; the body sits still -->
  <g class="machine">
    <path d="M150 560q0-14 14-14h212q14 0 14 14v84H150z" fill="url(#tw-machine)"/>
    <path d="M160 600h220" stroke="#c9a45c" stroke-width="2" opacity=".6"/>
  </g>
  <g class="carriage">
    <g class="page">
      <rect x="196" y="300" width="150" height="232" fill="#f4ecdb"/>
      <rect x="196" y="300" width="150" height="232" fill="none" stroke="#d8cdb6"/>
      <g class="marks" filter="url(#tw-blur)" stroke="#5b4b3c" stroke-width="3" stroke-linecap="round" opacity=".32"></g>
    </g>
    <rect x="140" y="512" width="262" height="26" rx="13" fill="url(#tw-machine)"/>
    <rect x="148" y="516" width="246" height="7" rx="3" fill="#0f1512"/>
    <circle cx="136" cy="525" r="15" fill="url(#tw-chrome)"/><circle cx="406" cy="525" r="15" fill="url(#tw-chrome)"/>
    <circle cx="136" cy="525" r="6" fill="#57534b"/><circle cx="406" cy="525" r="6" fill="#57534b"/>
    <path d="M150 512l-22-40h-18" fill="none" stroke="url(#tw-chrome)" stroke-width="6" stroke-linecap="round"/>
  </g>

  <!-- the writer, from behind -->
  <g class="writer">
    <g class="arm-l"><path d="M60 760q-6-60 40-84l40 26q-30 30-34 80z" fill="url(#tw-sweater)"/></g>
    <g class="arm-r"><path d="M480 760q6-60-40-84l-40 26q30 30 34 80z" fill="url(#tw-sweater)"/></g>
    <path d="M44 960q-6-210 98-262 64-24 128-24t128 24q104 52 98 262z" fill="url(#tw-sweater)"/>
    <g stroke="#5a2f1d" stroke-width="2.5" opacity=".35" fill="none"><path d="M200 700q-6 130 0 260M340 700q6 130 0 260M270 690v270"/><path d="M234 700q-4 130 0 260M306 700q4 130 0 260" stroke-dasharray="6 7"/></g>
    <path d="M388 700q60 26 80 90" fill="none" stroke="#e8a46a" stroke-width="4" opacity=".55" stroke-linecap="round"/>
    <g class="head">
      <path d="M232 690q38 14 76 0v-30h-76z" fill="#c98f6c"/>
      <ellipse cx="270" cy="584" rx="80" ry="94" fill="url(#tw-hair)"/>
      <path d="M200 600q-8 50 30 86M340 600q8 50-30 86" fill="none" stroke="#1d130d" stroke-width="5" opacity=".6"/>
      <g fill="none" stroke="#3b281c" stroke-width="2.4" opacity=".7" stroke-linecap="round"><path d="M226 520q18 60 6 140M262 500q6 80-2 170M300 508q-4 80 12 160M330 540q-10 60 6 120"/></g>
      <path d="M332 530q20 40 12 100" fill="none" stroke="#e0a066" stroke-width="5" opacity=".5" stroke-linecap="round"/>
      <circle cx="270" cy="486" r="40" fill="url(#tw-hair)"/>
      <path d="M244 470q26-30 54 0M248 496q22 16 46 0" fill="none" stroke="#3b281c" stroke-width="2.4" opacity=".7"/>
      <path d="M292 480q14 14 10 34" fill="none" stroke="#e0a066" stroke-width="4" opacity=".55" stroke-linecap="round"/>
      <g transform="rotate(-32 270 486)"><rect x="200" y="481" width="132" height="10" rx="2" fill="#e8b33c"/><path d="M332 481l18 5-18 5z" fill="#e8c9a0"/><path d="M348 485l3 1-3 1z" fill="#2b2622"/><rect x="194" y="481" width="10" height="10" fill="#d98c8c"/><rect x="202" y="481" width="4" height="10" fill="#b8b2a6"/></g>
    </g>
  </g>

  <!-- light -->
  <rect width="540" height="960" fill="url(#tw-lamp)" class="glow"/>
  <rect width="540" height="960" fill="url(#tw-vig)"/>
</svg></div></div>`;

/**
 * Runs in the page. Poses the scene for one frame:
 *   t        seconds (rain, steam, the cat breathing, the lamp)
 *   carriage how far the carriage has moved left, in px (it moves a step per key)
 *   feed     lines fed up by the carriage returns (the marks on the page move up)
 *   bob      0..1, a key just struck (the head dips a little)
 *   arm      -1 left / 1 right: which arm struck the last key
 *   flinch   0..1, the bell just rang (the writer's head lifts a fraction)
 *   cam      { scale, x, y } for the camera
 */
function typistFrame(st) {
  const root = document.getElementById('tw');
  if (!root.dataset.ready) {
    // rain streaks and the page's marks, made once with a fixed seed
    let s = 99;
    const r = () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x6d2b79f5) >>> 0) / 4294967296);
    const rain = root.querySelector('.rain');
    let html = '';
    for (let i = 0; i < 46; i++) html += `<path d="M${(132 + r() * 290).toFixed(1)} ${(130 + r() * 340).toFixed(1)}l-3 ${(10 + r() * 12).toFixed(1)}"/>`;
    rain.innerHTML = html + html.replace(/M(\d+\.?\d*) (\d+\.?\d*)/g, (m, x, y) => `M${x} ${(Number(y) - 340).toFixed(1)}`);
    const marks = root.querySelector('.marks');
    let lines = '';
    for (let i = 0; i < 30; i++) {
      const y = 340 + i * 13;
      let x = 212 + (i % 6 === 0 ? 14 : 0);
      while (x < 330) {
        const w = 6 + r() * 26;
        if (x + w > 332) break;
        lines += `<path d="M${x.toFixed(1)} ${y}h${w.toFixed(1)}"/>`;
        x += w + 4 + r() * 4;
      }
    }
    marks.innerHTML = lines;
    root.dataset.ready = '1';
  }
  root.classList.toggle('on', st.on !== false);
  if (st.on === false) return;
  const t = st.t;
  root.querySelector('.rain').setAttribute('transform', `translate(${(-(t * 40) % 60).toFixed(1)} ${((t * 340) % 340).toFixed(1)})`);
  root.querySelector('.carriage').setAttribute('transform', `translate(${(-st.carriage).toFixed(1)} 0)`);
  root.querySelector('.marks').setAttribute('transform', `translate(0 ${(-st.feed * 13).toFixed(1)})`);
  const steam = root.querySelector('.steam');
  steam.setAttribute('transform', `translate(${(Math.sin(t * 1.3) * 3).toFixed(1)} ${(-((t * 9) % 14)).toFixed(1)})`);
  steam.setAttribute('opacity', (0.22 + 0.14 * Math.sin(t * 2.1)).toFixed(2));
  root.querySelector('.ink').setAttribute('transform', `translate(0 ${(-1.2 * Math.max(0, Math.sin(t * 2.2))).toFixed(2)})`);
  root.querySelector('.glow').setAttribute('opacity', (0.94 + 0.06 * Math.sin(t * 7.3) * Math.sin(t * 3.1)).toFixed(3));
  const dip = st.bob * 1.6 - st.flinch * 4;
  root.querySelector('.head').setAttribute('transform', `translate(${(st.arm * st.bob * 0.6).toFixed(2)} ${dip.toFixed(2)})`);
  root.querySelector('.arm-l').setAttribute('transform', `translate(0 ${(st.arm < 0 ? st.bob * 3 : 0).toFixed(2)})`);
  root.querySelector('.arm-r').setAttribute('transform', `translate(0 ${(st.arm > 0 ? st.bob * 3 : 0).toFixed(2)})`);
  const cam = st.cam ?? { scale: 1, x: 0, y: 0 };
  root.querySelector('.cam').style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`;
}

module.exports = { TYPIST_CSS, TYPIST_HTML, typistFrame };
