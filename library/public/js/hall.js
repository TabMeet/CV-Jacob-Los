// The hall: a long room you walk through, from the street door at the front,
// past the cat in the window and the front desk, along the shelves, to the
// writing rooms at the back.

import * as art from './art.js';
import { el, overlayOpen, prefersReducedMotion } from './ui.js';

const WORLD_H = 600;
const SPEED = 330; // world units per second
const RUN = 2.2;
const TRAVEL = 4.5; // when using the directory
const VISITOR_BASE = 580;

export function createHall({ world, viewport, genres, librarianName, catName, onInteract, onZone }) {
  const spots = [];
  const ghosts = new Map();
  const shelfEls = new Map();
  let width = 0;

  // -- layout -----------------------------------------------------------------

  const add = (className, { x, y, w, h, html = '', z = 1 }) => {
    const node = el('div', { class: `item ${className}`, style: { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, zIndex: z }, html });
    world.append(node);
    return node;
  };

  const addSpot = (spot) => {
    spots.push(spot);
    const btn = el(
      'button',
      {
        class: 'hotspot',
        type: 'button',
        style: { left: `${spot.x0}px`, top: `${spot.top}px`, width: `${spot.x1 - spot.x0}px`, height: `${spot.bottom - spot.top}px` },
        'aria-label': spot.verb,
        onclick: (e) => {
          e.stopPropagation();
          goInteract(spot);
        },
      },
      el('span', { class: 'hotspot-label' }, spot.verb),
    );
    spot.button = btn;
    world.append(btn);
  };

  ['ceiling', 'wall', 'picture-rail', 'wainscot', 'baseboard', 'floor', 'runner'].forEach((name) => world.append(el('div', { class: `layer layer-${name}` })));

  // Front of the shop
  add('door', { x: 30, y: 90, w: 180, h: 400, html: art.streetDoorSVG() });
  addSpot({ id: 'door', zone: 'entrance', cx: 120, x0: 30, x1: 210, top: 90, bottom: 490, promptY: 150, verb: 'Look out of the door' });

  add('window', { x: 250, y: 88, w: 340, h: 330, html: art.bigWindowSVG() });
  const cat = add('cat', { x: 440, y: 270, w: 120, h: 116, html: art.catSVG(), z: 3 });
  addSpot({ id: 'cat', zone: 'window', cx: 500, x0: 250, x1: 590, top: 88, bottom: 490, promptY: 200, verb: `Say hello to ${catName}, the cat` });

  const clock = add('clock', { x: 1061, y: 112, w: 80, h: 80, html: art.clockSVG() });
  const librarian = add('librarian', { x: 730, y: 150, w: 180, h: 210, html: art.librarianSVG(), z: 1 });
  add('counter', { x: 620, y: 250, w: 400, h: 250, html: art.counterSVG(), z: 2 });
  add('catalog', { x: 1040, y: 240, w: 122, h: 250, html: art.cardCatalogSVG() });
  addSpot({ id: 'desk', zone: 'desk', cx: 820, x0: 620, x1: 1170, top: 100, bottom: 500, promptY: 140, verb: `Talk to ${librarianName}, the librarian` });

  // The shelves, with armchairs between every three
  let x = 1240;
  const chairs = [];
  const addNook = () => {
    const i = chairs.length;
    add('nook', { x, y: 182, w: 300, h: 330, html: art.nookSVG(i), z: 2 });
    const spot = { id: `chair:${i}`, zone: 'reading', cx: x + 150, seatX: x + 150, x0: x + 70, x1: x + 230, top: 270, bottom: 500, promptY: 226, verb: 'Sit down in the armchair' };
    chairs.push(spot);
    addSpot(spot);
    x += 330;
  };
  genres.forEach((g, i) => {
    if (i > 0 && i % 3 === 0) addNook();
    const node = add('bookcase', { x, y: 120, w: 250, h: 370, html: art.bookcaseSVG(g, []) });
    shelfEls.set(g.id, node);
    addSpot({ id: `shelf:${g.id}`, zone: `shelf:${g.id}`, genre: g.id, cx: x + 125, x0: x, x1: x + 250, top: 120, bottom: 490, promptY: 110, verb: `Browse ${g.name}` });
    x += 290;
  });
  addNook();

  // The writing rooms at the back
  const writingDoor = add('writing-door', { x, y: 90, w: 300, h: 400, html: art.writingDoorSVG() });
  const doorSign = el('div', { class: 'door-sign', style: { left: `${x + 150}px`, top: '292px' } }, 'Quiet, please.', el('br'), 'Stories in progress.');
  world.append(doorSign);
  addSpot({ id: 'writing', zone: 'writing', cx: x + 150, x0: x, x1: x + 300, top: 90, bottom: 500, promptY: 80, verb: 'Go into the writing rooms' });
  x += 360;
  width = x;
  world.style.width = `${width}px`;

  for (let lx = 700; lx < width - 100; lx += 560) {
    add('pendant', { x: lx - 40, y: 0, w: 80, h: 120, html: art.pendantSVG(), z: 1 });
    world.append(el('div', { class: 'pendant-glow', style: { left: `${lx}px` } }));
  }

  const visitor = el('div', { class: 'visitor', html: `<div class="flip">${art.visitorSVG()}</div>` });
  world.append(visitor);
  const prompt = el('div', { class: 'prompt', 'aria-hidden': 'true' });
  world.append(prompt);

  // -- the clock on the wall shows the visitor's own time ---------------------

  const hourHand = clock.querySelector('.clock-hour');
  const minuteHand = clock.querySelector('.clock-minute');
  const tick = () => {
    const now = new Date();
    const m = now.getMinutes() + now.getSeconds() / 60;
    const h = (now.getHours() % 12) + m / 60;
    hourHand.style.transform = `rotate(${h * 30}deg)`;
    minuteHand.style.transform = `rotate(${m * 6}deg)`;
    hourHand.style.transformOrigin = minuteHand.style.transformOrigin = '40px 40px';
  };
  tick();
  setInterval(tick, 20_000);

  // the librarian blinks now and then
  (function blink() {
    librarian.classList.add('blink');
    setTimeout(() => librarian.classList.remove('blink'), 260);
    setTimeout(blink, 2500 + Math.random() * 4500);
  })();

  // -- movement ---------------------------------------------------------------

  const state = { x: 120, target: null, mult: 1, pace: 1, zoom: 'fit', onArrive: null, facing: 1, cam: 0, scale: 1, offY: 0, enabled: true, zone: null, near: null };
  const keys = { left: false, right: false, run: false };
  const touchUI = matchMedia('(pointer: coarse)').matches;
  let frameListeners = [];

  function measure() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    // 'fit' keeps at least 520 world units in view (phones); 'fill' fills the height (vertical video)
    state.scale = state.zoom === 'fill' ? vh / WORLD_H : Math.min(vh / WORLD_H, vw / 520);
    state.offY = Math.max(0, (vh - WORLD_H * state.scale) / 2);
    state.visibleW = vw / state.scale;
  }
  measure();
  // The stage can change size (window resize, or the Studio's frames).
  new ResizeObserver(() => {
    measure();
    snapCamera();
  }).observe(viewport);

  function clampCam(c) {
    return Math.max(0, Math.min(width - state.visibleW, c));
  }
  function snapCamera() {
    state.cam = clampCam(state.x - state.visibleW / 2);
  }

  function walkTo(targetX, onArrive, { mult = 1 } = {}) {
    state.target = Math.max(50, Math.min(width - 60, targetX));
    state.onArrive = onArrive ?? null;
    state.mult = mult;
    if (prefersReducedMotion()) {
      state.x = state.target;
      snapCamera();
    }
  }

  function nearSpot() {
    let best = null;
    let bestD = Infinity;
    for (const s of spots) {
      if (state.x < s.x0 - 30 || state.x > s.x1 + 30) continue;
      const d = Math.abs(state.x - s.cx);
      if (d < bestD) {
        best = s;
        bestD = d;
      }
    }
    return best;
  }

  function goInteract(spot) {
    hideHint();
    const standX = spot.id.startsWith('chair:') ? spot.cx - 70 : spot.cx;
    if (Math.abs(state.x - standX) < 40) {
      state.target = null;
      onInteract(spot);
    } else {
      walkTo(standX, () => onInteract(spot));
    }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    let moved = 0;
    if (state.enabled && !overlayOpen()) {
      const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (dir) {
        state.target = null;
        state.onArrive = null;
        moved = dir * SPEED * state.pace * (keys.run ? RUN : 1) * dt;
      } else if (state.target !== null) {
        const dx = state.target - state.x;
        const step = SPEED * state.pace * state.mult * dt;
        if (Math.abs(dx) <= step) {
          moved = dx;
          state.target = null;
          const cb = state.onArrive;
          state.onArrive = null;
          if (cb) setTimeout(cb, 120);
        } else moved = Math.sign(dx) * step;
      }
      state.x = Math.max(50, Math.min(width - 60, state.x + moved));
    }
    if (moved > 0.01) state.facing = 1;
    else if (moved < -0.01) state.facing = -1;

    const desired = clampCam(state.x - state.visibleW * 0.5);
    state.cam += (desired - state.cam) * Math.min(1, dt * 5);
    world.style.transform = `translate3d(${(-state.cam * state.scale).toFixed(2)}px, ${state.offY.toFixed(1)}px, 0) scale(${state.scale})`;
    visitor.style.transform = `translate3d(${state.x.toFixed(1)}px, ${VISITOR_BASE - 124}px, 0)`;
    visitor.classList.toggle('walking', Math.abs(moved) > 0.01);
    visitor.classList.toggle('face-left', state.facing < 0);

    const near = nearSpot();
    if (near !== state.near) {
      state.near = near;
      if (near) {
        prompt.innerHTML = '';
        prompt.append(...(touchUI ? [`Tap · ${near.verb}`] : [el('kbd', {}, 'E'), near.verb]));
        prompt.style.left = `${near.cx}px`;
        prompt.style.top = `${near.promptY}px`;
      }
      prompt.classList.toggle('show', Boolean(near));
    }
    if (near) {
      // keep the prompt on screen near the edges
      const half = prompt.offsetWidth / 2 + 10;
      const px = Math.max(state.cam + half, Math.min(state.cam + state.visibleW - half, near.cx));
      prompt.style.left = `${px.toFixed(1)}px`;
    }
    const zone = near?.zone ?? 'hall';
    if (zone !== state.zone) {
      state.zone = zone;
      onZone?.(zone);
    }
    for (const fn of frameListeners) fn(state);
    requestAnimationFrame(frame);
  }
  snapCamera();
  requestAnimationFrame(frame);

  // -- input ------------------------------------------------------------------

  const typing = (e) => e.target.closest?.('input, textarea, [contenteditable]');
  addEventListener('keydown', (e) => {
    if (overlayOpen() || typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') {
      keys.left = true;
      hideHint();
      e.preventDefault();
    } else if (k === 'arrowright' || k === 'd') {
      keys.right = true;
      hideHint();
      e.preventDefault();
    } else if (k === 'shift') keys.run = true;
    else if ((k === 'e' || k === 'enter' || k === ' ') && !e.target.closest?.('button, a')) {
      if (state.near) {
        e.preventDefault();
        goInteract(state.near);
      }
    }
  });
  addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') keys.left = false;
    else if (k === 'arrowright' || k === 'd') keys.right = false;
    else if (k === 'shift') keys.run = false;
  });
  addEventListener('blur', () => {
    keys.left = keys.right = keys.run = false;
  });

  viewport.addEventListener('pointerdown', (e) => {
    if (overlayOpen() || e.target.closest('.hotspot')) return;
    hideHint();
    const rect = viewport.getBoundingClientRect();
    const worldX = (e.clientX - rect.left) / state.scale + state.cam;
    walkTo(worldX);
  });

  // -- hint -------------------------------------------------------------------

  const hint = document.getElementById('hint');
  hint.textContent = touchUI
    ? 'Tap the floor to walk · tap a shelf, the desk or the cat to look closer'
    : 'Walk with ← → (hold Shift to hurry) · press E to look closer · or click where you want to go';
  let hintTimer = setTimeout(hideHint, 14_000);
  function hideHint() {
    clearTimeout(hintTimer);
    hint.classList.add('gone');
  }

  // -- other visitors ---------------------------------------------------------

  function zoneSlots(zone) {
    if (zone === 'entrance') return [{ x: 150 }, { x: 225 }, { x: 95 }];
    if (zone === 'window') return [{ x: 410 }, { x: 330 }, { x: 560 }];
    if (zone === 'desk') return [{ x: 735 }, { x: 900 }, { x: 680 }];
    if (zone === 'reading') return chairs.map((c) => ({ x: c.seatX + 2, seated: true })).concat(chairs.map((c) => ({ x: c.seatX - 105 })));
    if (zone === 'hall') return [1200, 2350, 3300, 4250, 1880, 2800, 3750].map((hx) => ({ x: hx }));
    if (zone.startsWith('shelf:')) {
      const s = spots.find((sp) => sp.zone === zone);
      return s ? [{ x: s.cx - 40 }, { x: s.cx + 45, flip: true }, { x: s.cx + 5 }] : [];
    }
    return [];
  }

  function setPresence(snapshot, ownZone) {
    const zones = { ...(snapshot?.zones ?? {}) };
    if (ownZone && zones[ownZone]) zones[ownZone] -= 1;
    const wanted = new Set();
    let writers = 0;
    for (const [zone, count] of Object.entries(zones)) {
      if (zone.startsWith('writing')) {
        writers += count;
        continue;
      }
      const slots = zoneSlots(zone);
      for (let i = 0; i < Math.min(count, slots.length); i++) {
        const key = `${zone}#${i}`;
        wanted.add(key);
        if (!ghosts.has(key)) {
          const slot = slots[i];
          const g = el('div', { class: `ghost${slot.seated ? ' seated' : ''}${slot.flip ? ' flip' : ''}`, html: art.ghostSVG(slot.seated) });
          const base = slot.seated ? 500 : 562;
          g.style.left = `${slot.x}px`;
          g.style.top = `${base - (slot.seated ? 82 : 108)}px`;
          g.style.animationDelay = `${-Math.random() * 6}s`;
          if (slot.seated) g.style.zIndex = 3;
          world.append(g);
          requestAnimationFrame(() => requestAnimationFrame(() => g.classList.add('show')));
          ghosts.set(key, g);
        }
      }
    }
    for (const [key, g] of ghosts) {
      if (!wanted.has(key)) {
        g.classList.remove('show');
        ghosts.delete(key);
        setTimeout(() => g.remove(), 1500);
      }
    }
    writingDoor.classList.toggle('lit', writers > 0);
    doorSign.replaceChildren(
      ...(writers > 0
        ? [writers === 1 ? 'Someone is writing.' : `${writers} people are writing.`, el('br'), 'Quiet, please.']
        : ['Quiet, please.', el('br'), 'Stories in progress.']),
    );
  }

  // -- public -----------------------------------------------------------------

  function updateShelves(shelves) {
    for (const s of shelves) {
      const node = shelfEls.get(s.id);
      const genre = genres.find((g) => g.id === s.id);
      if (node && genre) node.innerHTML = art.bookcaseSVG(genre, s.books);
    }
  }

  function spot(id) {
    return spots.find((s) => s.id === id);
  }

  function travelTo(id, { interact = true } = {}) {
    const s = spot(id);
    if (!s) return;
    const standX = s.id.startsWith('chair:') ? s.cx - 70 : s.cx;
    walkTo(standX, interact ? () => onInteract(s) : null, { mult: TRAVEL });
  }

  /** Walk to the nearest armchair, then call back. */
  function sitDown(then) {
    let best = chairs[0];
    for (const c of chairs) if (Math.abs(c.cx - state.x) < Math.abs(best.cx - state.x)) best = c;
    const far = Math.abs(best.cx - 70 - state.x) > 1400;
    walkTo(best.cx - 70, then, { mult: far ? TRAVEL : 1.6 });
  }

  return {
    cat,
    librarian,
    catX: 500,
    walkTo,
    travelTo,
    sitDown,
    spot,
    spots,
    setPresence,
    updateShelves,
    get zone() {
      return state.zone;
    },
    get x() {
      return state.x;
    },
    get width() {
      return width;
    },
    get walking() {
      return state.target !== null;
    },
    onFrame(fn) {
      frameListeners.push(fn);
    },
    hideHint,
    // for the Studio in the local edition
    teleport(x) {
      state.x = Math.max(50, Math.min(width - 60, x));
      state.target = null;
      state.onArrive = null;
      snapCamera();
    },
    stop() {
      state.target = null;
      state.onArrive = null;
    },
    setPace(p) {
      state.pace = p;
    },
    setZoom(z) {
      state.zoom = z;
      measure();
      snapCamera();
    },
    setVisitorVisible(on) {
      visitor.style.visibility = on ? '' : 'hidden';
    },
  };
}
