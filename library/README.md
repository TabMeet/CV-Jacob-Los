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

`npm test` runs the server tests (no network needed).

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

- **Names.** Rename Mrs. Wren, Ink or the library in `server/characters.js`.
- **Shelves.** Add, remove or reorder them in `server/genres.js`. The hall rebuilds itself to match.
- **Starter stories.** These are in `server/seed.js`. They were written as placeholders, so before opening to the public you may want to start with empty shelves: delete `data/library.db` and skip `npm run seed`.

## Project layout

```
server/
  index.js        starts the server
  app.js          the HTTP API
  db.js           books, reads, reports (SQLite)
  ai.js           Claude: cataloguing, titles, the librarian
  fallback.js     offline helpers
  presence.js     who's here, and what the cat sees (live, via server-sent events)
  genres.js       the shelves
  characters.js   names of the librarian, the cat and the library
  seed.js         starter stories
public/
  index.html, css/library.css
  js/main.js      wires everything together
  js/hall.js      the walkable hall, camera, other visitors
  js/art.js       all the SVG illustrations
  js/cat.js, librarian.js, shelf.js, reader.js, writing.js, sound.js, ui.js, api.js
test/             node:test suite
```

## Hosting

This is a regular Node server, so any host that runs Node and has a persistent disk for `data/library.db` will work (Render, Fly.io, Railway, a small VPS).

- Set `ANTHROPIC_API_KEY` on the host.
- If it runs behind a proxy, set `TRUST_PROXY=1` so rate limits see real visitor IPs.
- GitHub Pages can't run it, because it needs a server.
