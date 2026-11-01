// A bookcase up close: every spine shows its title and how often it's been read.
// Nothing else is known about a book until you sit down and open it.

import { el, openLayer, closeButton, readsLabel } from './ui.js';
import { api } from './api.js';
import { spineStyle } from './art.js';

const SORTS = [
  ['popular', 'Most read'],
  ['new', 'Newest'],
  ['unread', 'Waiting for readers'],
];

export function coverEl(book) {
  const s = spineStyle(book);
  return el(
    'div',
    { class: 'cover', '--spine': s.color, '--spine-ink': s.ink, 'aria-hidden': 'true' },
    el('span', { class: 'cover-orn' }, '❦'),
    el('span', { class: 'cover-title' }, book.title),
    el('span', { class: 'cover-orn' }, '· · ·'),
  );
}

export function openShelf({ genreId, genres, highlight = null, onRead, onWrite, onClose }) {
  const genre = genres.find((g) => g.id === genreId);
  let sort = highlight ? 'new' : 'popular';
  let books = [];
  let total = 0;

  return openLayer({
    label: `The ${genre.name} shelf`,
    onClose,
    build: (close) => {
      const panel = el('div', { class: 'panel shelf-panel' });
      const caseEl = el('div', { class: 'case' });
      const sortBar = el('div', { class: 'sort', role: 'group', 'aria-label': 'Order the books' });
      const more = el('div', { class: 'shelf-more' });
      const count = el('p', { class: 'lede' });

      function renderSort() {
        sortBar.replaceChildren(
          ...SORTS.map(([id, label]) =>
            el('button', { type: 'button', 'aria-pressed': String(sort === id), onclick: () => { sort = id; load(true); } }, label),
          ),
        );
      }

      function perRow() {
        const w = panel.clientWidth || innerWidth;
        return Math.max(5, Math.floor((w - 60) / 52));
      }

      function renderCase() {
        caseEl.replaceChildren();
        if (!books.length) {
          caseEl.append(
            el('div', { class: 'case-row' },
              el('div', { class: 'empty-shelf' }, 'This shelf is waiting for its first story.', el('br'),
                el('button', { class: 'btn secondary', type: 'button', style: { marginTop: '14px', color: '#f3e7cf', borderColor: '#d6c6a3' }, onclick: () => { close('write'); onWrite(); } }, 'Write it in the writing rooms'))),
          );
          return;
        }
        const n = perRow();
        for (let i = 0; i < books.length; i += n) {
          const row = el('div', { class: 'case-row' });
          for (const b of books.slice(i, i + n)) {
            const s = spineStyle(b);
            const spine = el(
              'button',
              {
                type: 'button',
                class: `spine${b.reads >= 25 ? ' worn' : ''}${b.reads === 0 ? ' fresh' : ''}${b.id === highlight ? ' highlight' : ''}`,
                '--spine': s.color,
                '--spine-ink': s.ink,
                style: { width: `${Math.round(34 + s.width * 18)}px`, height: `${Math.round(118 + s.height * 56)}px` },
                'aria-label': `${b.title}. ${readsLabel(b.reads)}.`,
                onclick: () => showBook(b),
              },
              s.bands ? el('span', { class: 'spine-bands', 'aria-hidden': 'true' }) : null,
              el('span', { class: 'spine-title' }, b.title),
              el('span', { class: 'spine-reads', 'aria-hidden': 'true' }, b.reads ? `${b.reads}×` : 'new'),
            );
            row.append(spine);
          }
          caseEl.append(row);
        }
        if (highlight) caseEl.querySelector('.highlight')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }

      function renderMore() {
        more.replaceChildren();
        if (books.length < total) {
          more.append(el('button', { class: 'btn secondary', type: 'button', onclick: () => load(false) }, 'Further along the shelf'));
        }
      }

      async function load(reset) {
        renderSort();
        try {
          const res = await api(`/api/shelves/${genre.id}?sort=${sort}&offset=${reset ? 0 : books.length}`);
          books = reset ? res.books : books.concat(res.books);
          total = res.total;
          count.textContent = total
            ? `${total === 1 ? 'One book' : `${total.toLocaleString()} books`} on this shelf. Pick one up.`
            : 'No books here yet.';
          renderCase();
          renderMore();
        } catch (err) {
          count.textContent = err.message;
        }
      }

      function showBook(b) {
        const s = spineStyle(b);
        const back = el('button', { class: 'btn quiet', type: 'button', onclick: () => { panel.replaceChildren(...shelfView); renderCase(); } }, '← Put it back');
        panel.replaceChildren(
          closeButton(close),
          el(
            'div',
            { class: 'book-card' },
            coverEl(b),
            el(
              'div',
              {},
              el('p', { class: 'lede', style: { margin: 0 } }, genre.name),
              el('h2', {}, b.title),
              el('p', { class: 'read-count' }, b.reads === 0
                ? ['Nobody has read this yet. ', el('br'), 'You could be the first.']
                : [el('strong', {}, b.reads.toLocaleString()), b.reads === 1 ? ' person has read this.' : ' people have read this.']),
              el('p', { style: { color: 'var(--ink-soft)', fontSize: '16px' } }, 'No author, no blurb. Just the story, waiting.'),
              el('div', { class: 'row' },
                el('button', { class: 'btn', type: 'button', autofocus: true, onclick: () => { close('read'); onRead(b); } }, 'Sit down and read'),
                back),
            ),
          ),
        );
        panel.style.setProperty('--spine', s.color);
        panel.querySelector('.btn')?.focus();
      }

      const shelfView = [
        closeButton(close),
        el('div', { class: 'shelf-head' }, el('div', {}, el('h2', {}, genre.name), count), sortBar),
        caseEl,
        more,
      ];
      panel.append(...shelfView);
      load(true);
      return panel;
    },
  });
}
