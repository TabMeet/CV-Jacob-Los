// The writing rooms at the back: a corridor of doors, and quiet rooms behind them.

import { el, openLayer, closeButton, toast, readsLabel, plural } from './ui.js';
import { api, drafts, yourBooks } from './api.js';
import { coverEl } from './shelf.js';

const ROOMS = 4;

function words(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function openCorridor(ctx) {
  const { getPresence, setZone } = ctx;
  setZone('writing');
  openLayer({
    label: 'The writing rooms',
    onClose: (reason) => {
      if (reason !== 'room') setZone(null);
    },
    build: (close) => {
      const zones = getPresence()?.zones ?? {};
      const doors = el('div', { class: 'doors' });
      for (let n = 1; n <= ROOMS; n++) {
        const others = zones[`writing:${n}`] ?? 0;
        const draft = drafts.get(n);
        const yours = draft.body.trim().length > 0;
        const sign = others ? (others === 1 ? 'someone is writing' : `${others} writing`) : yours ? 'your draft is here' : 'free';
        doors.append(
          el('button', {
            class: `room-door${others ? ' occupied' : ''}`,
            type: 'button',
            'aria-label': `Writing room ${n}: ${sign}`,
            onclick: () => {
              close('room');
              openRoom(n, ctx);
            },
          }, el('span', { class: 'glass' }, String(n)), el('span', { class: 'knob' }), el('span', { class: 'sign' }, sign)),
        );
      }

      const mine = yourBooks.list();
      const list = el('ul');
      const yourSection = mine.length
        ? el('section', { class: 'your-books' },
            el('h3', {}, 'Your books on the shelves'),
            el('p', { class: 'lede', style: { fontSize: '16px', margin: '0 0 8px' } }, 'Only this browser knows these are yours. Nobody else ever will.'),
            list)
        : null;
      for (const b of mine) {
        const count = el('span', { class: 'count' }, '…');
        const item = el('li', {}, el('span', {}, b.title), el('span', { class: 'row', style: { gap: '10px' } }, count,
          el('button', { class: 'btn quiet', type: 'button', onclick: () => takeDown(b, item) }, 'Take off the shelf')));
        list.append(item);
        api(`/api/books/${b.id}/card`)
          .then((card) => { count.textContent = readsLabel(card.reads); })
          .catch((err) => {
            if (err.status === 404) {
              count.textContent = 'no longer on the shelves';
              yourBooks.remove(b.id);
            } else count.textContent = '';
          });
      }

      return el('div', { class: 'panel corridor' },
        closeButton(close),
        el('h2', {}, 'The writing rooms'),
        el('p', { class: 'lede' }, 'A quiet corridor at the back of the library. Pick a room, close the door, and write about anything at all. When it’s finished, the librarian will bind it and find it a shelf.'),
        doors,
        yourSection,
      );
    },
  });
}

async function takeDown(book, item) {
  if (!confirm(`Take “${book.title}” off the shelves for good? This can’t be undone.`)) return;
  try {
    await api(`/api/books/${book.id}`, { method: 'DELETE', body: { key: book.key } });
    yourBooks.remove(book.id);
    item.remove();
    toast(`“${book.title}” has been taken off the shelves.`);
  } catch (err) {
    toast(err.message);
  }
}

function openRoom(n, ctx) {
  const { config, setZone, onPublished, beforePublish } = ctx;
  setZone(`writing:${n}`);
  const draft = drafts.get(n);

  openLayer({
    label: `Writing room ${n}`,
    className: 'room',
    onClose: (reason) => {
      if (reason !== 'published') {
        setZone(null);
        if (reason !== 'all') openCorridor(ctx);
      }
    },
    build: (close) => {
      const title = el('input', { class: 'title-input', id: `title-${n}`, type: 'text', maxlength: '90', placeholder: 'Your title', value: draft.title, autocomplete: 'off' });
      const mineRadio = el('input', { type: 'radio', name: `naming-${n}`, value: 'mine', checked: !draft.letLibraryName });
      const libRadio = el('input', { type: 'radio', name: `naming-${n}`, value: 'library', checked: draft.letLibraryName });
      const ideas = el('div', { class: 'title-ideas', 'aria-live': 'polite' });
      const ideasBtn = el('button', { class: 'btn quiet', type: 'button', onclick: suggest }, 'Ask the library for title ideas');
      const story = el('textarea', {
        class: 'story-input',
        'aria-label': 'Your story',
        placeholder: 'Write about anything. Something that happened, something you imagined, something you’ve never told anyone…',
        spellcheck: 'true',
      });
      story.value = draft.body;
      const count = el('span', { class: 'count', 'aria-live': 'polite' });
      const error = el('p', { class: 'form-error', role: 'alert' });
      const submit = el('button', { class: 'btn', type: 'button', onclick: publish }, 'Bring it to the front desk');

      function syncNaming() {
        const lib = libRadio.checked;
        title.disabled = lib;
        title.placeholder = lib ? 'The library will name it when you’re done' : 'Your title';
      }

      let saveTimer;
      function save() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => drafts.set(n, { title: title.value, body: story.value, letLibraryName: libRadio.checked }), 300);
        const w = words(story.value);
        count.textContent = w < config.minWords ? `${plural(w, 'word')} · at least ${config.minWords} to bind` : `${plural(w, 'word')} · saved on this device`;
      }

      async function suggest() {
        error.textContent = '';
        if (words(story.value) < config.minWords) {
          error.textContent = `Write at least ${config.minWords} words first, then the library can think of a title.`;
          return;
        }
        ideasBtn.disabled = true;
        ideasBtn.textContent = 'Thinking of titles…';
        try {
          const res = await api('/api/titles', { method: 'POST', body: { body: story.value } });
          ideas.replaceChildren(
            ...res.titles.map((t) =>
              el('button', {
                type: 'button',
                onclick: () => {
                  mineRadio.checked = true;
                  syncNaming();
                  title.value = t;
                  save();
                  title.focus();
                },
              }, t),
            ),
          );
        } catch (err) {
          error.textContent = err.message;
        } finally {
          ideasBtn.disabled = false;
          ideasBtn.textContent = 'Other ideas';
        }
      }

      async function publish() {
        error.textContent = '';
        const lib = libRadio.checked || !title.value.trim();
        if (words(story.value) < config.minWords) {
          error.textContent = `A book needs at least ${config.minWords} words. Keep going, you're nearly there.`;
          story.focus();
          return;
        }
        submit.disabled = true;
        submit.textContent = `${config.librarian} is reading the first page…`;
        beforePublish?.();
        try {
          const res = await api('/api/books', { method: 'POST', body: { title: lib ? '' : title.value, body: story.value, letLibraryName: lib } });
          drafts.clear(n);
          yourBooks.add({ id: res.book.id, title: res.book.title, key: res.deleteKey });
          close('published');
          onPublished(res);
        } catch (err) {
          error.textContent = err.message;
          submit.disabled = false;
          submit.textContent = 'Bring it to the front desk';
        }
      }

      title.addEventListener('input', save);
      story.addEventListener('input', save);
      mineRadio.addEventListener('change', () => { syncNaming(); save(); });
      libRadio.addEventListener('change', () => { syncNaming(); save(); });
      syncNaming();
      save();
      requestAnimationFrame(() => (story.value ? story : title.disabled ? story : title).focus());

      return el('div', { style: { display: 'contents' } },
        el('div', { class: 'room-window', 'aria-hidden': 'true' }, el('div', { class: 'drops' })),
        el('div', { class: 'writing-desk' },
          el('div', { class: 'room-bar' },
            el('h2', {}, `Writing room ${n}`),
            el('button', { class: 'btn', type: 'button', onclick: () => close('leave') }, 'Leave the room'),
          ),
          el('div', { class: 'sheet' },
            el('label', { for: `title-${n}` }, 'Title'),
            title,
            el('div', { class: 'name-choice', role: 'radiogroup', 'aria-label': 'Who names the book' },
              el('label', {}, mineRadio, 'I’ll name it myself'),
              el('label', {}, libRadio, 'Let the library name it'),
            ),
            el('div', { class: 'row', style: { gap: '6px' } }, ideasBtn),
            ideas,
            story,
            el('p', { class: 'anon-note' }, 'Everything in this library is anonymous: no names, no profiles, no dates. Please leave out anything that could identify you or someone real, like full names or addresses. The library will decide which shelf your book belongs on.'),
            error,
            el('div', { class: 'sheet-foot' }, count, submit),
          ),
        ),
      );
    },
  });
}

/** The moment a finished manuscript goes up on a shelf. */
export function showShelved(res, { config, onGoToShelf, onWriteAnother }) {
  openLayer({
    label: 'Your book has been shelved',
    build: (close) =>
      el('div', { class: 'panel shelved', style: { width: 'min(560px, 100%)' } },
        closeButton(close),
        coverEl(res.book),
        el('h2', {}, res.book.title),
        el('p', {}, `${config.librarian} reads the first page, smiles, and binds it in cloth. Your book now lives on the `, el('strong', {}, res.book.shelf), ' shelf.'),
        res.namedByLibrary ? el('p', { class: 'lede' }, 'The library gave it its title.') : null,
        res.wellbeingConcern
          ? el('div', { class: 'note-card' },
              `${config.librarian} slips a note into your hand: “Thank you for trusting the library with this. If things feel heavy right now, you don’t have to carry them alone. Please talk to someone you trust, or a free helpline: `,
              el('a', { href: 'https://findahelpline.com', target: '_blank', rel: 'noopener noreferrer' }, 'findahelpline.com'),
              ' lists them for your country.”')
          : null,
        el('p', { class: 'keep-key' }, 'This browser remembers that you wrote it, so you can see how often it’s read from the writing rooms, or take it off the shelf. Nobody else can see that it’s yours.'),
        el('div', { class: 'row', style: { justifyContent: 'center' } },
          el('button', { class: 'btn', type: 'button', autofocus: true, onclick: () => { close('shelf'); onGoToShelf(res.book.genre, res.book.id); } }, 'Go and see it on the shelf'),
          el('button', { class: 'btn secondary', type: 'button', onclick: () => { close('again'); onWriteAnother(); } }, 'Write another'),
        ),
      ),
  });
}
