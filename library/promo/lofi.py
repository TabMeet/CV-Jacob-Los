"""An original lo-fi track for the Quiet Library video, synthesised from scratch.

72 BPM, 11 bars (one bar = 3.333 s, so scene cuts can land on bar lines) plus a
ring-out. Rhodes-style electric piano (FM), soft boom-bap drums with swing, a
round bass, a sparse melody, vinyl crackle, rain and gentle tape wobble.

    python3 lofi.py out.wav [seconds] [preset]

Presets: "cozy" (the first video: Fmaj9-Em7-Dm9-Cmaj9, 11 bars) and
"shelves" (Ebmaj9-Dm7-Cm9-Bbmaj13, 12 bars, builds up as the shelves fill) and
"letter" (Am9-Dm9-G13-Cmaj9, 10 bars, drops to piano for the question, lifts for the call to action) and
"rules" (88 BPM, Fmaj9-G13-Em9-Am9, 11 bars, whooshes, a riser, a tape-stop and a drop for a fast edit) and
"making" (88 BPM, Dmaj9-Bm9-Gmaj9-A13sus, 11 bars, the same sound design plus pencil scribbles and typing) and
"rooms" (88 BPM, Bbmaj9-Gm9-Ebmaj9-F13sus, ~4 bars for a 12-second loop: two knocks on frame 0, the beat drops
on the first cut, typing in the room, and an ending that runs straight back into the knocks) and
"friends" (88 BPM, Fmaj9-Dm9-Bbmaj9-C13sus, ~5 bars for a 14-second video: the beat starts on frame 0 and
every book that lands on a shelf plays a note, climbing the scale) and
"printed" (88 BPM, the same chords, 15 s: a press stamping 28 books, slow then fast like a machine,
the books landing on a shelf as a run of notes, and a riser that loops back into the first stamp) and
"day1" (88 BPM, Cmaj9-G9-Am9-Fmaj9, 14 s: hopeful, a sparkle on frame 0 and a chime as the first book lands) and
"ink" (88 BPM, Fmaj9-Em7-Dm9-Cmaj9, 13 s: playful, a "ding" per job on Ink's list, eye-dart ticks and a slow-blink chime).
"""
import sys
import wave

import numpy as np

SR = 44100
PRESET = sys.argv[3] if len(sys.argv) > 3 else 'cozy'
BPM = 88 if PRESET in ('rules', 'making', 'rooms', 'friends', 'printed', 'day1', 'ink') else 72
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
elif PRESET == 'making':
    # 88 BPM, Dmaj9 - Bm9 - Gmaj9 - A13sus: bright and hopeful, for a making-of montage.
    # Piano alone on the blank page, the band for the build, a tape-stop before the reveal.
    CHORDS = [
        (38, [54, 57, 61, 64]),
        (35, [50, 54, 57, 61]),
        (43, [59, 62, 66, 69]),
        (45, [55, 59, 62, 66]),
    ]
    BARS = 11
    MELODY = [
        (2, 0.5, 78), (2, 1.5, 81), (2, 2.5, 83), (3, 0.5, 81), (3, 2.0, 78),
        (4, 0.5, 74), (4, 1.5, 76), (4, 2.5, 78), (5, 0.5, 81), (5, 2.0, 76),
        (6, 0.5, 83), (6, 1.5, 86), (6, 2.5, 83), (6, 3.25, 81),
        (8, 0.0, 86), (8, 1.0, 83), (8, 2.0, 81), (8, 3.0, 78),
        (9, 0.5, 81), (9, 1.5, 83), (9, 2.5, 78), (10, 0.0, 74),
    ]

    def parts(bar):
        return dict(
            bass=1 <= bar <= 6 or bar >= 8,
            drums='sparse' if bar == 1 else 'full' if 2 <= bar <= 6 or bar in (8, 9) else 'hats' if bar == 7 else None,
            restrum=bar in (4, 6, 8, 9),
            pad=bar in (5, 6, 8, 9, 10),
            shaker=bar in (6, 8, 9),
        )
elif PRESET == 'rules':
    # 88 BPM, Fmaj9 - G13 - Em9 - Am9: brighter and bouncier for a fast, beat-cut edit.
    # Bar 7 thins to hats with a riser and tape-stops into a silent beat; bar 8 drops.
    CHORDS = [
        (41, [57, 60, 64, 67]),
        (43, [53, 59, 64, 69]),
        (40, [55, 59, 62, 66]),
        (45, [55, 60, 64, 71]),
    ]
    BARS = 11
    MELODY = [
        (1, 0.5, 76), (1, 1.5, 79), (1, 2.5, 81), (2, 0.5, 79), (2, 2.0, 76),
        (3, 0.5, 72), (3, 1.5, 74), (3, 2.5, 76), (4, 0.5, 79), (4, 2.0, 74),
        (5, 0.5, 81), (5, 1.5, 84), (5, 2.5, 81), (6, 0.5, 79), (6, 2.0, 76), (6, 3.0, 74),
        (8, 0.0, 84), (8, 1.0, 81), (8, 2.0, 79), (8, 3.0, 76),
        (9, 0.5, 74), (9, 2.0, 72), (10, 0.0, 77),
    ]

    def parts(bar):
        return dict(
            bass=bar not in (7,),
            drums='full' if bar <= 6 or bar == 8 else 'hats' if bar == 7 else 'sparse' if bar == 9 else None,
            restrum=bar in (2, 4, 6, 8),
            pad=bar in (5, 6, 8, 9, 10),
            shaker=bar in (5, 6, 8),
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
elif PRESET == 'day1':
    # Cmaj9 - G9 - Am9 - Fmaj9: a beginning. The beat is there from frame 0 and steps
    # back for the call to action.
    CHORDS = [
        (36, [52, 55, 59, 62]),
        (43, [53, 57, 59, 62]),
        (45, [55, 59, 60, 64]),
        (41, [57, 60, 64, 67]),
    ]
    BARS = 6
    MELODY = [(0, 2.5, 76), (0, 3.25, 79), (1, 1.5, 81), (1, 2.5, 79), (2, 1.5, 76), (2, 2.5, 74), (3, 1.5, 72), (3, 2.5, 76), (4, 0.5, 79), (4, 2.0, 84)]
    def parts(bar):
        return dict(bass=bar <= 4, drums='full' if bar <= 3 else 'sparse' if bar == 4 else None,
                    restrum=bar in (1, 3), pad=bar >= 3, shaker=bar in (2, 3))
elif PRESET == 'ink':
    # Fmaj9 - Em7 - Dm9 - Cmaj9, bouncier than the first video: a cat's list.
    CHORDS = [
        (41, [57, 60, 64, 67]),
        (40, [55, 59, 62, 67]),
        (38, [53, 57, 60, 64]),
        (36, [52, 55, 59, 62]),
    ]
    BARS = 5
    MELODY = [(0, 1.5, 81), (0, 2.5, 79), (1, 1.5, 76), (1, 3.0, 74), (2, 0.5, 72), (2, 1.5, 74), (3, 2.5, 76), (3, 3.25, 79), (4, 0.5, 77)]
    def parts(bar):
        return dict(bass=bar <= 3, drums='full' if bar <= 3 else 'sparse',
                    restrum=bar in (1, 3), pad=bar >= 3, shaker=bar in (1, 2))
elif PRESET == 'printed':
    # The friends' chords again. Full beat from the first frame; it thins out for the
    # last book (no. 29), which is left unprinted.
    CHORDS = [
        (41, [57, 60, 64, 67]),
        (38, [53, 57, 60, 64]),
        (34, [57, 60, 62, 65]),
        (36, [58, 62, 65, 69]),
    ]
    BARS = 6
    MELODY = [(1, 1.5, 77), (1, 2.5, 76), (2, 1.5, 74), (2, 2.5, 72), (3, 1.5, 72), (3, 2.5, 74), (4, 1.5, 77), (4, 2.5, 79)]
    def parts(bar):
        return dict(
            bass=bar <= 4,
            drums='full' if bar <= 4 else 'sparse',
            restrum=bar in (1, 3),
            pad=bar in (4, 5),
            shaker=bar in (2, 3),
        )
elif PRESET == 'friends':
    # Fmaj9 - Dm9 - Bbmaj9 - C13sus: bright and warm. The beat is there from the first
    # frame (the hook), and drops back for the call to action in bar 4.
    CHORDS = [
        (41, [57, 60, 64, 67]),
        (38, [53, 57, 60, 64]),
        (34, [57, 60, 62, 65]),
        (36, [58, 62, 65, 69]),
    ]
    BARS = 6
    MELODY = [
        (1, 1.5, 77), (1, 2.5, 76), (1, 3.25, 72),
        (2, 1.5, 74), (2, 2.5, 72), (2, 3.25, 69),
        (3, 1.5, 72), (3, 2.5, 74), (3, 3.25, 77),
    ]
    def parts(bar):
        return dict(
            bass=bar <= 4,
            drums='full' if bar <= 3 else 'sparse' if bar == 4 else None,
            restrum=bar in (1, 3),
            pad=bar in (3, 4),
            shaker=bar == 3,
        )
elif PRESET == 'rooms':
    # Bbmaj9 - Gm9 - Ebmaj9 - F13sus, then Bbmaj9 again on the last beat, which is also
    # where the loop starts. Bar 0 is the knock (chord and rain only) until the beat
    # drops on beat 3, the cut into the corridor.
    CHORDS = [
        (34, [57, 60, 62, 65]),
        (43, [53, 57, 58, 62]),
        (39, [55, 58, 62, 65]),
        (41, [55, 58, 62, 63]),
    ]
    BARS = 5
    MELODY = [
        (1, 0.5, 74), (1, 1.5, 77), (1, 2.5, 79), (1, 3.25, 77),
        (2, 0.5, 74), (2, 1.5, 72), (2, 2.5, 70),
        (3, 0.5, 77), (3, 1.5, 79), (3, 2.5, 82), (3, 3.25, 79),
    ]
    def parts(bar):
        return dict(
            bass='half' if bar == 0 else 1 <= bar <= 3,
            drums='full' if bar <= 3 else None,
            from_step=8 if bar == 0 else 0,
            restrum=bar in (1, 3),
            pad=bar in (2, 3),
            shaker=bar == 3,
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
    if p['bass'] == 'half':
        place(low, bass(hz(root), BEAT * 2 + 0.3, 0.30), start + 2 * BEAT)
    elif p['bass'] and not last:
        place(low, bass(hz(root), BEAT * 2.5 + swing + 0.3, 0.30), start)
        place(low, bass(hz(root + (7 if bar % 2 else 12)), BEAT * 1.5 + 0.3, 0.22), start + 2.5 * BEAT + swing)
    if p['bass'] and last:
        place(low, bass(hz(root), BAR * 1.4, 0.26), start)
    if p['drums']:
        sparse = p['drums'] == 'sparse'
        hats_only = p['drums'] == 'hats'
        for step in range(p.get('from_step', 0), 16):
            t = start + step * BEAT / 4 + (swing if step % 2 else 0)
            if hats_only:
                place(hats, hat(), t, 0.06 + 0.10 * step / 15)
                continue
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

if PRESET == 'rooms':  # loud for the knock, under the beat, back up for the loop
    rain_level = np.interp(t, [0, 2 * BEAT, 2 * BEAT + 0.4, DURATION - 2.2, DURATION], [0.22, 0.22, 0.10, 0.10, 0.20])
elif PRESET in ('friends', 'printed', 'day1'):
    rain_level = np.full_like(t, 0.09)
elif PRESET == 'ink':  # the rain is part of the story here: louder while Ink watches it
    rain_level = np.interp(t, [0, 3 * BEAT - 0.2, 3 * BEAT, 7 * BEAT, 7 * BEAT + 0.4, DURATION], [0.10, 0.10, 0.26, 0.26, 0.10, 0.10])
else:
    rain_level = np.interp(t, [0, 3.0, 3.6, DURATION - 3, DURATION], [0.20, 0.20, 0.10, 0.10, 0.16])
left = music_l * 0.55 + crackle + hiss + rain_channel() * rain_level
right = music_r * 0.55 + crackle + hiss + rain_channel() * rain_level

# Sound design helpers for the fast edits.
def one_pole(x, cutoff):
    # time-varying one-pole lowpass; cutoff is an array (Hz) the same length as x
    a = np.broadcast_to(np.exp(-2 * np.pi * np.asarray(cutoff, dtype=float) / SR), x.shape)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y

def whoosh(dur=0.5, level=0.42):
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    w = one_pole(rng.standard_normal(n), 300 + 5200 * np.sin(np.pi * u) ** 2)
    w = w / (np.abs(w).max() + 1e-9) * np.sin(np.pi * u) ** 2 * level
    return w * (1 - u), w * u  # sweeps left to right

def riser(dur, level=0.22):
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    noise = one_pole(rng.standard_normal(n), 250 + 6500 * u ** 2)
    noise /= np.abs(noise).max() + 1e-9
    tone = np.sin(2 * np.pi * np.cumsum(220 + 700 * u ** 2) / SR) * 0.35
    return (noise + tone) * u ** 2.2 * level

def impact(level=0.42):
    n = int(1.0 * SR)
    tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-tt * 18)) / SR) * np.exp(-tt * 4.5)
    crack = one_pole(rng.standard_normal(n), 3000 * np.exp(-tt * 30) + 200) * np.exp(-tt * 25)
    return np.tanh(1.5 * (boom + crack * 0.6)) * level


def click(level):
    n = int(0.012 * SR)
    c = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 600)
    return np.diff(np.concatenate([[0], c])) * level  # thin, clicky


if PRESET in ('rules', 'making'):
    # Sound design for a fast edit: whooshes on cuts and chapter cards, a riser into the
    # reveal, a tape-stop and a silent beat before the punchline, and an impact on the drop.
    b8 = 8 * BAR
    stop_at = b8 - 0.26
    # riser through bar 7, up to the stop
    place(left, riser(stop_at - 7 * BAR), 7 * BAR)
    place(right, riser(stop_at - 7 * BAR), 7 * BAR)
    # tape stop: the playback slows to nothing over 0.45 s, then a silent beat
    i0, i1, i2 = int((stop_at - 0.45) * SR), int(stop_at * SR), int(b8 * SR)
    for ch in (left, right):
        seg = ch[i0:i2].copy()
        u = np.linspace(0, 1, i1 - i0)
        pos = np.cumsum((1 - u) ** 1.6)  # playback position, slowing down
        ch[i0:i1] = np.interp(pos, np.arange(len(seg)), seg) * (1 - u ** 3)
        ch[i1:i2] = 0
    # whooshes: the payoff flash, the hook cut, each chapter card, and the end card
    whooshes = (0.0, BEAT, BAR, 3 * BAR, 5 * BAR, 9 * BAR)
    if PRESET == 'making':
        whooshes = (0.0, BEAT) + tuple(b * BAR for b in (1, 2, 3, 4, 5, 6, 7, 9, 10))


        def scribble(dur):
            n = int(dur * SR)
            u = np.linspace(0, 1, n)
            nz = one_pole(rng.standard_normal(n), 2600) - one_pole(rng.standard_normal(n), 900)
            wiggle = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * (9 + 5 * rng.random()) * u * dur))
            return nz / (np.abs(nz).max() + 1e-9) * wiggle * np.sin(np.pi * u) * 0.09

        # pencil on paper while the ideas are written down (bar 1)
        for k in range(6):
            sc = scribble(0.32)
            place(left, sc, BAR + 0.25 + k * 0.36)
            place(right, sc * 0.8, BAR + 0.25 + k * 0.36)
        # keyboard while the code is typed (bar 5) and the terminal (bar 7)
        for start, end in ((5 * BAR + 0.15, 6 * BAR - 0.2), (7 * BAR + 0.1, 7 * BAR + 0.9)):
            t_k = start
            while t_k < end:
                place(left, click(0.09 * rng.uniform(0.6, 1)), t_k)
                place(right, click(0.08 * rng.uniform(0.6, 1)), t_k + 0.002)
                t_k += rng.uniform(0.055, 0.12) + (0.18 if rng.random() < 0.08 else 0)
    for at in whooshes:
        l_w, r_w = whoosh()
        place(left, l_w, max(0, at - 0.22))
        place(right, r_w, max(0, at - 0.22))
    hit = impact()
    place(left, hit, b8)
    place(right, hit, b8)

if PRESET == 'rooms':
    # Two knocks on the very first frame (the hook), a whoosh on every cut, typing in
    # the room, a soft chime as the book is bound. No fade at either end: the last beat
    # runs straight back into the knocks when TikTok loops the video.
    def knock(level=0.9):
        n = int(0.22 * SR)
        tt = np.arange(n) / SR
        body = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, a, d in ((165, 1.0, 38), (330, 0.55, 55), (610, 0.35, 80), (1150, 0.18, 120)))
        tap = one_pole(rng.standard_normal(n), 2500) * np.exp(-tt * 260) * 2.2
        return np.tanh(1.8 * (body + tap)) * level
    for k, at in enumerate((0.0, 0.19)):
        kn = knock(0.5 if k == 0 else 0.44)
        place(left, kn, at)
        place(right, kn * 0.92, at + 0.003)
    hit = impact(level=0.26)  # the drop, on the cut into the corridor
    place(left, hit, 2 * BEAT)
    place(right, hit, 2 * BEAT)
    for at in (2 * BEAT, BAR, 2.5 * BAR, 3.25 * BAR):
        l_w, r_w = whoosh(level=0.36)
        place(left, l_w, max(0, at - 0.22))
        place(right, r_w, max(0, at - 0.22))
    # keys while the story is typed (from just after the cut into the room)
    t_k, end = BAR + 0.1, 2.5 * BAR - 0.15
    while t_k < end:
        place(left, click(0.085 * rng.uniform(0.6, 1)), t_k)
        place(right, click(0.075 * rng.uniform(0.6, 1)), t_k + 0.002)
        t_k += rng.uniform(0.045, 0.085) + (0.16 if rng.random() < 0.07 else 0)
    # the book is bound: three soft plucks up the Ebmaj9
    for k, note in enumerate((79, 82, 86)):
        place(left, pluck(hz(note), 0.2, 1.6), 2.5 * BAR + 0.25 + k * 0.11)
        place(right, pluck(hz(note), 0.2, 1.6), 2.5 * BAR + 0.26 + k * 0.11)
if PRESET == 'friends':
    # Every book that lands on a shelf is a note: up the F major pentatonic, so a row of
    # books arriving plays a little run. The film script adds the books at the same times.
    SCALE = [72, 74, 77, 79, 81, 84, 86, 89, 91]
    def pop(note, level):
        n = int(0.5 * SR)
        tt = np.arange(n) / SR
        body = pluck(hz(note), 1.0, 0.5)[:n]
        thud = np.sin(2 * np.pi * np.cumsum(220 * np.exp(-tt * 40) + 90) / SR) * np.exp(-tt * 45) * 0.25
        return (body + thud) * level
    def place2(sig, at, pan=0.0):
        place(left, sig * (1 - pan), at)
        place(right, sig * (1 + pan), at + 0.002)
    # the hook: 13 books, one every 0.15 s from the first frame
    for k in range(13):
        place2(pop(SCALE[k % len(SCALE)] + (12 if k >= len(SCALE) else 0), 0.16), 0.02 + k * 0.15, pan=0.3 * ((k % 3) - 1))
    # the shelves filling in the hall: a batch every 0.25 s, softer
    for k in range(7):
        place2(pop(SCALE[(k * 2) % len(SCALE)], 0.11), 6 * BEAT + 0.12 + k * 0.25, pan=-0.2)
    # whooshes on the cuts
    for at in (3 * BEAT, 6 * BEAT, 9 * BEAT, 13 * BEAT, 16 * BEAT):
        l_w, r_w = whoosh(level=0.3)
        place(left, l_w, max(0, at - 0.22))
        place(right, r_w, max(0, at - 0.22))
    # a chime as one spine lifts off the shelf ("your name on the spine")
    for k, note in enumerate((77, 81, 84)):
        place2(pluck(hz(note), 0.2, 1.4), 9 * BEAT + 0.72 + k * 0.07)
    # the fire: a few crackles
    for at in np.cumsum(rng.uniform(0.05, 0.22, 16)) + 13 * BEAT + 0.05:
        if at < 16 * BEAT - 0.1:
            n = int(rng.uniform(0.004, 0.012) * SR)
            c = one_pole(rng.standard_normal(n), 1800) * np.exp(-np.arange(n) / n * 5) * rng.uniform(0.25, 0.6)
            place2(c, at, pan=rng.uniform(-0.3, 0.3))
    # the last book lands on the shelf that was saved for you
    place2(pop(84, 0.2), 20 * BEAT)
    place2(pluck(hz(89), 0.12, 1.6), 20 * BEAT + 0.08)

if PRESET == 'printed':
    # The printing schedule, the same as in make-tiktok-printed.cjs: book 1 is stamped
    # at 0.26 s (the hook), books 2-3 a beat apart, 4-7 half a beat, 8-28 like a machine.
    def print_schedule():
        out = [0.22]
        for i in range(2, 29):
            if i <= 3:
                start, dur = (i + 1) * BEAT, BEAT
            elif i <= 7:
                start, dur = 5 * BEAT + (i - 4) * 0.5 * BEAT, 0.5 * BEAT
            else:
                start, dur = 7 * BEAT + (i - 8) * (5 * BEAT / 21), 5 * BEAT / 21
            out.append(start + 0.4 * dur)
        return out
    def stamp(level, bright=1.0):
        n = int(0.35 * SR)
        tt = np.arange(n) / SR
        thud = np.sin(2 * np.pi * np.cumsum(70 + 90 * np.exp(-tt * 35)) / SR) * np.exp(-tt * 22)
        clank = sum(np.sin(2 * np.pi * f * bright * tt + rng.uniform(0, 6)) * np.exp(-tt * d) for f, d in ((880, 38), (1730, 52), (3050, 70))) * 0.3
        tap = one_pole(rng.standard_normal(n), 3500) * np.exp(-tt * 120) * 0.7
        return np.tanh(1.6 * (thud + clank + tap)) * level
    def pop2(note, level):
        n = int(0.5 * SR)
        tt = np.arange(n) / SR
        body = pluck(hz(note), 1.0, 0.5)[:n]
        thud = np.sin(2 * np.pi * np.cumsum(220 * np.exp(-tt * 40) + 90) / SR) * np.exp(-tt * 45) * 0.25
        return (body + thud) * level
    def both(sig, at, pan=0.0):
        place(left, sig * (1 - pan), at)
        place(right, sig * (1 + pan), at + 0.002)
    for k, at in enumerate(print_schedule()):
        level = 0.38 if k == 0 else 0.26 if k < 7 else 0.16
        both(stamp(level, 1 + 0.012 * k), at, pan=0.15 * ((k % 3) - 1))
        if k < 7:  # the lever, just before a slow stamp
            both(click(0.07), at - 0.11)
    # the gold catching the light after the first stamp
    for k, note in enumerate((84, 88, 91)):
        both(pluck(hz(note), 0.13, 1.2), 0.38 + k * 0.06)
    # the plate coming down on frame 0
    l_w, r_w = whoosh(dur=0.35, level=0.22)
    place(left, l_w, 0.0)
    place(right, r_w, 0.0)
    # the 28 books landing on the shelf: a run up the F major pentatonic
    SCALE = [72, 74, 77, 79, 81, 84, 86, 89, 91]
    for k in range(28):
        both(pop2(SCALE[k % len(SCALE)] + 12 * ((k // len(SCALE)) % 2), 0.1), 12 * BEAT + 0.05 + k * 0.07 + 0.36, pan=0.25 * ((k % 3) - 1))
    for at in (12 * BEAT, 18 * BEAT):
        l_w, r_w = whoosh(level=0.3)
        place(left, l_w, max(0, at - 0.22))
        place(right, r_w, max(0, at - 0.22))
    # no. 29: a slow riser under the hovering plate, straight back into the first stamp
    rise = riser(DURATION - 20 * BEAT, level=0.12)
    place(left, rise, 20 * BEAT)
    place(right, rise, 20 * BEAT)
    print('stamps at', ', '.join(f'{x:.3f}' for x in print_schedule()[:4]), '...', f'{print_schedule()[-1]:.3f}')

if PRESET in ('day1', 'ink'):
    def both2(sig, at, pan=0.0):
        place(left, sig * (1 - pan), at)
        place(right, sig * (1 + pan), at + 0.002)
    def swoosh(at, level=0.28):
        l_w, r_w = whoosh(level=level)
        place(left, l_w, max(0, at - 0.22))
        place(right, r_w, max(0, at - 0.22))
if PRESET == 'day1':
    # frame 0: a sparkle up the Cmaj9, so the first second isn't quiet
    for k, note in enumerate((72, 76, 79, 83, 86)):
        both2(pluck(hz(note), 0.16, 1.4), 0.0 + k * 0.07, pan=0.3 * ((k % 3) - 1))
    for at in (3 * BEAT, 6 * BEAT, 9 * BEAT, 12 * BEAT):
        swoosh(at)
    # the first book glows onto the empty shelf (it's added at 12 beats + 0.5 s; brightest 0.5 s later)
    for k, note in enumerate((79, 84, 88, 91)):
        both2(pluck(hz(note), 0.2, 1.8), 12 * BEAT + 0.95 + k * 0.08)
    # the call to action: one bell
    both2(pluck(hz(84), 0.22, 2.4), 16 * BEAT)
    both2(pluck(hz(96), 0.06, 2.4), 16 * BEAT + 0.01)
if PRESET == 'ink':
    # frame 0: a little "boop" with the stare
    both2(pluck(hz(84), 0.2, 1.0), 0.0)
    both2(pluck(hz(91), 0.1, 0.8), 0.09)
    # job 1, 2, 3: one, two, three dings
    for job, at in enumerate((3 * BEAT, 7 * BEAT, 11 * BEAT), start=1):
        swoosh(at, 0.24)
        for k in range(job):
            both2(pluck(hz((79, 83, 86)[k]), 0.18, 1.0), at + 0.05 + k * 0.11, pan=0.25 * (k - 1))
    # job 2: a tick each time his eyes dart
    for at in (7 * BEAT + 0.6, 7 * BEAT + 1.15, 7 * BEAT + 1.7, 7 * BEAT + 2.25):
        both2(click(0.07), at)
    # job 3, "(lovingly)": the slow blink, a soft falling chime
    for k, note in enumerate((88, 84, 81, 77)):
        both2(pluck(hz(note), 0.13, 1.6), 13 * BEAT + 0.15 + k * 0.12)
    swoosh(15 * BEAT, 0.24)

# Fade in the first moment, ring out at the end.
if PRESET in ('rooms', 'friends', 'printed', 'day1', 'ink'):
    fade = np.interp(t, [0, 0.003, DURATION - 0.06, DURATION], [0, 1, 1, 0])
else:
    fade = np.interp(t, [0, 0.01 if PRESET == 'rules' else 0.15, DURATION - 2.2, DURATION], [0, 1, 1, 0])
stereo = np.stack([left * fade, right * fade], axis=1)
stereo /= np.abs(stereo).max() / 0.89

with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype('<i2').tobytes())
print(f'wrote {sys.argv[1]}: {DURATION:.1f}s, {BARS} bars at {BPM} BPM')
