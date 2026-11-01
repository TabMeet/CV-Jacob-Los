// The front desk, where the librarian helps you find something to read.

import { el, openLayer, closeButton, readsLabel } from './ui.js';
import { api, local, session } from './api.js';
import { librarianPortraitSVG, spineStyle } from './art.js';

const SUGGESTIONS = [
  'Something comforting',
  'I feel a bit lonely tonight',
  'Make me laugh',
  'A story about losing someone',
  'Something nobody has read yet',
  'Surprise me',
];

function greeting(name, returning) {
  const h = new Date().getHours();
  const time = h < 5 ? 'Still awake, dear? So am I.' : h < 12 ? 'Good morning, dear.' : h < 18 ? 'Good afternoon, dear.' : 'Good evening, dear.';
  if (returning) return `${time} Welcome back. Your chair's still warm. What are you in the mood for today?`;
  return `${time} Welcome to the library. Everything on these shelves was written by someone who walked in just like you, and not one book has a name on it. The only thing anyone knows about a book is how many people have read it. Now, what are you looking for?`;
}

export function openDesk({ config, genres, onRead, onShowShelf, onClose }) {
  const name = config.librarian;
  const history = session.get('ql.desk', []);
  const returning = local.get('ql.visited', false);
  local.set('ql.visited', true);

  openLayer({
    label: `${name} at the front desk`,
    onClose,
    build: (close) => {
      const speech = el('div', { class: 'speech', 'aria-live': 'polite' });
      const recs = el('div', { class: 'recs' });
      const input = el('input', {
        type: 'text',
        name: 'ask',
        maxlength: '400',
        autocomplete: 'off',
        placeholder: 'Tell her what you’re looking for…',
        'aria-label': `What would you like to ask ${name}?`,
        autofocus: true,
      });
      const askBtn = el('button', { class: 'btn', type: 'submit' }, 'Ask');
      let busy = false;

      const lastReply = [...history].reverse().find((t) => t.role === 'librarian');
      say(lastReply && history.length ? lastReply.text : greeting(name, returning));

      function say(text) {
        speech.classList.remove('thinking');
        speech.textContent = text;
      }

      function shelfName(id) {
        return genres.find((g) => g.id === id)?.name ?? '';
      }

      function showBooks(books, walkTo) {
        recs.replaceChildren();
        for (const b of books) {
          const s = spineStyle(b);
          recs.append(
            el(
              'div',
              { class: 'rec', '--spine': s.color },
              el('span', { class: 'mini-spine', 'aria-hidden': 'true' }),
              el(
                'div',
                {},
                el('span', { class: 'rec-title' }, b.title),
                el('span', { class: 'rec-meta' }, `${shelfName(b.genre)} · ${readsLabel(b.reads)}`),
                el(
                  'div',
                  { class: 'row' },
                  el('button', { class: 'btn', type: 'button', onclick: () => { close('read'); onRead(b); } }, 'Read it'),
                  el('button', { class: 'btn secondary', type: 'button', onclick: () => { close('shelf'); onShowShelf(b.genre, b.id); } }, 'On the shelf'),
                ),
              ),
            ),
          );
        }
        if (!books.length && walkTo) {
          recs.append(
            el('button', { class: 'btn secondary', type: 'button', onclick: () => { close('shelf'); onShowShelf(walkTo); } }, `Show me the ${shelfName(walkTo)} shelf`),
          );
        }
      }

      async function ask(text) {
        const message = text.trim();
        if (!message || busy) return;
        busy = true;
        askBtn.disabled = true;
        input.value = '';
        recs.replaceChildren();
        speech.textContent = 'Let me think';
        speech.classList.add('thinking');
        try {
          const res = await api('/api/librarian', { method: 'POST', body: { message, history, hour: new Date().getHours() } });
          history.push({ role: 'visitor', text: message }, { role: 'librarian', text: res.reply });
          history.splice(0, Math.max(0, history.length - 12));
          session.set('ql.desk', history);
          say(res.reply);
          showBooks(res.books, res.walkTo);
        } catch (err) {
          say(err.status === 429 ? err.message : 'Oh dear, I seem to have lost my train of thought. Could you ask me again?');
        } finally {
          busy = false;
          askBtn.disabled = false;
          input.focus();
        }
      }

      const form = el('form', { class: 'ask', onsubmit: (e) => { e.preventDefault(); ask(input.value); } }, input, askBtn);
      const chips = el('div', { class: 'chips' }, SUGGESTIONS.map((s) => el('button', { class: 'chip', type: 'button', onclick: () => ask(s) }, s)));

      return el(
        'div',
        { class: 'panel desk-panel' },
        closeButton(close),
        el('div', { class: 'desk-top' }, el('div', { class: 'portrait', html: librarianPortraitSVG() }), el('div', {}, el('h2', { style: { fontSize: '22px', margin: '0 0 8px' } }, name), speech)),
        form,
        chips,
        recs,
      );
    },
  });
}
