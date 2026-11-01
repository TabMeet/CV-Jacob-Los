// Puts books on the shelves of the hosted library.
//
//   npm run seed                          add the 12 starter stories (skipped if there are books already)
//   npm run seed -- --force               add them anyway
//   npm run seed -- --from export.json    add books exported from the local edition (Studio → Export books)
//
// Imported books always start with 0 readers: read counts from a laptop aren't real readers.
// The starter stories were written for the project as placeholders. Before you open the doors
// to the public, you may want to start from an empty database instead (delete data/library.db).

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { openLibraryDb } from './db.js';
import { themesOf, summarise } from '../shared/fallback.js';
import { STARTER_BOOKS } from '../shared/starter-books.js';
import { isGenre } from '../shared/genres.js';
import { cleanText, cleanTitle, wordCount, MIN_WORDS, MAX_CHARS } from '../shared/text.js';

export { STARTER_BOOKS };

const here = dirname(fileURLToPath(import.meta.url));
const DB_FILE = process.env.LIBRARY_DB || join(here, '..', 'data', 'library.db');

export function seed(db, { force = false } = {}) {
  if (!force && db.totals().books > 0) return 0;
  for (const b of STARTER_BOOKS) {
    db.addBook({ ...b, summary: summarise(b.body), themes: themesOf(b.body) });
  }
  return STARTER_BOOKS.length;
}

/** Add books from a local-edition export. Returns { added, skipped }. */
export function importExport(db, data) {
  if (data?.format !== 'quiet-library-export' || !Array.isArray(data.books)) {
    throw new Error('That file is not a Quiet Library export.');
  }
  let added = 0;
  let skipped = 0;
  for (const raw of data.books) {
    const body = cleanText(raw.body);
    const title = cleanTitle(raw.title);
    if (!title || !isGenre(raw.genre) || wordCount(body) < MIN_WORDS || body.length > MAX_CHARS) {
      skipped++;
      continue;
    }
    db.addBook({ title, body, genre: raw.genre, titleByAi: Boolean(raw.namedByLibrary), summary: summarise(body), themes: themesOf(body) });
    added++;
  }
  return { added, skipped };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const db = openLibraryDb(DB_FILE);
  const fromAt = process.argv.indexOf('--from');
  if (fromAt > 0) {
    const file = process.argv[fromAt + 1];
    const { added, skipped } = importExport(db, JSON.parse(readFileSync(file, 'utf8')));
    console.log(`Added ${added} book${added === 1 ? '' : 's'} from ${file}${skipped ? ` (skipped ${skipped} that weren't complete)` : ''}.`);
  } else {
    const added = seed(db, { force: process.argv.includes('--force') });
    console.log(added ? `Placed ${added} starter books on the shelves (${DB_FILE}).` : 'The library already has books; nothing added. Use --force to add the starter books anyway.');
  }
  db.close();
}
