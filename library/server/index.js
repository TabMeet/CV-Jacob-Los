import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { openLibraryDb } from './db.js';
import { createPresence } from './presence.js';
import { createApp } from './app.js';
import { createFriendsFile } from './friends.js';
import { aiEnabled } from './ai.js';
import { LIBRARY } from '../shared/characters.js';

const here = dirname(fileURLToPath(import.meta.url));
const DB_FILE = process.env.LIBRARY_DB || join(here, '..', 'data', 'library.db');
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = dirname(DB_FILE);

const db = openLibraryDb(DB_FILE, { reportThreshold: Number(process.env.REPORT_THRESHOLD) || 3 });
const presence = createPresence();
// Friends of the Library: your followers' books (see README)
const friends = createFriendsFile([join(DATA_DIR, 'friends.json'), join(DATA_DIR, 'friends.txt')]);
const app = createApp({ db, presence, friends });

const server = app.listen(PORT, () => {
  const { books } = db.totals();
  console.log(`${LIBRARY.name} is open at http://localhost:${PORT}`);
  console.log(`  ${books} book${books === 1 ? '' : 's'} on the shelves · database: ${DB_FILE}`);
  console.log(
    aiEnabled()
      ? '  Claude is helping with genres, titles and the front desk.'
      : '  No ANTHROPIC_API_KEY found: using simple offline helpers for genres, titles and the front desk.',
  );
});

function shutdown() {
  presence.close();
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
