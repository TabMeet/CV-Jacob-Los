// Opening the doors: builds the hall and connects everyone to everyone else.

import * as art from './art.js';
import { api, sessionId, connectEvents, isLocal } from './api.js';
import { el, openLayer, closeButton, toast, plural } from './ui.js';
import { createHall } from './hall.js';
import { createCat } from './cat.js';
import { openDesk } from './librarian.js';
import { openShelf } from './shelf.js';
import { openReader } from './reader.js';
import { openCorridor, showShelved } from './writing.js';
import { setSound, soundOn } from './sound.js';

const root = document.documentElement;

let todOverride = null; // the local edition's Studio can pin the time of day
function setTimeOfDay() {
  const h = new Date().getHours();
  const tod = todOverride ?? (h < 6 || h >= 21 ? 'night' : h < 9 ? 'dawn' : h < 18 ? 'day' : 'dusk');
  root.classList.remove('tod-night', 'tod-dawn', 'tod-day', 'tod-dusk');
  root.classList.add(`tod-${tod}`);
}
setTimeOfDay();
setInterval(setTimeOfDay, 5 * 60_000);

let rainingOutside = Math.random() < 0.6;
root.classList.toggle('raining', rainingOutside);
document.body.insertAdjacentHTML('afterbegin', art.defsSVG());

async function boot() {
  let config;
  let shelfData;
  try {
    [config, shelfData] = await Promise.all([api('/api/config'), api('/api/shelves')]);
  } catch (err) {
    document.getElementById('hint').textContent = `The library couldn't open its doors: ${err.message}`;
    return;
  }
  document.title = config.library;
  document.querySelector('[data-text="library"]').textContent = config.library;
  const genres = config.genres;

  // -- where am I, and who else is here? ------------------------------------

  let zoneOverride = null;
  let lastGreet = 0;
  let latestPresence = { total: 1, zones: {} };
  const mine = new Map(); // things I just did, so the cat doesn't announce them back to me
  const markMine = (type, title) => mine.set(`${type}:${title}`, Date.now());
  const isMine = (e) => {
    const t = mine.get(`${e.type}:${e.title ?? e.room ?? ''}`) ?? mine.get(`${e.type}:*`);
    return t !== undefined && Date.now() - t < 15_000;
  };

  const hall = createHall({
    world: document.getElementById('world'),
    viewport: document.getElementById('viewport'),
    genres,
    librarianName: config.librarian,
    catName: config.cat,
    onInteract: interact,
    onZone: (zone) => {
      if (zone === 'window' && Date.now() - lastGreet > 30_000) {
        lastGreet = Date.now();
        cat.greet();
      }
      if (!zoneOverride) reportPresenceSoon();
    },
  });
  hall.updateShelves(shelfData.shelves);

  const cat = createCat({ hall, catName: config.cat, genres, isMine });
  const myZone = () => zoneOverride ?? hall.zone ?? 'hall';

  function setZone(zone) {
    zoneOverride = zone;
    if (zone?.startsWith('writing:')) markMine('writing', Number(zone.split(':')[1]));
    reportPresenceSoon(50);
  }

  const presenceEl = document.getElementById('hud-presence');
  function applyPresence(snap) {
    if (!snap) return;
    latestPresence = snap;
    hall.setPresence(snap, myZone());
    cat.setPresence(snap, myZone());
    const others = Math.max(0, (snap.total ?? 1) - 1);
    presenceEl.hidden = false;
    presenceEl.textContent = others ? `${plural(others, 'other reader')} here` : 'Just you, for now';
  }

  let presenceTimer;
  function reportPresenceSoon(delay = 600) {
    clearTimeout(presenceTimer);
    presenceTimer = setTimeout(reportPresence, delay);
  }
  async function reportPresence() {
    try {
      applyPresence(await api('/api/presence', { method: 'POST', body: { sid: sessionId(), zone: myZone() } }));
    } catch {
      /* the next heartbeat will try again */
    }
  }
  reportPresence();
  setInterval(reportPresence, 15_000);
  addEventListener('pagehide', () => {
    if (!isLocal()) navigator.sendBeacon?.('/api/presence/leave', new Blob([JSON.stringify({ sid: sessionId() })], { type: 'application/json' }));
  });
  addEventListener('pageshow', (e) => {
    if (e.persisted) reportPresence();
  });

  connectEvents({
    presence: applyPresence,
    backlog: (list) => cat.load(list),
    happening: (ev) => {
      cat.onEvent(ev);
      if (ev.type === 'shelved' || ev.type === 'opened') refreshShelvesSoon();
    },
  });

  // -- the shelves in the hall ----------------------------------------------

  const totalsEl = document.getElementById('hud-totals');
  function showTotals(t) {
    totalsEl.textContent = t.books
      ? `${plural(t.books, 'book')} on the shelves · read ${plural(t.reads, 'time')}`
      : 'The shelves are waiting for their first story';
  }
  showTotals(shelfData.totals);

  let refreshTimer;
  function refreshShelvesSoon(delay = 1500) {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(async () => {
      try {
        shelfData = await api('/api/shelves');
        hall.updateShelves(shelfData.shelves);
        showTotals(shelfData.totals);
      } catch {
        /* keep what we have */
      }
    }, delay);
  }

  // -- things you can do ----------------------------------------------------

  function interact(spot) {
    hall.hideHint();
    if (spot.id === 'door') doorMoment();
    else if (spot.id === 'cat') cat.openNotebook();
    else if (spot.id === 'desk') desk();
    else if (spot.id.startsWith('shelf:')) shelf(spot.genre);
    else if (spot.id.startsWith('chair:')) chairMoment();
    else if (spot.id === 'writing') writing();
  }

  function doorMoment() {
    const h = new Date().getHours();
    const dark = h < 6 || h >= 20;
    const outside = root.classList.contains('raining')
      ? `Outside, rain is falling softly on the ${dark ? 'dark ' : ''}street.`
      : dark ? 'Outside, the street lamps are on and the street is empty.' : 'Outside, the street goes about its day.';
    toast(`${outside} In here it’s warm, and nobody is in a hurry. Stay as long as you like.`, { ms: 7000 });
  }

  function desk() {
    setZone('desk');
    openDesk({ config, genres, onRead: readBook, onShowShelf: showShelf, onClose: () => setZone(null) });
  }

  function shelf(genreId, highlight = null) {
    setZone(`shelf:${genreId}`);
    openShelf({ genreId, genres, highlight, onRead: readBook, onWrite: () => hall.travelTo('writing'), onClose: () => setZone(null) });
  }

  function showShelf(genreId, highlight = null) {
    const s = hall.spot(`shelf:${genreId}`);
    if (!s) return;
    const far = Math.abs(s.cx - hall.x) > 1200;
    hall.walkTo(s.cx, () => shelf(genreId, highlight), { mult: far ? 4.5 : 1.6 });
  }

  function readBook(book) {
    markMine('opened', book.title);
    markMine('finished', book.title);
    hall.sitDown(() => {
      setZone('reading');
      openReader({
        book,
        librarianName: config.librarian,
        onClose: () => {
          setZone(null);
          refreshShelvesSoon(300);
        },
        onAskForAnother: () => hall.walkTo(hall.spot('desk').cx, desk, { mult: 4.5 }),
      });
    });
  }

  function chairMoment() {
    setZone('reading');
    openLayer({
      label: 'An armchair',
      onClose: () => setZone(null),
      build: (close) => {
        const all = shelfData.shelves.flatMap((s) => s.books);
        const pick = () => {
          const unread = all.filter((b) => b.reads === 0);
          const pool = unread.length && Math.random() < 0.6 ? unread : all;
          return pool[Math.floor(Math.random() * pool.length)];
        };
        return el('div', { class: 'panel', style: { width: 'min(520px, 100%)' } },
          closeButton(close),
          el('h2', {}, 'You sink into the armchair.'),
          el('p', {}, `The lamp hums. Somewhere a page turns. ${latestPresence.zones?.reading > 1 ? 'Someone in the next chair is reading too.' : 'The cushions remember everyone who has sat here.'}`),
          el('div', { class: 'row' },
            all.length ? el('button', { class: 'btn', type: 'button', autofocus: true, onclick: () => { close('read'); readBook(pick()); } }, 'Read something at random') : null,
            el('button', { class: 'btn secondary', type: 'button', onclick: () => { close('desk'); hall.walkTo(hall.spot('desk').cx, desk, { mult: 4.5 }); } }, `Ask ${config.librarian}`),
            el('button', { class: 'btn quiet', type: 'button', onclick: () => close('sit') }, 'Just sit for a while'),
          ),
        );
      },
    });
  }

  function writing() {
    openCorridor({
      config,
      getPresence: () => latestPresence,
      setZone,
      beforePublish: () => markMine('shelved', '*'),
      onPublished: (res) => {
        markMine('shelved', res.book.title);
        refreshShelvesSoon(100);
        showShelved(res, { config, onGoToShelf: showShelf, onWriteAnother: writing });
      },
    });
  }

  // -- directory and sound ----------------------------------------------------

  document.getElementById('directory-button').addEventListener('click', () => {
    const counts = Object.fromEntries(shelfData.shelves.map((s) => [s.id, s.count]));
    openLayer({
      label: 'Library directory',
      build: (close) => {
        const go = (id) => () => {
          close('go');
          hall.travelTo(id);
        };
        const item = (label, small, id) => el('li', {}, el('button', { type: 'button', onclick: go(id) }, el('span', {}, label), small ? el('small', {}, small) : null));
        return el('div', { class: 'panel directory' },
          closeButton(close),
          el('h2', {}, 'Directory'),
          el('p', { class: 'lede' }, 'Where would you like to go? You’ll walk there.'),
          el('h3', {}, 'At the front'),
          el('ul', { class: 'directory-list' },
            item('The front desk', config.librarian, 'desk'),
            item('The windowsill', `${config.cat}, the cat`, 'cat'),
            item('The street door', '', 'door'),
          ),
          el('h3', {}, 'The shelves'),
          el('ul', { class: 'directory-list' }, genres.map((g) => item(g.name, counts[g.id] ? plural(counts[g.id], 'book') : 'empty', `shelf:${g.id}`))),
          el('h3', {}, 'At the back'),
          el('ul', { class: 'directory-list' },
            item('An armchair', 'sit and read', 'chair:0'),
            item('The writing rooms', 'write your own', 'writing'),
          ),
        );
      },
    });
  });

  const soundBtn = document.getElementById('sound-button');
  soundBtn.addEventListener('click', () => {
    setSound(!soundOn());
    const on = soundOn();
    soundBtn.setAttribute('aria-pressed', String(on));
    root.classList.toggle('raining', on || rainingOutside);
  });

  // Hooks for the local edition's Studio (unused by the hosted library).
  window.dispatchEvent(new CustomEvent('library:ready', {
    detail: {
      config,
      hall,
      cat,
      genres,
      setTimeOfDay(tod) {
        todOverride = tod;
        setTimeOfDay();
      },
      setRain(on) {
        rainingOutside = on;
        root.classList.toggle('raining', on || soundOn());
      },
      refresh() {
        reportPresence();
        refreshShelvesSoon(30);
      },
    },
  }));
}

boot();
