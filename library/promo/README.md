# TikTok promos

## Profile picture

**`profile/ink-profile.png`** (1080×1080) shows Ink peeking over an open book in the lamplight, with a crescent moon. It's made for TikTok's round crop and stays recognisable down to the 32 px used in comments.

The source is `profile/ink-profile.svg`. To change it (colours, the moon, the book), edit the SVG and re-render the PNG and a preview at TikTok sizes:

```bash
node promo/profile/render-profile.cjs promo/profile/ink-profile.svg promo/profile/ink-profile.png preview.png
```

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

It's about 26 MB, at −14 LUFS. **`cover-shelves.jpg`** (the opening frame: one glowing book) works as a cover.

Suggested caption:

> it starts with one book. every story someone writes takes a place on a shelf, until the whole library is full of people who aren't alone anymore. would you add yours?
>
> #booktok #lofi #cozy #writingcommunity #indiedev #youarenotalone #cozyaesthetic #library

## 3 · The blank page, with a call to action (`quiet-library-cta.mp4`)

A 32-second video built around two asks. The main one is **comment**: an easy question that invites an answer. The second is **follow**, so viewers are there for opening night. Comments are what push a TikTok to more people, and a following is what you'll need on launch day.

| Time | Shot | On-screen text |
| --- | --- | --- |
| 0–9 s | A writing room. *"Dear stranger, I don't know you, but I hope tonight is gentle with you."* is typed onto the page. | *the quiet library · every book here starts with a blank page.* |
| 7–13 s | It's brought to the front desk, and Mrs. Wren binds it: "For Whoever Reads This" | *no name. no profile. just your words.* |
| 13–17 s | It glows onto the Letters & Diaries shelf | *it finds a place on a shelf…* |
| 17–20 s | A stranger reads it, ending on "The first reader… Today that was you." | *…and one day, a stranger sits down and reads it.* |
| 20–23 s | Fade through black to Ink in the rainy window | *if you could leave one sentence for a stranger, what would it say?* |
| 23–27 s | **The call to action.** A hand-drawn arrow draws itself to TikTok's comment button and pulses there. | **leave it in the comments.** *Ink reads every single one.* |
| 27–32.5 s | **The follow card:** Ink's profile picture with a pulsing red follow "+" | **follow, so you're here when the doors open.** *· The Quiet Library · opening soon* |

**The music** is `lofi.py`'s "letter" preset (Am9, Dm9, G13, Cmaj9). It drops to piano and melody for the question, then the whole band comes back for the call to action.

**Replying to comments.** "Ink reads every single one" is a promise: reply to some comments in Ink's voice (for example *mrrp. this one's going on the shelf.*). Replies are also good for reach.

It's about 18 MB, at −14 LUFS. **`cover-cta.jpg`** (Ink under the question) makes a strong cover for your profile grid.

Suggested caption, with the question repeated so people can answer without watching again:

> if you could leave one sentence for a stranger, what would it say? leave it below. Ink reads every one. 🐈‍⬛ the quiet library opens soon, follow so you're here when the doors open.
>
> #booktok #lofi #cozy #writingcommunity #youarenotalone #strangers #cozyaesthetic #library

## 4 · "This library has 3 rules" (`quiet-library-rules.mp4`)

A 28-second, fast, beat-cut listicle. Its structure comes from research into what's working on TikTok in late 2026 (sources below).

**What the research said**, and how this video does it:

| What works now | In this video |
| --- | --- |
| 20–35 s is the reach sweet spot; 60-second videos "that should have been 25" underperform | 28.4 s |
| A half-second flash of the payoff before the hook lifts 2-second retention; hook within 1–3 s (TikTok counts a "qualified view" at 5 s) | 0.7 s of Ink's eyes, then the hook at 0.7 s |
| A numbered promise ("3 rules", "5 mistakes") gives a built-in reason to keep watching | "this library has **3 rules.**" |
| Chapter cards every 5–8 s; a pattern interrupt about every 4 s; cuts on the beat | Chapter cards at 2.7, 8.2 and 13.6 s; 17 hard cuts on the beat (88 BPM) |
| "Static captions are dead": word-by-word timing, pops on keywords, a colour shift on the twist | Words pop in one by one, keywords in gold, on TikTok-style dark text boxes |
| Sound design: whooshes on transitions, risers into reveals, a silent beat before the punchline | Whooshes on every chapter card, a riser through bar 7, a **tape-stop into a frozen, silent beat**, then an impact on "the cat sees everything" |
| Polished editing on casual-feeling footage; no long branded intros or outros, no heavy transition packs | Hard cuts only, and a 3.9 s end card |
| Hook text top-centre, bottom 20% clear | All text in the top third, plus one end line at 57% |
| Cozy is fall 2026's dominant mood; BookTok is moving toward "books that feel like a hug" | Rain, lamplight, a cat, and a library that's kind to you |

**The cut:**

| Time | Shot | On-screen text |
| --- | --- | --- |
| 0–0.7 s | Payoff flash: Ink's eyes | none |
| 0.7–2.7 s | Mrs. Wren at the front desk | *this library has* **3 rules.** |
| 2.7–8.2 s | Chapter card **1**, then the Letters case, the shelf of titles, Mrs. Wren's face, a book card | **no names.** · *nobody knows who wrote what.* · *not even mrs. wren.* · *no author. just the story.* |
| 8.2–13.6 s | Chapter card **2**, then the Poetry case, read counts on the spines, an unread book, "The first reader" | *the only number: how many read it.* · *no likes. no followers.* · *nobody has read this one yet…* · *so… be the first.* |
| 13.6–19.1 s | Chapter card **3**, then a reader in an armchair, the glowing writing-room door, a pan past readers, a second armchair | *you're never the only one here.* · *someone's always writing… reading…* · *even at 3 a.m.* |
| 19.1–21.8 s | A slow push in on Ink. The riser, then a tape-stop into a frozen, silent frame. | *oh, and one more thing…* |
| 21.8–24.5 s | **Drop:** close on Ink, eyes darting left and right on the beat | **the cat sees everything.** *mrrp.* |
| 24.5–28.4 s | End card: an arrow to the comment button | *your turn · which rule would you* **break first?** · *The Quiet Library · opening soon · follow for opening night* |

**Staged content.** The library in this video is staged: the extra book titles, the read counts and the readers' silhouettes. The library isn't open yet.

**The music** is `lofi.py`'s "rules" preset: 88 BPM, Fmaj9, G13, Em9, Am9, with the sound design built in.

It's about 17 MB, at −14.5 LUFS. **`cover-rules.jpg`** (the hook: "this library has 3 rules.") works as a cover.

**Using a trending sound.** If you post from a personal (not business) account, you can also add a trending sound in TikTok's editor at low volume under the original audio. Business accounts can only use TikTok's Commercial Music Library.

Suggested caption:

> this library has 3 rules. which one would you break first? 👀 the quiet library opens soon, follow so you're here when the doors open.
>
> #booktok #cozy #lofi #library #writingcommunity #youarenotalone #catsoftiktok #cozyaesthetic

Research sources: [Vortex Xcel: TikTok editing trends 2026](https://vortexxcel.com/tiktok-editing-trends-2026/) · [HookClone: trending formats 2026](https://www.hookclone.com/blog/trending-tiktok-formats-2026) · [OpusClip: length and retention](https://www.opus.pro/blog/tiktok-length-format-retention-data) · [Sprout Social: TikTok algorithm 2026](https://sproutsocial.com/insights/tiktok-algorithm/) · [SocialPilot: November 2026 trends](https://www.socialpilot.co/blog/tiktok-trends) · [NewEngen: October 2026 trends](https://newengen.com/insights/tiktok-trends/) · [INFLOW: TikTok's autumn feed](https://inflownetwork.com/tiktok-trends-october-2026/) · [Lit Love Box: BookTok 2026](https://litlovebox.com/blogs/lit-love-bookish-blog/the-most-popular-booktok-books-right-now-2026-edition). Most of these are marketing blogs rather than TikTok itself, so treat the numbers as rough.

## 5 · The making of (`quiet-library-making.mp4`)

A 31-second "how I built this" video in the same fast, beat-cut style as video 4: numbered chapters, word-by-word captions, whooshes on the cuts, and a tape-stop into a silent beat before the reveal. It moves from a blank page through layout, characters, the world, code, bugs and tests, then shows the library come alive.

**Everything it shows is real, just dressed for the camera.** The ideas on the notepad are the six from the original brief. The blueprint uses the hall's real measurements (`hall.js`): 12 shelves, 4 armchairs, the writing rooms at 6,040, all 6,400 units long. The artboards hold the real Ink and Mrs. Wren SVGs. The world is built from the hall's own layers. The code on screen is the real `cat.js` that makes Ink's eyes follow you, typed out beside a live preview. The three bugs really happened:

- the clock hung right behind Mrs. Wren's head;
- Cormorant's old-style "1" read as an "I";
- an early profile picture had the tail growing out of the whiskers (`making/ink-avatar-early.png`).

The terminal output is the real test run and build (29 tests, 781 KB). What's styled is the windows around all this: the notebook, the design-app and scene-editor chrome, and the terminal frame. Two other things are staged: the extra Letters titles (the same ones as video 4) and the writer in the writing room. The video doesn't claim the library was hand-made or made without AI. If you want to say how it was made, add that in your caption. Whether to mention AI is up to you; TikTok's AI-content label is aimed mainly at realistic AI-generated footage.

| Time | Chapter | On-screen text |
| --- | --- | --- |
| 0–0.7 s | Payoff flash: Ink in the window | none |
| 0.7–2.7 s | A blank notebook page, "the quiet library" handwritten | *building a cozy library* **from a blank page.** |
| 2.7–5.5 s | **01** The six ideas, handwritten, plus a doodle of Ink | **the idea.** |
| 5.5–8.2 s | **02** A blueprint of the hall, drawn line by line | *one long hall.* **12 shelves.** |
| 8.2–10.9 s | **03** Ink and Mrs. Wren on artboards, outline to colour, plus the palette | *a librarian and* **a cat.** |
| 10.9–13.6 s | **04** A scene editor: wall, wainscot, floor, window, Ink, front desk and lamps drop in, ticked off one by one | *built* **layer by layer.** |
| 13.6–16.4 s | **05** The real `cat.js` lines typing out above a live preview of Ink's eyes moving | **ink's eyes** *follow you.* |
| 16.4–19.1 s | **06** Three bugs, each circled in red | *mrs. wren wore* **the clock as a hat.** · *every 1* **looked like an I.** · *the tail grew* **out of the whiskers.** |
| 19.1–21.8 s | **07** `npm test` (29 passing), `npm run build:local`, then a tape-stop into a frozen, silent frame | **testing.** · **29 tests.** *all green.* |
| 21.8–24.5 s | **The drop:** the finished hall, Ink in the window | *and then…* **it came alive.** |
| 24.5–27.3 s | A new book glows onto the Letters shelf, then the writing-room door lights up | *a place* **to read.** · *a place* **to write.** |
| 27.3–31 s | End card | *made for anyone who feels alone.* · **The Quiet Library** · *opening soon · follow to see the doors open* |

**The music** is `lofi.py`'s "making" preset: 88 BPM, Dmaj9, Bm9, Gmaj9 and A13sus. On top of the beat are pencil scribbles under the notebook, key clicks under the code and the terminal, whooshes on the chapter cuts, a riser, the tape stop and an impact on the drop.

It's about 15 MB, at −14.1 LUFS. **`cover-making.jpg`** (the blueprint, "one long hall. 12 shelves.") works as a cover.

Suggested caption:

> how i built a cozy little library where strangers leave stories for each other 📚🐈‍⬛ which part should i show next?
>
> #buildinpublic #booktok #cozy #gamedev #indiedev #webdev #writingcommunity #youarenotalone

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

# video 3: the blank page, with a call to action
python3 promo/lofi.py promo/lofi-letter.wav 34 letter
node promo/make-tiktok-cta.cjs promo/lofi-letter.wav promo/quiet-library-cta.mp4

# video 4: this library has 3 rules
python3 promo/lofi.py promo/lofi-rules.wav 29.5 rules
node promo/make-tiktok-rules.cjs promo/lofi-rules.wav promo/quiet-library-rules.mp4

# video 5: the making of
python3 promo/lofi.py promo/lofi-making.wav 31.5 making
node promo/make-tiktok-making.cjs promo/lofi-making.wav promo/quiet-library-making.mp4
```

Each takes 5–10 minutes. Every frame is rendered on a paused clock, so walks, blinks and page turns are perfectly smooth, and the result is the same on every run.

To change the scenes, the words or the timing, edit `make-tiktok.cjs`, `make-tiktok-shelves.cjs` or `make-tiktok-cta.cjs`. In the second and third scripts, each shot is a `shot()` with a camera function: position, zoom and focus over time. The captions are plain HTML strings, and `BAR` is one bar of music. The palette, chords and tempo are at the top of `lofi.py`. If you change `BPM` there, change `BAR` in `make-tiktok.cjs` to match.
