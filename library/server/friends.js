// Friends of the Library on the hosted library: the followers' books come from a
// file next to the database, data/friends.json (the file the local edition's
// Studio downloads) or data/friends.txt (one name per line). Edit or replace it
// at any time; it's re-read whenever it changes.

import { readFileSync, statSync } from 'node:fs';
import { readFriendsFile } from '../shared/friends.js';

export function createFriendsFile(files) {
  let cache = { key: null, list: [] };
  return {
    list() {
      for (const file of files) {
        let stat;
        try {
          stat = statSync(file);
        } catch {
          continue; // not there: try the next one
        }
        const key = `${file}:${stat.mtimeMs}:${stat.size}`;
        if (cache.key !== key) {
          try {
            cache = { key, list: readFriendsFile(readFileSync(file, 'utf8')) };
          } catch (err) {
            console.warn(`[library] couldn't read ${file}: ${err.message}`);
            cache = { key, list: [] };
          }
        }
        return cache.list;
      }
      return [];
    },
  };
}
