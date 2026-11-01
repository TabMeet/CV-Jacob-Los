"""An original lo-fi track for the Quiet Library video, synthesised from scratch.

72 BPM, 11 bars (one bar = 3.333 s, so scene cuts can land on bar lines) plus a
ring-out. Rhodes-style electric piano (FM), soft boom-bap drums with swing, a
round bass, a sparse melody, vinyl crackle, rain and gentle tape wobble.

    python3 lofi.py out.wav [seconds] [preset]

Presets: "cozy" (the first video: Fmaj9-Em7-Dm9-Cmaj9, 11 bars) and
"shelves" (Ebmaj9-Dm7-Cm9-Bbmaj13, 12 bars, builds up as the shelves fill) and
"letter" (Am9-Dm9-G13-Cmaj9, 10 bars, drops to piano for the question, lifts for the call to action).
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 72
BEAT = 60 / BPM
BAR = 4 * BEAT
DURATION = float(sys.argv[2]) if len(sys.argv) > 2 else 38.0
N = int(DURATION * SR)
rng = np.random.default_rng(20261101)


def hz(note):
    """MIDI note number -> frequency."""
    return 440.0 * 2 ** ((note - 69) / 12)


def fft_filter(x, lo=None, hi=None, slope=2.0):
    """Gentle band filter in the frequency domain (fine for whole-buffer use)."""
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    gain = np.ones_like(f)
    if hi:
        gain /= np.sqrt(1 + (f / hi) ** (2 * slope))
    if lo:
        gain /= np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * slope))
    return np.fft.irfft(spec * gain, n=len(x))


def place(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


# --------------------------------------------------------------------------
# Instruments

def rhodes(freq, dur, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    decay = 1.1 + freq / 600
    env = np.exp(-t * decay) * np.minimum(1, t / 0.006)
    index = 1.4 * np.exp(-t * 4) + 0.18
    body = np.sin(2 * np.pi * freq * t + index * np.sin(2 * np.pi * freq * t))
    tine = 0.10 * np.sin(2 * np.pi * freq * 7.02 * t) * np.exp(-t * 14)
    trem = 1 + 0.07 * np.sin(2 * np.pi * 4.2 * t)
    release = np.minimum(1, (dur - t) / 0.25).clip(0, 1)
    return (body * env * trem + tine) * release * vel


def bass(freq, dur, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.minimum(1, t / 0.02) * np.exp(-t * 1.1) * np.minimum(1, (dur - t) / 0.35).clip(0, 1)
    s = np.sin(2 * np.pi * freq * t) + 0.18 * np.sin(4 * np.pi * freq * t) * np.exp(-t * 3)
    return s * env * vel


def pluck(freq, vel=1.0, dur=2.2):
    """Soft felt-piano / kalimba-ish note for the melody."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * 2.4) * np.minimum(1, t / 0.004)
    s = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t) * np.exp(-t * 6) + 0.12 * np.sin(6 * np.pi * freq * t) * np.exp(-t * 9)
    return s * env * vel


def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 46 + 70 * np.exp(-t * 32)
    phase = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(phase) * np.exp(-t * 13)
    click = fft_filter(rng.standard_normal(n), hi=2500) * np.exp(-t * 300) * 0.25
    return np.tanh(1.6 * (body + click))


NOISE = rng.standard_normal(int(0.5 * SR))
SNARE_NOISE = fft_filter(NOISE, lo=900, hi=5500)
HAT_NOISE = fft_filter(NOISE, lo=4200, hi=9500)


def snare():
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    noise = SNARE_NOISE[:n] / np.abs(SNARE_NOISE).max() * np.exp(-t * 18)
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 28) * 0.6
    return (noise + tone) * 0.8


def hat(open_=False):
    n = int((0.18 if open_ else 0.06) * SR)
    t = np.arange(n) / SR
    return HAT_NOISE[:n] / np.abs(HAT_NOISE).max() * np.exp(-t * (18 if open_ else 70))


# --------------------------------------------------------------------------
# The song

PRESET = sys.argv[3] if len(sys.argv) > 3 else 'cozy'


def pad(freqs, dur, vel=1.0):
    """A soft, slow-swelling pad: pairs of gently detuned sines."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.minimum(1, t / 1.4) * np.minimum(1, (dur - t) / 0.8).clip(0, 1)
    s = sum(np.sin(2 * np.pi * f * t) + np.sin(2 * np.pi * f * 1.004 * t + 1.3) for f in freqs)
    return s * env * vel / len(freqs)


if PRESET == 'shelves':
    # Ebmaj9 - Dm7(11) - Cm9 - Bbmaj13, and an arrangement that grows like the shelves.
    CHORDS = [
        (39, [55, 58, 62, 65]),
        (38, [53, 57, 60, 67]),
        (36, [51, 55, 58, 62]),
        (34, [57, 62, 65, 67]),
    ]
    BARS = 12
    MELODY = [
        (2, 1.0, 77), (2, 2.5, 74), (3, 0.5, 72), (3, 2.0, 70),
        (4, 0.5, 74), (4, 1.5, 77), (4, 2.5, 79), (5, 1.0, 77), (5, 2.0, 74), (5, 3.0, 72),
        (6, 0.0, 82), (6, 1.5, 79), (6, 3.0, 77),
        (7, 0.5, 74), (7, 1.0, 77), (7, 2.0, 79), (7, 3.5, 82), (8, 0.75, 84), (8, 2.0, 82), (8, 3.0, 79),
        (9, 0.5, 77), (9, 1.5, 79), (9, 2.5, 82), (9, 3.25, 84), (10, 1.0, 86), (10, 2.5, 82), (10, 3.5, 79),
        (11, 0.0, 77), (11, 1.5, 74), (11, 3.0, 70),
    ]

    def parts(bar):
        return dict(
            bass=2 <= bar <= 5 or bar >= 7,
            drums='sparse' if bar in (4, 5) else 'full' if 7 <= bar <= 10 else None,
            restrum=bar in (8, 9, 10),
            pad=bar >= 7,
            shaker=bar in (9, 10),
        )
elif PRESET == 'letter':
    # Am9 - Dm9 - G13 - Cmaj9: a warm ii-V-I that feels like a letter being written.
    # Piano alone for the typing, a lift as the book is shelved, a hush for the question,
    # then everything back for the call to action.
    CHORDS = [
        (45, [60, 64, 67, 71]),
        (38, [53, 57, 60, 64]),
        (43, [53, 59, 64, 69]),
        (36, [52, 55, 59, 62]),
    ]
    BARS = 10
    MELODY = [
        (4, 1.0, 76), (4, 2.5, 79),
        (5, 0.5, 81), (5, 1.5, 79), (5, 2.5, 76), (5, 3.25, 74),
        (6, 0.0, 72), (6, 1.0, 74), (6, 2.0, 76), (6, 3.0, 79),
        (7, 0.5, 81), (7, 1.5, 84), (7, 2.5, 81), (7, 3.5, 79),
        (8, 0.5, 76), (8, 1.5, 79), (8, 2.5, 74), (8, 3.25, 72),
        (9, 0.0, 76), (9, 1.5, 72),
    ]

    def parts(bar):
        return dict(
            bass=2 <= bar <= 5 or bar >= 7,
            drums='sparse' if bar in (2, 3) else 'full' if bar in (4, 5, 7, 8) else None,
            restrum=bar in (7, 8),
            pad=bar >= 6,
            shaker=bar in (7, 8),
        )
else:
    # Fmaj9 - Em7 - Dm9 - Cmaj9 : a slow, warm descent.
    CHORDS = [
        (41, [57, 60, 64, 67]),  # F2 | A3 C4 E4 G4
        (40, [55, 59, 62, 67]),  # E2 | G3 B3 D4 G4
        (38, [53, 57, 60, 64]),  # D2 | F3 A3 C4 E4
        (36, [52, 55, 59, 62]),  # C2 | E3 G3 B3 D4
    ]
    BARS = 11
    # Melody: (bar, beat offset, midi note) - pentatonic, sparse, answers the chords.
    MELODY = [
        (2, 0.5, 79), (2, 1.5, 76), (2, 2.5, 74), (2, 3.25, 72),
        (3, 1.0, 74), (3, 2.0, 76), (3, 3.0, 69),
        (4, 0.5, 72), (4, 1.0, 74), (4, 2.5, 76), (4, 3.5, 79),
        (5, 0.75, 81), (5, 2.0, 79), (5, 3.0, 76),
        (6, 0.5, 79), (6, 1.5, 76), (6, 2.5, 74), (6, 3.25, 72),
        (7, 1.0, 74), (7, 2.0, 72), (7, 3.0, 69),
        (8, 0.5, 72), (8, 1.5, 76), (8, 2.5, 79), (8, 3.5, 84),
        (9, 1.0, 81), (9, 2.5, 79),
        (10, 0.5, 76), (10, 2.0, 72),
    ]

    def parts(bar):
        return dict(
            bass=bar >= 1,
            drums=None if bar < 1 or bar >= BARS - 1 else 'sparse' if bar >= BARS - 2 else 'full',
            restrum=bar % 2 == 1,
            pad=False,
            shaker=False,
        )

keys = np.zeros(N)
keys_r = np.zeros(N)
low = np.zeros(N)
mel = np.zeros(N)
drums = np.zeros(N)
hats = np.zeros(N)
pads = np.zeros(N)
duck = np.zeros(N)

kick_s, snare_s = kick(), snare()
swing = 0.10 * BEAT  # late off-beat sixteenths

for bar in range(BARS):
    start = bar * BAR
    root, voicing = CHORDS[bar % 4]
    last = bar == BARS - 1
    p = parts(bar)
    # Rhodes: strummed chord on 1, sometimes a softer re-voice on the "and" of 3.
    for k, note in enumerate(voicing):
        jitter = k * 0.018 + rng.uniform(0, 0.008)
        dur = BAR * (1.9 if last else 1.0) + 0.6
        sig = rhodes(hz(note), dur, 0.34 * rng.uniform(0.85, 1.0))
        place(keys, sig, start + jitter)
        place(keys_r, sig, start + jitter + 0.011)  # a little width
        if not last and p['restrum']:
            sig2 = rhodes(hz(note), BEAT * 1.6, 0.13)
            place(keys, sig2, start + 2.5 * BEAT + jitter)
            place(keys_r, sig2, start + 2.5 * BEAT + jitter + 0.011)
    if p['pad']:
        place(pads, pad([hz(n) for n in voicing], BAR * (1.8 if last else 1.0) + 0.9, 0.5), start - 0.3)
    if p['bass'] and not last:
        place(low, bass(hz(root), BEAT * 2.5 + swing + 0.3, 0.30), start)
        place(low, bass(hz(root + (7 if bar % 2 else 12)), BEAT * 1.5 + 0.3, 0.22), start + 2.5 * BEAT + swing)
    if p['bass'] and last:
        place(low, bass(hz(root), BAR * 1.4, 0.26), start)
    if p['drums']:
        sparse = p['drums'] == 'sparse'
        for step in range(16):
            t = start + step * BEAT / 4 + (swing if step % 2 else 0)
            if step in (0, 7, 10) and not (sparse and step != 0):
                place(drums, kick_s, t, 0.55 if step == 0 else 0.38)
                place(duck, np.exp(-np.arange(int(0.5 * SR)) / SR * 7), t)
            if step in (4, 12):
                place(drums, snare_s, t + 0.012, 0.30 if sparse else 0.42)
            if step % 2 == 0:
                place(hats, hat(), t, 0.16 if step % 4 == 0 else 0.10)
            elif not sparse and rng.random() < 0.25:
                place(hats, hat(), t, 0.05)
            if p['shaker'] and step % 2:
                place(hats, hat(), t, 0.07)
        if bar % 4 == 3 and not sparse:
            place(hats, hat(True), start + 3.5 * BEAT + swing, 0.08)

for bar, beat, note in MELODY:
    if bar < BARS:
        place(mel, pluck(hz(note), 0.22 * rng.uniform(0.85, 1.0)), bar * BAR + beat * BEAT + rng.uniform(0, 0.012))

rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x[int(4 * SR):int(30 * SR)] ** 2)) + 1e-9)
print('stem levels (dB RMS):', ', '.join(f'{k} {rms(v):.1f}' for k, v in dict(keys=keys, bass=low, melody=mel, drums=drums, hats=hats).items()))

# Gentle sidechain pump and mixing.
gain = 1 - 0.22 * np.clip(duck, 0, 1)
music_l = (keys * gain + low * gain + mel * 1.05 + drums + hats * 7.0 + pads * 0.16 * gain)
music_r = (keys_r * gain + low * gain + mel * 0.85 + drums + hats * 8.5 + pads * 0.16 * gain)

# Tape: wobble (wow and flutter), a soft top end and warm saturation.
t = np.arange(N) / SR
warp = t + 0.0016 * np.sin(2 * np.pi * 0.55 * t) / (2 * np.pi * 0.55) + 0.0003 * np.sin(2 * np.pi * 6.0 * t) / (2 * np.pi * 6.0)
music_l = np.interp(warp * SR, np.arange(N), music_l)
music_r = np.interp(warp * SR, np.arange(N), music_r)
music_l = np.tanh(1.15 * fft_filter(music_l, lo=35, hi=8500))
music_r = np.tanh(1.15 * fft_filter(music_r, lo=35, hi=8500))

# Vinyl crackle and hiss.
crackle = np.zeros(N)
for at in np.cumsum(rng.exponential(1 / 9, int(DURATION * 12))):
    if at < DURATION:
        n = int(rng.uniform(0.0008, 0.003) * SR)
        place(crackle, rng.standard_normal(n) * np.exp(-np.arange(n) / n * 4), at, rng.uniform(0.02, 0.12))
crackle = fft_filter(crackle, lo=900, hi=9000)
hiss = fft_filter(rng.standard_normal(N), lo=2000, hi=9000) * 0.006

# Rain: two independent channels of soft, shifting noise.
def rain_channel():
    r = fft_filter(rng.standard_normal(N), lo=250, hi=2600)
    swell = 0.8 + 0.2 * np.sin(2 * np.pi * 0.07 * t + rng.uniform(0, 6))
    return r / np.abs(r).max() * swell

rain_level = np.interp(t, [0, 3.0, 3.6, DURATION - 3, DURATION], [0.20, 0.20, 0.10, 0.10, 0.16])
left = music_l * 0.55 + crackle + hiss + rain_channel() * rain_level
right = music_r * 0.55 + crackle + hiss + rain_channel() * rain_level

# Fade in the first moment, ring out at the end.
fade = np.interp(t, [0, 0.15, DURATION - 2.2, DURATION], [0, 1, 1, 0])
stereo = np.stack([left * fade, right * fade], axis=1)
stereo /= np.abs(stereo).max() / 0.89

with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype('<i2').tobytes())
print(f'wrote {sys.argv[1]}: {DURATION:.1f}s, {BARS} bars at {BPM} BPM')
