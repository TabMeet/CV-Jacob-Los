# TikTok promo

**`quiet-library-tiktok.mp4`** is a 38-second vertical video (1080×1920, 30 fps, H.264 + AAC, about 19 MB). It's ready to upload to TikTok, Reels or Shorts. **`cover.jpg`** is a still of Ink in the window, if you want to use it as the cover.

## What's in it

The cuts land on the music's bar lines (72 BPM, so one bar is 3.3 s).

| Time | Scene | On-screen text |
| --- | --- | --- |
| 0–6.7 s | A rainy night. You step in from the street door. | *pov: you found a library where every book was written by a stranger* |
| 6.7–10 s | Ink in the window. Its eyes follow you, and it purrs and says "Mrrp!" | *ink keeps watch over everyone who comes in* |
| 10–16.7 s | Mrs. Wren. You type "i feel a bit lonely tonight" and she answers. | *tell mrs. wren how you're feeling* |
| 16.7–20 s | Walking past the shelves, with another reader's silhouette | *no names. no likes. no followers.* |
| 20–23.3 s | The Poetry shelf: "Nobody has read this yet. You could be the first." | *just stories, and how many people read them* |
| 23.3–30 s | Sitting down with the poem, ending on "The first reader" | none |
| 30–33.3 s | A writing room: *dear stranger, I hope tonight is gentle with you.* | *or write your own. anonymously.* |
| 33.3–38 s | End card over Ink's window | *The Quiet Library · read. write. you're not alone. · opening soon* |

**Footage.** Everything is filmed from the real local edition. It isn't a mock-up.

**One edit for the video.** Mrs. Wren's greeting was swapped for a first-visit line. The library itself says "welcome back" to returning visitors.

**Staged visitors.** The silhouettes come from the Studio's staged visitors.

**The music** is original, synthesised by `lofi.py`: a Rhodes-style electric piano on Fmaj9, Em7, Dm9 and Cmaj9, soft swung drums, a round bass, a sparse melody, vinyl crackle, rain and tape wobble. Nothing is sampled or licensed, so you can use it anywhere.

**The look** is a warm colour grade with soft bloom, a vignette and light film grain.

## Suggested caption

> a library where every book was written by a stranger. no names, no likes, just stories, a cat called ink, and a librarian who listens. would you write something?
>
> #booktok #lofi #cozy #writingcommunity #indiedev #youarenotalone #cozyvibes #library

## Making it again (or a new version)

You need Python 3 with numpy, ffmpeg, and Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`).

```bash
cd library
npm run build:local                      # the local edition is what gets filmed
python3 promo/lofi.py promo/lofi.wav 38  # the music
node promo/make-tiktok.cjs promo/lofi.wav promo/quiet-library-tiktok.mp4
```

Filming takes about 5 minutes. Every frame is rendered on a paused clock, so walks, blinks and page turns are perfectly smooth, and the result is the same on every run.

To change the scenes, the words or the timing, edit `make-tiktok.cjs`. The captions are plain HTML strings, and `BAR` is one bar of music. The palette, chords and tempo are at the top of `lofi.py`. If you change `BPM` there, change `BAR` in `make-tiktok.cjs` to match.
