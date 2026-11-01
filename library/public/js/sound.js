// Soft rain on the windows and a purring cat, synthesised with Web Audio
// (no sound files needed). Off until the visitor turns it on.

let ctx = null;
let master = null;
let rainGain = null;
let dropTimer = null;
let on = false;

function noiseBuffer(seconds = 2, brown = false) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else data[i] = white;
  }
  return buf;
}

function start() {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  master.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);

  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(3);
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1400;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 350;
  rainGain = ctx.createGain();
  rainGain.gain.value = 0.07;
  src.connect(lp).connect(hp).connect(rainGain).connect(master);
  src.start();

  const drops = noiseBuffer(0.05);
  dropTimer = setInterval(() => {
    if (Math.random() < 0.55) return;
    const d = ctx.createBufferSource();
    d.buffer = drops;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1800 + Math.random() * 3200;
    bp.Q.value = 6;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.05 + Math.random() * 0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    d.connect(bp).connect(g).connect(master);
    d.start(t);
  }, 90);
}

function stop() {
  clearInterval(dropTimer);
  if (master) {
    const m = master;
    m.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    setTimeout(() => m.disconnect(), 900);
  }
  master = null;
}

export function setSound(enabled) {
  if (enabled === on) return;
  on = enabled;
  try {
    if (on) start();
    else stop();
  } catch {
    on = false;
  }
}

export function soundOn() {
  return on;
}

export function purr() {
  if (!on || !ctx || !master) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(2.2, true);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 180;
  const amp = ctx.createGain();
  amp.gain.value = 0;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 24;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.5;
  lfo.connect(lfoGain).connect(amp.gain);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.9, t + 0.3);
  env.gain.linearRampToValueAtTime(0.9, t + 1.6);
  env.gain.linearRampToValueAtTime(0, t + 2.1);
  src.connect(lp).connect(amp).connect(env).connect(master);
  lfo.start(t);
  src.start(t);
  lfo.stop(t + 2.2);
  src.stop(t + 2.2);
}
