// Friends of the Library, up close: one of the room's bookcases, a book for every
// follower with their name on the spine and their number at its foot. You can
// look for a name, and take a book off the shelf to see whose it is.

import { el, openLayer, closeButton } from './ui.js';
import { coverEl, spineButton, spinesPerRow } from './shelf.js';
import { FRIENDS_ROOM, FRIENDS_SHORT, caseOf, friendKey, friendsOnCase, roman } from '../../shared/friends.js';

const caseName = (i) => `${FRIENDS_SHORT} · ${roman(i + 1)}`;
const asBook = (f) => ({ id: f.id, title: f.name, reads: 0 });

function sinceLabel(added) {
  const t = typeof added === 'number' ? added : Date.parse(added);
  if (!Number.isFinite(t) || t <= 0) return null;
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * `friends` is the whole room ({ id, no, name, added }), `cases` how many
 * bookcases it has; `index` the bookcase to open; `highlight` a friend's book id.
 */
export function openFriendsCase({ index, cases, friends, highlight = null, onClose }) {
  const sorted = [...friends].sort((a, b) => a.no - b.no);
  let current = index;
  let lit = highlight;

  return openLayer({
    label: `${FRIENDS_ROOM}: ${caseName(index)}`,
    onClose,
    build: (close) => {
      const panel = el('div', { class: 'panel shelf-panel friends-panel' });
      const found = el('p', { class: 'find-note', role: 'status' });

      function find(e) {
        e.preventDefault();
        const query = friendKey(new FormData(e.target).get('name') ?? '').trim();
        if (!query) return;
        let at = sorted.findIndex((f) => friendKey(f.name) === query);
        if (at < 0) at = sorted.findIndex((f) => friendKey(f.name).includes(query));
        if (at < 0) {
          found.textContent = 'Not on the shelves yet.';
          return;
        }
        current = caseOf(at, cases);
        lit = sorted[at].id;
        render();
        found.textContent = `${sorted[at].name} is book no. ${sorted[at].no}, on ${caseName(current)}.`;
      }
      const search = el('form', { class: 'find', role: 'search', onsubmit: find },
        el('input', { name: 'name', type: 'search', placeholder: 'Look for a name', 'aria-label': 'Look for a name', autocomplete: 'off', spellcheck: 'false' }),
        el('button', { class: 'btn secondary', type: 'submit' }, 'Find'));

      function render() {
        const books = friendsOnCase(sorted, current, cases);
        const caseEl = el('div', { class: 'case' });
        if (!books.length) {
          caseEl.append(el('div', { class: 'case-row' }, el('div', { class: 'empty-shelf' }, 'This shelf is saved for you.')));
        } else {
          const n = spinesPerRow(panel);
          for (let i = 0; i < books.length; i += n) {
            const row = el('div', { class: 'case-row' });
            for (const f of books.slice(i, i + n)) {
              row.append(spineButton(asBook(f), { highlight: lit, foot: `No. ${f.no}`, onclick: () => showFriend(f) }));
            }
            caseEl.append(row);
          }
        }
        const nav = el('div', { class: 'shelf-more' },
          current > 0 ? el('button', { class: 'btn secondary', type: 'button', onclick: () => { current--; lit = null; render(); } }, `← ${caseName(current - 1)}`) : null,
          current < cases - 1 ? el('button', { class: 'btn secondary', type: 'button', onclick: () => { current++; lit = null; render(); } }, `${caseName(current + 1)} →`) : null);
        const lede = books.length
          ? `${books.length === 1 ? 'Book' : 'Books'} ${books[0].no}${books.length > 1 ? `–${books[books.length - 1].no}` : ''}. Every follower gets a book. Is yours here?`
          : 'Every follower gets a book, and these shelves are still empty.';
        panel.replaceChildren(
          closeButton(close),
          el('div', { class: 'shelf-head' },
            el('div', {}, el('p', { class: 'kicker' }, FRIENDS_ROOM), el('h2', {}, caseName(current)), el('p', { class: 'lede' }, lede)),
            search),
          found,
          caseEl,
          nav,
        );
        if (lit) caseEl.querySelector('.highlight')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }

      function showFriend(f) {
        const since = sinceLabel(f.added);
        panel.replaceChildren(
          closeButton(close),
          el('div', { class: 'book-card' },
            coverEl(asBook(f)),
            el('div', {},
              el('p', { class: 'lede', style: { margin: 0 } }, `${FRIENDS_ROOM} · ${caseName(caseOf(sorted.indexOf(f), cases))}`),
              el('h2', {}, f.name),
              el('p', { class: 'read-count' }, 'Book ', el('strong', {}, `no. ${f.no}`)),
              el('p', { style: { color: 'var(--ink-soft)', fontSize: '16px' } },
                since ? `On the shelf since ${since}. ` : '',
                'Every friend of the library gets a book in this room. Its pages are still blank, waiting for whatever they’d like to write.'),
              el('div', { class: 'row' },
                el('button', { class: 'btn', type: 'button', autofocus: true, onclick: () => { lit = f.id; render(); } }, '← Put it back')),
            )),
        );
        panel.querySelector('.btn')?.focus();
      }

      render();
      // Rows are measured against the panel, which is only on screen after this returns.
      requestAnimationFrame(() => panel.isConnected && render());
      return panel;
    },
  });
}
