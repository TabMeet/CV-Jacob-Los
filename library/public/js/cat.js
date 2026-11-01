// The black-and-white cat in the windowsill, who watches over everything.
// Its eyes follow you around the hall, and it keeps a little notebook of what
// it has seen happen in the library (anonymously, of course).

import { el, openLayer, closeButton, toast, timeAgo, plural } from './ui.js';
import { catPortraitSVG } from './art.js';
import { purr } from './sound.js';

export function createCat({ hall, catName, genres, isMine }) {
  const node = hall.cat;
  const pupils = node.querySelector('.cat-pupils');
  const head = node.querySelector('.cat-head');
  const log = [];
  let presence = { total: 0, zones: {} };
  let lastToast = 0;

  const bubble = el('div', { class: 'cat-bubble', 'aria-hidden': 'true' });
  bubble.style.left = `${hall.catX}px`;
  bubble.style.top = '262px';
  node.parentElement.append(bubble);

  // Eyes follow the visitor; the head tilts a little when you're close.
  hall.onFrame(({ x }) => {
    const dx = x - hall.catX;
    const look = Math.max(-1, Math.min(1, dx / 380));
    pupils.style.transform = `translate(${(look * 2.6).toFixed(2)}px, ${Math.abs(dx) < 140 ? 1.2 : 0}px)`;
    head.style.transform = `rotate(${(look * 6).toFixed(1)}deg)`;
  });

  (function blink() {
    node.classList.add('blink');
    setTimeout(() => node.classList.remove('blink'), 240);
    setTimeout(blink, 2200 + Math.random() * 5000);
  })();

  const shelf = (id) => genres.find((g) => g.id === id)?.name ?? 'a';
  const night = () => {
    const h = new Date().getHours();
    return h < 6 || h >= 21;
  };

  function describe(e) {
    switch (e.type) {
      case 'arrived':
        return night() ? 'Someone came in out of the dark and hung up their coat.' : 'The little bell over the door rang. Someone came in.';
      case 'shelved':
        return `A new book went up on the ${shelf(e.genre)} shelf: “${e.title}”.`;
      case 'opened':
        return e.firstTime && e.reads === 1
          ? `Someone just became the very first reader of “${e.title}”.`
          : `Someone sat down with “${e.title}”.`;
      case 'finished':
        return `Someone finished “${e.title}” and sat quietly for a moment.`;
      case 'writing':
        return `Someone slipped into writing room ${e.room}. A pen started scratching.`;
      case 'custom':
        return e.text;
      default:
        return null;
    }
  }

  function say(text, ms = 4200) {
    bubble.textContent = text;
    bubble.classList.add('show');
    clearTimeout(say.t);
    say.t = setTimeout(() => bubble.classList.remove('show'), ms);
  }

  function twitch() {
    node.classList.remove('twitch');
    void node.getBoundingClientRect();
    node.classList.add('twitch');
    setTimeout(() => node.classList.remove('twitch'), 800);
  }

  function remember(e) {
    const text = describe(e);
    if (!text) return null;
    log.unshift({ ...e, text });
    log.splice(30);
    return text;
  }

  function where(zones) {
    const parts = [];
    let shelves = 0;
    let writing = 0;
    for (const [z, n] of Object.entries(zones)) {
      if (z.startsWith('shelf:')) shelves += n;
      else if (z.startsWith('writing')) writing += n;
    }
    if (shelves) parts.push(`${shelves} by the shelves`);
    if (zones.reading) parts.push(`${zones.reading} reading in an armchair`);
    if (writing) parts.push(`${writing} writing in the back`);
    if (zones.desk) parts.push(`${zones.desk} at the front desk`);
    const elsewhere = (zones.hall ?? 0) + (zones.entrance ?? 0) + (zones.window ?? 0);
    if (elsewhere) parts.push(`${elsewhere} wandering the hall`);
    return parts;
  }

  return {
    load(backlog) {
      // oldest first, so the newest ends up on top; skip anything already noted (reconnects)
      for (const e of backlog) {
        if (!log.some((l) => l.at === e.at && l.type === e.type)) remember(e);
      }
      log.sort((a, b) => b.at - a.at);
    },

    onEvent(e) {
      const text = remember(e);
      if (!text) return;
      twitch();
      if (isMine(e)) return;
      const nearCat = Math.abs(hall.x - hall.catX) < 500;
      if (nearCat) say(text);
      else if (Date.now() - lastToast > 9000 && e.type !== 'arrived') {
        lastToast = Date.now();
        toast(`${catName} noticed: ${text}`, { icon: catPortraitSVG() });
      }
    },

    setPresence(p, ownZone) {
      const zones = { ...(p?.zones ?? {}) };
      if (ownZone && zones[ownZone]) zones[ownZone] -= 1;
      for (const z of Object.keys(zones)) if (!zones[z]) delete zones[z];
      presence = { total: Math.max(0, (p?.total ?? 1) - 1), zones };
    },

    greet() {
      const lines = ['Mrrp.', 'Mrrrow?', '…purrrr.', 'Mrrp! (that means hello)'];
      say(lines[Math.floor(Math.random() * lines.length)], 2200);
      node.classList.add('happy');
      setTimeout(() => node.classList.remove('happy'), 1800);
      purr();
    },

    openNotebook() {
      this.greet();
      openLayer({
        label: `What ${catName} has seen`,
        build: (close) => {
          const others = presence.total;
          const parts = where(presence.zones);
          const now = others
            ? `Right now there ${others === 1 ? 'is one other person' : `are ${plural(others, 'other person', 'other people')}`} in the library${parts.length ? `: ${parts.join(', ')}` : ''}. You are not alone in here.`
            : 'It’s just you and the books right now. But everyone who wrote them was here once, too.';
          return el(
            'div',
            { class: 'panel cat-panel' },
            closeButton(close),
            el('div', { class: 'row', style: { flexWrap: 'nowrap', gap: '14px', alignItems: 'center' } },
              el('div', { class: 'portrait', html: catPortraitSVG(), style: { flex: '0 0 auto', width: '84px', height: '84px' } }),
              el('div', {}, el('h2', {}, catName), el('p', { class: 'lede', style: { margin: 0 } }, 'The cat in the windowsill. Watches over everything, tells no one who did what.')),
            ),
            el('p', {}, now),
            el('h3', { style: { fontFamily: 'var(--serif-display)', fontSize: '22px', margin: '18px 0 0' } }, `What ${catName} has seen lately`),
            log.length
              ? el('ul', { class: 'cat-log' }, log.slice(0, 14).map((e) => el('li', {}, e.text, el('time', {}, timeAgo(e.at)))))
              : el('p', { class: 'lede' }, `It has been a quiet day. ${catName} has mostly been watching the rain.`),
          );
        },
      });
    },
  };
}
