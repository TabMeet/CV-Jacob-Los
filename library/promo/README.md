# TikTok promos

## 1 · The tour (`quiet-library-tiktok.mp4`)

**`quiet-library-tiktok.mp4`** is a 38-second vertical video (1080×1920, 30 fps, H.264 + AAC, about 19 MB). It's ready to upload to TikTok, Reels or Shorts. **`cover.jpg`** is a still of Ink in the window, if you want to use it as the cover.

### What’s in it

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

### Suggested caption

> a library where every book was written by a stranger. no names, no likes, just stories, a cat called ink, and a librarian who listens. would you write something?
>
> #booktok #lofi #cozy #writingcommunity #indiedev #youarenotalone #cozyvibes #library

## 2 · The shelves grow fuller (`quiet-library-shelves.mp4`)

A 42-second, more cinematic piece about one idea: every story someone writes makes the shelves a little fuller. It's shot like a short film, with no visible visitor, a free-moving camera and real crossfades between shots. The wording describes the vision ("it starts with one book… until every shelf is full"), because the library isn't open yet.

| Time | Shot | Camera | On-screen text |
| --- | --- | --- | --- |
| 0–6.7 s | One book glows onto an empty shelf | Focus pull, then a slow pull-back from a 2.7× close-up | *watch this shelf · it starts with one book.* |
| 6.7–13.3 s | The writing-room door glowing, with the silhouette of someone writing behind the frosted glass: "Someone is writing." | Slow push-in | *someone writes a story in a room at the back…* |
| 13.3–20 s | Books land one by one, each with a warm glow, faster and faster. A counter starts. | Gentle push-in | *…and it finds a place on a shelf.* |
| 20–23.3 s | Fade through black. Ink's window as the sky turns night → dawn → day → dusk → night. | Slow push-in | *night after night,* |
| 23.3–30 s | Two bookcases fill in bursts, in time with the hi-hats. The counter climbs past 400. | Pull-back and drift | *more people write. the shelves grow fuller.* |
| 30–36.7 s | Every shelf full, readers in the armchairs | One long tracking shot down the hall | *until every shelf is full of someone.* |
| 36.7–42.5 s | End card over a full bookcase | Push-in | *every story makes the library a little less empty. · add yours. · The Quiet Library · opening soon* |

**Dust and fades.** Dust drifts in the lamplight throughout. Shots are joined with crossfades on the bar lines, plus one fade through black for "night after night".

**The music** is `lofi.py`'s "shelves" preset (Ebmaj9, Dm7, Cm9, Bbmaj13). It grows with the shelves: piano alone, then bass, light drums, a hushed break, and the full band with a warm pad.

**Staged numbers.** The books, the counter and the readers' silhouettes are staged for the video. The captions describe what the library is for, not real numbers.

Suggested caption:

> it starts with one book. every story someone writes takes a place on a shelf, until the whole library is full of people who aren't alone anymore. would you add yours?
>
> #booktok #lofi #cozy #writingcommunity #indiedev #youarenotalone #cozyaesthetic #library

## Making them again (or new versions)

You need Python 3 with numpy, ffmpeg, and Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`).

```bash
cd library
npm run build:local                      # the local edition is what gets filmed

# video 1: the tour
python3 promo/lofi.py promo/lofi.wav 38 cozy
node promo/make-tiktok.cjs promo/lofi.wav promo/quiet-library-tiktok.mp4

# video 2: the shelves grow fuller
python3 promo/lofi.py promo/lofi-shelves.wav 43 shelves
node promo/make-tiktok-shelves.cjs promo/lofi-shelves.wav promo/quiet-library-shelves.mp4
```

Each takes 5–10 minutes. Every frame is rendered on a paused clock, so walks, blinks and page turns are perfectly smooth, and the result is the same on every run.

To change the scenes, the words or the timing, edit `make-tiktok.cjs` or `make-tiktok-shelves.cjs`. In the second script, each shot is a `shot()` with a camera function: position, zoom and focus over time. The captions are plain HTML strings, and `BAR` is one bar of music. The palette, chords and tempo are at the top of `lofi.py`. If you change `BPM` there, change `BAR` in `make-tiktok.cjs` to match.
