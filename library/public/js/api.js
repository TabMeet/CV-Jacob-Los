// Talking to the library's server, and the few things this browser remembers.
// Nothing here identifies you: the reader token is a random string made up by
// this browser, used only so that opening the same book twice counts once.

function randomId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('').replace(/(.{8})(.{4})(.{4})(.{4})/, '$1-$2-$3-$4-');
}

function storage(kind) {
  return {
    get(key, fallback = null) {
      try {
        const raw = globalThis[kind].getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        globalThis[kind].setItem(key, JSON.stringify(value));
      } catch {
        /* private mode or storage full: fine, it's only a convenience */
      }
    },
    remove(key) {
      try {
        globalThis[kind].removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}

export const local = storage('localStorage');
export const session = storage('sessionStorage');

let memoReader = null;
export function resetReader() {
  memoReader = null;
  local.remove('ql.reader');
  session.remove('ql.desk');
}
export function readerToken() {
  if (memoReader) return memoReader;
  memoReader = local.get('ql.reader') ?? randomId();
  local.set('ql.reader', memoReader);
  return memoReader;
}

let memoSid = null;
export function sessionId() {
  if (memoSid) return memoSid;
  memoSid = session.get('ql.sid') ?? randomId();
  session.set('ql.sid', memoSid);
  return memoSid;
}

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.message || `The library couldn't do that just now (${status}).`);
    this.status = status;
    this.data = data;
  }
}

// The local edition swaps the server for a backend that lives in this browser.
let backend = null;
export function useLocalBackend(b) {
  backend = b;
}
export const isLocal = () => backend !== null;

/** Live updates: who is here, and what's happening. */
export function connectEvents(handlers) {
  if (backend) return backend.connect(handlers);
  const events = new EventSource('/api/events');
  for (const [type, fn] of Object.entries(handlers)) events.addEventListener(type, (e) => fn(JSON.parse(e.data)));
  return () => events.close();
}

export async function api(path, { method = 'GET', body } = {}) {
  if (backend) return backend.request(path, { method, body });
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Reader': readerToken() },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, { message: 'The library seems to have lost its connection. Check yours and try again?' });
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

// Books written in this browser, so the writer can see how often they've been read.
export const yourBooks = {
  list: () => local.get('ql.yours', []),
  add(book) {
    const list = yourBooks.list().filter((b) => b.id !== book.id);
    list.unshift(book);
    local.set('ql.yours', list.slice(0, 100));
  },
  remove(id) {
    local.set('ql.yours', yourBooks.list().filter((b) => b.id !== id));
  },
};

export const drafts = {
  get: (room) => local.get(`ql.draft.${room}`, { title: '', body: '', letLibraryName: false }),
  set: (room, draft) => local.set(`ql.draft.${room}`, draft),
  clear: (room) => local.remove(`ql.draft.${room}`),
};
