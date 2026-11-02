// Friends of the Library: a room at the back of the hall where every follower
// gets a book. A friend's book carries the name it was given (a TikTok handle,
// say) and its number, and nothing else. The shelves start out empty.
//
// Used by the hall, the local edition's backend and Studio, and the server.

export const FRIENDS_ROOM = 'Friends of the Library';
export const FRIENDS_SHORT = 'Friends'; // on the brass plaques: "FRIENDS · I"
export const MIN_CASES = 6; // the room is never smaller than this
export const PER_CASE = 50; // books per bookcase: fits the hall drawing even with wide spines
export const MAX_NAME = 40;
export const MAX_FRIENDS = 5000;

/** A name as it goes on a spine, or null. Strips list markers ("- ", "12. ", "• ") and odd characters. */
export function cleanFriendName(raw) {
  let s = String(raw ?? '')
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  s = s.replace(/^(?:[-*•·]|\d{1,5}[.)])\s+/, '').trim();
  if (!s) return null;
  if ([...s].length > MAX_NAME) s = [...s].slice(0, MAX_NAME).join('').trim();
  return s;
}

/** Names pasted one per line (blank lines and list markers are fine). */
export function parseFriendNames(text) {
  return String(text ?? '')
    .split(/\r?\n/)
    .map(cleanFriendName)
    .filter(Boolean);
}

/** Two names are the same friend if they only differ by case or a leading @. */
export function friendKey(name) {
  return String(name).replace(/^@+/, '').toLocaleLowerCase();
}

export const friendId = (no) => `friend-${no}`;

/**
 * Put new friends on the shelves, after everyone already there. Returns the new
 * list and the friends that were actually added (names already on a shelf are skipped).
 */
export function addFriends(list, names, now = Date.now()) {
  const known = new Set(list.map((f) => friendKey(f.name)));
  let next = list.reduce((max, f) => Math.max(max, f.no), 0) + 1;
  const added = [];
  for (const raw of names) {
    const name = cleanFriendName(raw);
    if (!name || known.has(friendKey(name))) continue;
    if (list.length + added.length >= MAX_FRIENDS) break;
    known.add(friendKey(name));
    added.push({ no: next++, name, added: now });
  }
  return { list: [...list, ...added], added };
}

/** Accepts an export from the Studio, a plain array of names, or one name per line. */
export function readFriendsFile(content) {
  let data = content;
  if (typeof content === 'string') {
    try {
      data = JSON.parse(content);
    } catch {
      data = parseFriendNames(content);
    }
  }
  const raw = Array.isArray(data) ? data : Array.isArray(data?.friends) ? data.friends : null;
  if (!raw) throw new Error('No friends found in that file.');
  const out = [];
  const seen = new Set();
  let next = 1;
  for (const item of raw) {
    const name = cleanFriendName(typeof item === 'string' ? item : item?.name);
    if (!name || seen.has(friendKey(name))) continue;
    seen.add(friendKey(name));
    const no = Number.isInteger(item?.no) && item.no > 0 ? item.no : next;
    const added = Number.isFinite(item?.added) ? item.added : typeof item?.added === 'string' && Number.isFinite(Date.parse(item.added)) ? Date.parse(item.added) : 0;
    out.push({ no, name, added });
    next = Math.max(next, no) + 1;
    if (out.length >= MAX_FRIENDS) break;
  }
  return out.sort((a, b) => a.no - b.no);
}

/** The file the Studio downloads and the hosted library reads (data/friends.json). */
export function friendsFile(list) {
  return {
    format: 'quiet-library-friends',
    version: 1,
    room: FRIENDS_ROOM,
    friends: list.map(({ no, name, added }) => ({ no, name, added: added ? new Date(added).toISOString().slice(0, 10) : null })),
  };
}

/** What the API hands out: just enough to draw the books. */
export const publicFriend = ({ no, name, added }) => ({ id: friendId(no), no, name, added: added || null });

/** How many bookcases the room has: always at least one with room to spare. */
export function caseCount(friends) {
  return Math.max(MIN_CASES, Math.ceil((friends + 1) / PER_CASE));
}

/** Which bookcase a friend's book stands in (the last one takes any overflow). */
export function caseOf(index, cases) {
  return Math.min(cases - 1, Math.floor(index / PER_CASE));
}

/** The friends on bookcase `i`, in order. */
export function friendsOnCase(friends, i, cases) {
  const sorted = [...friends].sort((a, b) => a.no - b.no);
  return i === cases - 1 ? sorted.slice(i * PER_CASE) : sorted.slice(i * PER_CASE, (i + 1) * PER_CASE);
}

export function roman(n) {
  const table = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of table) while (n >= v) { out += s; n -= v; }
  return out;
}
