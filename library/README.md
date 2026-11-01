# The Quiet Library

An online library you can walk through. Browse the shelves, sit down in an armchair to read, or go into the writing rooms at the back and write a story of your own.

Everything is anonymous. A book has a title and a shelf, and the only other thing anyone can see about it is how many people have read it. The library is there so that people who come to read or write know they're not alone.

## What's inside

- **The hall.** A long room drawn in SVG. Walk with the arrow keys (or A/D, with Shift to hurry), or tap where you want to go. Press E, or tap something, to look closer. The **Directory** button walks you anywhere.
- **Ink, the cat**, sits in the windowsill. Its eyes follow you around the hall. It notices what happens in the library ("someone just became the very first reader of…") and keeps a notebook you can read by saying hello.
- **Mrs. Wren, the librarian**, is at the front desk. Tell her what you're in the mood for ("something comforting", "I feel lonely tonight") and she'll suggest books from the shelves and walk you to them.
- **The shelves.** There are twelve genres, like a real bookshop. Every spine shows its title and read count. You can sort by *most read*, *newest*, or *waiting for readers*.
- **The armchairs.** Picking a book walks you to the nearest armchair and opens it as a book with pages to turn. On the last page you see how many people have read it ("You are one of 23 people who have sat with these pages").
- **The writing rooms.** Four rooms at the back. Drafts are saved on your own device as you type. Name the book yourself, ask for title ideas, or let the library name it. The library reads the story and decides which shelf it goes on.
- **Other visitors** appear as soft, faceless silhouettes standing at the shelves or sitting in the armchairs. A writing room's door glows when someone is writing inside. The counter at the top says how many people are in the library right now.
- **Small touches.** The window shows your own time of day (sun, dusk, or moon and stars), the clock on the wall shows your time too, and the rain button plays gentle rain made with Web Audio.

## Local edition: free, offline, for trying it out and filming

**`dist/quiet-library-local.html`** is the whole library in one file. Download it and double-click it to open it in Chrome, Edge, Firefox or Safari. It needs no install, no server, no API key and no internet.

To download it from GitHub, open the file there and click **Download raw file** (the ↓ icon).

How it differs from the hosted version:

- **Books are stored in your browser.** It starts with the 12 starter stories. Anything you write stays on that computer, in that browser.
- **No AI.** Genres, titles and Mrs. Wren's answers come from the offline helpers. She has a set of warm, mood-aware replies: lonely, grief, laughter, comfort, scary, love, "who wrote this?", the cat and more.
- **No one else is there.** You're the only visitor. For showing what it looks like with others, the Studio can add staged silhouettes.

### The Studio (press S)

A panel for making videos and screenshots. It sits outside the picture, so it never shows up in your recording.

| | |
| --- | --- |
| **Frame** | Whole window, **9:16** (Reels, TikTok, Shorts), **4:5** (Instagram post), **1:1**, **16:9** (YouTube). *Tall* camera fills a vertical frame top to bottom. |
| **Clean shot** (H) | Hides the buttons, hints and prompts. |
| **Show your visitor** | Turn it off for empty-room shots. |
| **Time of day** | Real time, day, dusk, night (moon and stars) or dawn. Rain on or off. |
| **Walking pace** | Slow it down for calmer footage. |
| **Staged visitors** | 0–10 soft silhouettes at the shelves, in armchairs and in the writing rooms. They're not real readers, so it's worth saying so in your caption. |
| **Play the tour** (T) | A slow, one-minute walk from the street door, past the cat and the desk, along the shelves, to the writing rooms. Press any key to take over. |
| **Mrs. Wren's next answer** | Type a line, then ask her anything at the desk. She says your line and still offers real books. |
| **Make Ink notice something** | Shows your text in the cat's speech bubble, or as a note in the corner. |
| **Record the frame** (R) | Chrome and Edge: choose "This tab" and it records just the frame, with the rain sound, then saves an `.mp4` to Downloads. You can also use your own screen recorder (Mac ⇧⌘5, Windows Win+Shift+R). |
| **Library** | Export or import books as a file, "Next visitor" (hand the laptop to someone else: they count as a new reader), reset to the starter stories, or empty the shelves. |

Tips for sharper video:

- **Go fullscreen and close the Studio while you record.** The frame then uses the whole screen height. The label above the frame shows the size it will record at.
- **Back up what you write.** It lives only in that browser, so use **Export books** now and then.

**Moving to the hosted library later:** export your books from the Studio, then run `npm run seed -- --from quiet-library-books-….json`. Imported books start at 0 reads, because reads on your laptop weren't real readers.

**Rebuilding it** after changing the code: `npm run build:local`. The fonts are embedded when you build online.

## Running it

You need Node.js 22.13 or newer. It uses the SQLite that's built into Node, so there's nothing to compile.

```bash
cd library
npm install
npm run seed     # optional: puts 12 starter stories on the shelves
npm start        # http://localhost:3000
```

To let Claude pick genres, suggest titles and speak as the librarian, set an API key first:

```bash
cp .env.example .env    # then put your key in ANTHROPIC_API_KEY
npm start
```

Without a key the library still works, using simple offline helpers: keyword-based genres, titles taken from the story's own words, and a librarian with a few kind stock phrases.

`npm test` runs the tests for the server and the local edition (no network needed).

## How the AI is used

All Claude calls are in `server/ai.js`. They use the `claude-opus-5-5` model at low effort with structured JSON output.

| When | What Claude does |
| --- | --- |
| A book is brought to the front desk | Chooses the shelf, suggests three titles, writes a private one-line note for the librarian, and checks the book can be shelved. |
| "Ask the library for title ideas" | Suggests three titles for the draft. |
| Talking to Mrs. Wren | Answers in character and recommends up to three real books. Book IDs the model makes up are thrown away. |

Notes:

- **Server-side fallback is on.** If the model declines a request for policy reasons, the API retries it on Anthropic's recommended fallback model (`fallbacks: "default"`). To turn this off, remove `betas` and `fallbacks` from `askJson()` in `server/ai.js`.
- **The note stays private.** The librarian's note about each book helps her recommend it, but readers never see it.
- **Failures don't break anything.** If a call fails or is declined, the offline helper answers instead.
- **Settings.** `LIBRARY_MODEL` and `LIBRARY_EFFORT` change the model and effort level. `LIBRARY_AI=off` forces offline mode.

## Privacy and safety

- **No accounts.** Nothing about who wrote or read a book is stored.
- **Read counts** are counted once per browser per book. The browser makes up a random token, and the server stores only a salted hash of it.
- **Presence and the cat's notebook** live only in server memory. They're anonymous and gone after a restart.
- **Taking a book down.** A writer's own browser remembers their books, so they can see read counts and take a book off the shelf. Nobody else can tell which books are theirs.
- **What gets turned away.** The library accepts writing about anything, including painful subjects. Claude only turns away spam, gibberish, sexual content involving minors, pornographic detail, hate, content that exposes a real private person, and instructions for serious harm. The writer gets a gentle reason and keeps their draft.
- **Support for writers in distress.** If a story sounds like the writer is in danger right now, the book is still shelved, and Mrs. Wren adds a note pointing to free helplines ([findahelpline.com](https://findahelpline.com)). She does the same at the desk if a visitor says they're struggling.
- **Reports.** Readers can report a book. After 3 different readers report it (set with `REPORT_THRESHOLD`), it comes off the shelves. Hidden books stay in the database with `hidden = 1`, so you can review them.
- **Basic protections.** Every route has a simple rate limit. Pages use a strict Content Security Policy, and user text is never inserted as HTML.

## Making it yours

- **Names.** Rename Mrs. Wren, Ink or the library in `shared/characters.js`.
- **Shelves.** Add, remove or reorder them in `shared/genres.js`. The hall rebuilds itself to match.
- **Starter stories.** These are in `shared/starter-books.js`. They were written as placeholders, so before opening to the public you may want to start with empty shelves: delete `data/library.db` and skip `npm run seed`.

## Project layout

```
shared/           used by both the server and the local edition
  genres.js       the shelves
  characters.js   names of the librarian, the cat and the library
  fallback.js     offline helpers, including the librarian without AI
  starter-books.js
  text.js
server/
  index.js        starts the server
  app.js          the HTTP API
  db.js           books, reads, reports (SQLite)
  ai.js           Claude: cataloguing, titles, the librarian
  presence.js     who's here, and what the cat sees (live, via server-sent events)
  seed.js         starter stories, and importing books from the local edition
public/
  index.html, css/library.css
  js/main.js      wires everything together
  js/hall.js      the walkable hall, camera, other visitors
  js/art.js       all the SVG illustrations
  js/cat.js, librarian.js, shelf.js, reader.js, writing.js, sound.js, ui.js, api.js
  js/local-main.js, js/local/   the local edition: in-browser backend and the Studio
  css/studio.css
scripts/build-local.mjs         builds dist/quiet-library-local.html
dist/quiet-library-local.html   the local edition, ready to double-click
test/             node:test suite
```

## Hosting

This is a regular Node server, so any host that runs Node and has a persistent disk for `data/library.db` will work (Render, Fly.io, Railway, a small VPS).

- Set `ANTHROPIC_API_KEY` on the host.
- If it runs behind a proxy, set `TRUST_PROXY=1` so rate limits see real visitor IPs.
- GitHub Pages can't run it, because it needs a server.
