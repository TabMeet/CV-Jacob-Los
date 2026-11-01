// The Studio: tools for filming the library for social media.
// Only part of the local edition. It sits outside the "stage", so in a framed
// shot (9:16, 4:5, 1:1, 16:9) it never appears in the recording.

import { el, toast, closeAllLayers } from '../ui.js';
import { local, resetReader } from '../api.js';

const FRAMES = [
  ['fill', 'Whole window', null],
  ['9:16', '9:16 · Reels, TikTok, Shorts', 9 / 16],
  ['4:5', '4:5 · Instagram post', 4 / 5],
  ['1:1', '1:1 · Square', 1],
  ['16:9', '16:9 · YouTube', 16 / 9],
];
const TIMES = [['auto', 'Real time'], ['day', 'Day'], ['dusk', 'Dusk'], ['night', 'Night'], ['dawn', 'Dawn']];
// Where staged visitors appear, in order, as the slider goes up.
const DEMO_SPOTS = ['reading', 'shelf:poetry', 'writing:2', 'shelf:life', 'desk', 'reading', 'shelf:fantasy', 'writing:3', 'shelf:romance', 'reading'];
const NOTICES = [
  'Someone just finished a story and sat quietly for a moment.',
  'Someone left the porch light on in their story. Ink approves.',
  'Two strangers are reading the same book in different armchairs.',
];
const DEFAULTS = { frame: 'fill', zoom: 'fit', clean: false, showVisitor: true, time: 'auto', rain: true, pace: 1, demo: 0 };

export function createStudio({ backend, lib }) {
  const { hall, cat, config } = lib;
  const stage = document.getElementById('stage');
  const settings = { ...DEFAULTS, ...local.get('ql.studio', {}) };
  const save = () => local.set('ql.studio', settings);
  let open = false;
  let tour = null;
  let recorder = null;

  // -- frame ----------------------------------------------------------------

  const frameLabel = el('div', { class: 'frame-label', 'aria-hidden': 'true' });
  document.body.append(frameLabel);

  function layout() {
    const ratio = FRAMES.find(([id]) => id === settings.frame)?.[2] ?? null;
    document.body.classList.toggle('framed', Boolean(ratio));
    if (!ratio) {
      stage.removeAttribute('style');
      frameLabel.hidden = true;
      return;
    }
    const panel = open ? 340 : 0;
    const availW = innerWidth - panel - 40;
    const availH = innerHeight - 64;
    let w = availW;
    let h = w / ratio;
    if (h > availH) {
      h = availH;
      w = h * ratio;
    }
    w = Math.floor(w);
    h = Math.floor(h);
    const left = Math.floor((innerWidth - panel - w) / 2);
    const top = Math.floor((innerHeight - h) / 2 + 14);
    Object.assign(stage.style, { inset: 'auto', left: `${left}px`, top: `${top}px`, width: `${w}px`, height: `${h}px` });
    frameLabel.hidden = false;
    frameLabel.style.left = `${left}px`;
    frameLabel.style.top = `${top - 26}px`;
    const px = Math.round(w * devicePixelRatio);
    const py = Math.round(h * devicePixelRatio);
    frameLabel.textContent = `${settings.frame} frame · records at about ${px}×${py}`;
  }
  addEventListener('resize', layout);

  function apply() {
    layout();
    hall.setZoom(settings.zoom);
    document.body.classList.toggle('clean-shot', settings.clean);
    hall.setVisitorVisible(settings.showVisitor);
    lib.setTimeOfDay(settings.time === 'auto' ? null : settings.time);
    lib.setRain(settings.rain);
    hall.setPace(settings.pace);
    const zones = {};
    for (const z of DEMO_SPOTS.slice(0, settings.demo)) zones[z] = (zones[z] ?? 0) + 1;
    backend.setDemoVisitors(zones);
    save();
    render();
  }

  // -- tour -----------------------------------------------------------------

  const TOUR = [
    { at: 60 },
    { go: 'door', hold: 1600 },
    { go: 'cat', hold: 2800, then: () => cat.greet() },
    { go: 'desk', hold: 2600 },
    { go: 'shelf:life', hold: 900 },
    { go: 'shelf:letters', hold: 700 },
    { go: 'shelf:poetry', hold: 900 },
    { go: 'chair:0', hold: 2400 },
    { go: 'shelf:literary', hold: 700 },
    { go: 'shelf:romance', hold: 700 },
    { go: 'chair:1', hold: 1800 },
    { go: 'shelf:fantasy', hold: 900 },
    { go: 'chair:3', hold: 1200 },
    { go: 'writing', hold: 2600 },
  ];

  async function playTour() {
    if (tour) return stopTour();
    closeAllLayers();
    hall.hideHint();
    const token = { stopped: false };
    tour = token;
    render();
    const cancel = () => stopTour();
    // Any key or tap of your own ends the tour, so you can take over.
    setTimeout(() => {
      if (tour === token) {
        addEventListener('keydown', cancel, { once: true });
        stage.addEventListener('pointerdown', cancel, { once: true });
      }
    }, 50);
    const walk = (x) => new Promise((resolve) => hall.walkTo(x, resolve));
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const step of TOUR) {
      if (token.stopped) break;
      if (step.at !== undefined) {
        hall.teleport(step.at);
        await wait(900);
        continue;
      }
      const spot = hall.spot(step.go);
      if (!spot) continue;
      const x = step.go.startsWith('chair:') ? spot.cx - 70 : spot.cx;
      await Promise.race([walk(x), new Promise((r) => { token.wake = r; })]);
      if (token.stopped) break;
      step.then?.();
      await wait(step.hold);
    }
    removeEventListener('keydown', cancel);
    stage.removeEventListener('pointerdown', cancel);
    if (tour === token) tour = null;
    render();
  }

  function stopTour() {
    if (!tour) return;
    tour.stopped = true;
    tour.wake?.();
    tour = null;
    hall.stop();
    render();
  }

  // -- recording the frame ----------------------------------------------------

  const canRecord = Boolean(navigator.mediaDevices?.getDisplayMedia && window.MediaRecorder);

  async function toggleRecording() {
    if (recorder) {
      recorder.stop();
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 60 },
        audio: true,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
      });
    } catch (err) {
      toast(err?.name === 'NotAllowedError'
        ? 'Recording was cancelled.'
        : 'This browser couldn’t start recording. Use your computer’s screen recorder instead (tips in the Studio).', { ms: 8000 });
      return;
    }
    const [track] = stream.getVideoTracks();
    // Chrome can crop a tab recording to one element: exactly the frame.
    if (settings.frame !== 'fill' && 'CropTarget' in window && track.cropTo) {
      try {
        await track.cropTo(await window.CropTarget.fromElement(stage));
      } catch {
        /* falls back to the whole tab */
      }
    }
    const type = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'].find((t) => MediaRecorder.isTypeSupported(t));
    const chunks = [];
    recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 16_000_000 });
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.onstop = () => {
      for (const t of stream.getTracks()) t.stop();
      const ext = type.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: type.split(';')[0] });
      const a = el('a', { href: URL.createObjectURL(blob), download: `quiet-library-${settings.frame.replace(':', 'x')}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.${ext}` });
      document.body.append(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 2000);
      recorder = null;
      document.body.classList.remove('recording');
      toast(ext === 'webm' ? 'Saved as .webm. Most editors (CapCut, Premiere, DaVinci) open it; for Instagram, convert to .mp4 first.' : 'Saved your clip to Downloads.');
      render();
    };
    track.addEventListener('ended', () => recorder?.state === 'recording' && recorder.stop());
    recorder.start(250);
    document.body.classList.add('recording');
    if (settings.frame === 'fill') setOpen(false);
    render();
  }

  // -- the panel --------------------------------------------------------------

  const panel = el('aside', { class: 'studio', 'aria-label': 'Studio', hidden: true });
  const toggle = el('button', { class: 'studio-toggle', type: 'button', 'aria-expanded': 'false', onclick: () => setOpen(!open) },
    el('span', { class: 'rec-dot', 'aria-hidden': 'true' }), 'Studio');
  document.body.append(panel, toggle);

  function setOpen(v) {
    open = v;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    layout();
    if (open) render();
  }

  const seg = (options, current, onPick) =>
    el('div', { class: 'seg', role: 'group' }, options.map(([id, label]) =>
      el('button', { type: 'button', 'aria-pressed': String(current === id), onclick: () => onPick(id) }, label)));

  const section = (title, ...children) => el('details', { open: true }, el('summary', {}, title), el('div', { class: 'sec' }, ...children));

  const check = (label, key, hint) =>
    el('label', { class: 'check' },
      el('input', { type: 'checkbox', checked: settings[key], onchange: (e) => { settings[key] = e.target.checked; apply(); } }),
      el('span', {}, label, hint ? el('small', {}, hint) : null));

  const slider = (label, key, { min, max, step, fmt }) => {
    const out = el('output', {}, fmt(settings[key]));
    return el('label', { class: 'slider' }, el('span', {}, label, out),
      el('input', { type: 'range', min, max, step, value: settings[key], oninput: (e) => { settings[key] = Number(e.target.value); out.textContent = fmt(settings[key]); apply(); } }));
  };

  let wrenDraft = '';
  let inkDraft = '';

  function render() {
    toggle.classList.toggle('is-recording', Boolean(recorder));
    toggle.lastChild.textContent = recorder ? 'Recording · stop' : 'Studio';
    if (!open) return;
    const counts = backend.counts();
    const scrollTop = panel.scrollTop;
    panel.replaceChildren(
      el('div', { class: 'studio-head' },
        el('div', {}, el('strong', {}, 'Studio'), el('small', {}, 'For filming. Only in this local edition.')),
        el('button', { class: 'x', type: 'button', 'aria-label': 'Close the Studio', onclick: () => setOpen(false) }, '×')),

      section('Shot',
        el('p', { class: 'label' }, 'Frame'),
        el('div', { class: 'stack' }, FRAMES.map(([id, label]) =>
          el('button', { type: 'button', class: 'frame-btn', 'aria-pressed': String(settings.frame === id), onclick: () => { settings.frame = id; settings.zoom = id === '9:16' || id === '4:5' ? 'fill' : 'fit'; apply(); } }, label))),
        el('p', { class: 'label' }, 'Camera'),
        seg([['fit', 'Wide'], ['fill', 'Tall (fills the frame)']], settings.zoom, (z) => { settings.zoom = z; apply(); }),
        check('Clean shot', 'clean', 'Hides buttons, hints and prompts. Key: H'),
        check('Show your visitor', 'showVisitor', 'Turn off for empty-room shots'),
      ),

      section('Mood',
        el('p', { class: 'label' }, 'Time of day'),
        seg(TIMES, settings.time, (t) => { settings.time = t; apply(); }),
        check('Rain on the windows', 'rain'),
        slider('Walking pace', 'pace', { min: 0.4, max: 1.6, step: 0.1, fmt: (v) => `${v.toFixed(1)}×` }),
        slider('Staged visitors', 'demo', { min: 0, max: DEMO_SPOTS.length, step: 1, fmt: (v) => (v ? `${v}` : 'none') }),
        el('p', { class: 'note' }, 'Staged visitors are silhouettes for showing what it looks like when others are here. They’re not real readers, so it’s worth saying so in your caption.'),
      ),

      section('Action',
        el('button', { class: 'big', type: 'button', onclick: playTour }, tour ? 'Stop the tour' : 'Play the tour'),
        el('p', { class: 'note' }, 'A slow walk from the street door to the writing rooms, about a minute. Key: T. Press any key to take over.'),
        el('p', { class: 'label' }, `${config.librarian}’s next answer`),
        el('textarea', { rows: 3, placeholder: 'Type what she should say next, then ask her anything at the desk.', oninput: (e) => { wrenDraft = e.target.value; } }, wrenDraft),
        el('div', { class: 'row' },
          el('button', { type: 'button', onclick: () => { backend.setNextReply(wrenDraft.trim()); toast(wrenDraft.trim() ? `${config.librarian} will say that next.` : 'Cleared.'); } }, 'Use for her next answer'),
        ),
        el('p', { class: 'label' }, `Make ${config.cat} notice something`),
        el('input', { type: 'text', placeholder: 'Someone just…', value: inkDraft, oninput: (e) => { inkDraft = e.target.value; } }),
        el('div', { class: 'row' },
          el('button', { type: 'button', onclick: () => inkDraft.trim() && backend.notice(inkDraft.trim()) }, 'Notice it'),
          ...NOTICES.map((n, i) => el('button', { type: 'button', class: 'chip', title: n, onclick: () => backend.notice(n) }, `Idea ${i + 1}`))),
        el('p', { class: 'note' }, `Stand near the window to see it in ${config.cat}’s speech bubble; elsewhere it appears as a note in the corner.`),
      ),

      section('Record',
        canRecord
          ? el('button', { class: 'big rec', type: 'button', onclick: toggleRecording }, recorder ? 'Stop and save' : 'Record the frame')
          : el('p', { class: 'note' }, 'This browser can’t record itself. Use your computer’s screen recorder instead.'),
        el('p', { class: 'note' }, canRecord
          ? 'Chrome or Edge: choose “This tab”. With a frame chosen, only the frame is recorded, with the rain sound. Key: R.'
          : ''),
        el('p', { class: 'note' }, 'Or use your own screen recorder: Mac ⇧⌘5, Windows Win+Shift+R (Snipping Tool) or Win+Alt+R (Game Bar). On a phone, use its built-in screen recording.'),
      ),

      section('Library',
        el('p', { class: 'note' }, `${counts.books} books on the shelves, ${counts.yours} written here. Everything is saved in this browser only.`),
        el('div', { class: 'row' },
          el('button', { type: 'button', onclick: exportBooks }, 'Export books'),
          el('label', { class: 'file' }, 'Import books', el('input', { type: 'file', accept: 'application/json,.json', onchange: importBooks })),
        ),
        el('div', { class: 'row' },
          el('button', { type: 'button', onclick: newVisitor }, 'Next visitor'),
          el('button', { type: 'button', onclick: () => confirm('Put back the 12 starter stories and remove everything else?') && (backend.resetToStarter(), location.reload()) }, 'Reset'),
          el('button', { type: 'button', onclick: () => confirm('Take every book off the shelves?') && (backend.emptyShelves(), location.reload()) }, 'Empty shelves'),
        ),
        el('p', { class: 'note' }, '“Next visitor” is for handing the laptop to someone else: they count as a new reader and get their own drafts. Export saves the books as a file you can later put on the hosted library (npm run seed -- --from file.json).'),
      ),
      el('p', { class: 'note keys' }, 'Keys: S studio · H clean shot · T tour · R record'),
    );
    panel.scrollTop = scrollTop;
  }

  function exportBooks() {
    const blob = new Blob([JSON.stringify(backend.exportBooks(), null, 2)], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: `quiet-library-books-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }

  async function importBooks(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const added = backend.importBooks(JSON.parse(await file.text()));
      toast(`Added ${added} book${added === 1 ? '' : 's'} to the shelves.`);
      lib.refresh();
      render();
    } catch (err) {
      toast(err.message);
    }
  }

  function newVisitor() {
    resetReader();
    for (const key of ['ql.yours', 'ql.visited', 'ql.draft.1', 'ql.draft.2', 'ql.draft.3', 'ql.draft.4']) local.remove(key);
    location.reload();
  }

  // -- keys -------------------------------------------------------------------

  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('input, textarea, select, [contenteditable]')) return;
    const k = e.key.toLowerCase();
    if (k === 's') setOpen(!open);
    else if (k === 'h') { settings.clean = !settings.clean; apply(); }
    else if (k === 't') playTour();
    else if (k === 'r' && canRecord) toggleRecording();
  });

  apply();
  return { setOpen };
}
