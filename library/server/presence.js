// Who is in the library right now, and what the cat has seen happen.
// Lives in memory only: nothing here is written to disk, and nobody is identified.
// Visitors are a random session id their browser picked, and the place they're standing.

const ZONE = /^(entrance|window|desk|hall|reading|writing|friends|shelf:[a-z]{2,12}|writing:[1-4])$/;
const SID = /^[a-z0-9-]{8,40}$/i;

export function createPresence({ now = () => Date.now(), staleAfterMs = 45_000, keepEvents = 40 } = {}) {
  const sessions = new Map(); // sid -> { zone, seen }
  const streams = new Set(); // open SSE responses
  const events = [];
  let lastArrival = 0;

  function prune() {
    const cutoff = now() - staleAfterMs;
    for (const [sid, s] of sessions) if (s.seen < cutoff) sessions.delete(sid);
  }

  function snapshot() {
    prune();
    const zones = {};
    for (const { zone } of sessions.values()) zones[zone] = (zones[zone] ?? 0) + 1;
    return { total: sessions.size, zones };
  }

  function send(res, type, data) {
    res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  function broadcast(type, data) {
    for (const res of streams) send(res, type, data);
  }

  function emit(event) {
    const e = { ...event, at: now() };
    events.push(e);
    if (events.length > keepEvents) events.shift();
    broadcast('happening', e);
    return e;
  }

  /** Returns false if the input was not acceptable. */
  function touch(sid, zone) {
    if (!SID.test(String(sid)) || !ZONE.test(String(zone))) return false;
    const isNew = !sessions.has(sid);
    const before = sessions.get(sid)?.zone;
    sessions.set(sid, { zone, seen: now() });
    if (isNew && now() - lastArrival > 20_000) {
      lastArrival = now();
      emit({ type: 'arrived' });
    }
    if (zone.startsWith('writing:') && before !== zone) emit({ type: 'writing', room: Number(zone.split(':')[1]) });
    return true;
  }

  function leave(sid) {
    sessions.delete(sid);
  }

  function subscribe(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write('retry: 4000\n\n');
    send(res, 'presence', snapshot());
    send(res, 'backlog', events.slice(-15));
    streams.add(res);
    req.on('close', () => streams.delete(res));
  }

  const ticker = setInterval(() => broadcast('presence', snapshot()), 5_000);
  ticker.unref();

  function close() {
    clearInterval(ticker);
    for (const res of streams) res.end();
    streams.clear();
  }

  return { touch, leave, snapshot, emit, subscribe, recent: () => events.slice(), close };
}
