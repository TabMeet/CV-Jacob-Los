// Sitting down to read: an open book under a lamp, turned page by page.

import { el, openLayer, closeButton, toast } from './ui.js';
import { api } from './api.js';

function paragraphs(body) {
  const blocks = /\n\s*\n/.test(body) ? body.split(/\n\s*\n/) : body.split('\n');
  return blocks
    .map((b) => b.replace(/^\n+|\s+$/g, ''))
    .filter((b) => b.trim())
    .map((b) => {
      const lines = b.split('\n');
      const avg = lines.reduce((s, l) => s + l.length, 0) / lines.length;
      const verse = lines.length > 1 && avg < 70;
      return { text: verse ? b : lines.join(' '), verse };
    });
}

function endingText(reads, firstTime) {
  if (reads <= 1 && firstTime) {
    return {
      count: 'The first reader',
      line: 'You are the very first person to read this. Somewhere, someone wrote it hoping that one day, someone would. Today that was you.',
    };
  }
  return {
    count: `${reads.toLocaleString()} readers`,
    line: `You are one of ${reads.toLocaleString()} people who have sat with these pages. Someone, somewhere, wrote this, and you read it. Neither of you is alone.`,
  };
}

export async function openReader({ book: meta, librarianName, onClose, onAskForAnother, onEnd }) {
  let book;
  let readInfo = { reads: meta.reads ?? 0, firstTime: false };
  try {
    [book, readInfo] = await Promise.all([api(`/api/books/${meta.id}`), api(`/api/books/${meta.id}/read`, { method: 'POST' })]);
  } catch (err) {
    toast(err.status === 404 ? 'That book seems to have been taken off the shelves.' : err.message);
    onClose?.();
    return;
  }

  let page = 0;
  let pages = 1;
  let finished = false;

  openLayer({
    label: `Reading ${book.title}`,
    className: 'reading-room',
    onClose,
    build: (close) => {
      const flow = el('div', { class: 'flow' });
      const pagesEl = el('div', { class: 'pages' }, flow);
      const folioL = el('span', { class: 'folio left', 'aria-hidden': 'true' });
      const folioR = el('span', { class: 'folio right', 'aria-hidden': 'true' });
      const status = el('span', { class: 'sr-only', 'aria-live': 'polite' });
      const prevBtn = el('button', { class: 'page-turn prev', type: 'button', 'aria-label': 'Previous page', onclick: () => turn(-1) });
      const nextBtn = el('button', { class: 'page-turn next', type: 'button', 'aria-label': 'Next page', onclick: () => turn(1) });
      const bookEl = el('div', { class: 'open-book' }, pagesEl, prevBtn, nextBtn, folioL, folioR, status);

      // Title page, the story, and the ending.
      flow.append(el('h1', {}, book.title), el('div', { class: 'orn', 'aria-hidden': 'true' }, '❦'));
      paragraphs(book.body).forEach((p, i) => {
        const cls = [p.verse && 'verse', i === 0 && 'first', i === 0 && !p.verse && p.text.length > 140 && 'dropcap'].filter(Boolean).join(' ');
        flow.append(el('p', { class: cls || null }, p.text));
      });
      const end = endingText(readInfo.reads, readInfo.firstTime);
      flow.append(
        el('div', { class: 'the-end' },
          el('div', { class: 'fin' }, '— the end —'),
          el('p', { class: 'together' }, el('span', { class: 'count' }, end.count), end.line),
          el('div', { class: 'row' },
            el('button', { class: 'btn', type: 'button', onclick: () => { close('done'); onEnd?.(book); } }, 'Put it back on the shelf'),
            el('button', { class: 'btn secondary', type: 'button', onclick: () => { close('another'); onAskForAnother?.(); } }, `Ask ${librarianName} for another`),
          ),
        ),
      );

      let spread = 2;
      let step = 0;
      let colW = 0;
      let gap = 0;

      function layout() {
        const w = bookEl.clientWidth;
        spread = w >= 860 ? 2 : 1;
        bookEl.classList.toggle('single', spread === 1);
        const bw = bookEl.clientWidth;
        const margin = Math.round(Math.max(22, Math.min(64, bw * 0.065)));
        colW = spread === 2 ? (bw - 4 * margin) / 2 : bw - 2 * margin;
        gap = 2 * margin;
        step = bw;
        Object.assign(flow.style, {
          marginLeft: `${margin}px`,
          width: `${bw - 2 * margin}px`,
          columnCount: String(spread),
          columnGap: `${gap}px`,
          columnWidth: 'auto',
        });
        const cols = Math.max(1, Math.round((flow.scrollWidth + gap) / (colW + gap)));
        pages = Math.max(1, Math.ceil(cols / spread));
        page = Math.min(page, pages - 1);
        show(false);
      }

      function show(animate = true) {
        flow.style.transition = animate ? '' : 'none';
        flow.style.transform = `translateX(${-page * step}px)`;
        prevBtn.hidden = page === 0;
        nextBtn.hidden = page >= pages - 1;
        const first = page * spread + 1;
        const totalPages = pages * spread;
        folioL.textContent = String(first);
        folioL.textContent = spread === 2 ? String(first) : '';
        folioR.textContent = spread === 2 ? `${first + 1} of ${totalPages}` : `${first} of ${totalPages}`;
        status.textContent = `Page ${first} of ${totalPages}`;
        // Keep buttons on hidden pages out of the tab order.
        for (const b of flow.querySelectorAll('button')) b.tabIndex = page >= pages - 1 ? 0 : -1;
        if (page >= pages - 1 && !finished) {
          finished = true;
          api(`/api/books/${book.id}/finish`, { method: 'POST' }).catch(() => {});
        }
      }

      function turn(d) {
        const next = Math.max(0, Math.min(pages - 1, page + d));
        if (next === page) return;
        page = next;
        show(true);
      }

      const onKey = (e) => {
        if (!document.contains(bookEl)) return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.target.closest('button'))) {
          e.preventDefault();
          turn(1);
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          turn(-1);
        }
      };
      addEventListener('keydown', onKey);

      let startX = null;
      pagesEl.addEventListener('pointerdown', (e) => { startX = e.clientX; });
      pagesEl.addEventListener('pointerup', (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 40) turn(dx < 0 ? 1 : -1);
      });

      const ro = new ResizeObserver(() => layout());
      requestAnimationFrame(() => {
        layout();
        ro.observe(bookEl);
        document.fonts?.ready.then(layout);
      });

      const flag = el('button', { class: 'btn', type: 'button', onclick: () => confirmReport(book, librarianName) }, '⚑', el('span', {}, ' Report'));
      const bar = el('div', { class: 'reader-bar' },
        el('button', { class: 'btn', type: 'button', onclick: () => close('back') }, '←', el('span', {}, ' Back to the hall')),
        el('div', { class: 'reader-title' }, book.title),
        flag,
      );

      const root = el('div', { style: { display: 'contents' } }, bar, bookEl, el('p', { class: 'reader-foot' }, 'Turn pages with ← → or by tapping the edges.'));
      const cleanup = new MutationObserver(() => {
        if (!document.contains(bookEl)) {
          removeEventListener('keydown', onKey);
          ro.disconnect();
          cleanup.disconnect();
        }
      });
      requestAnimationFrame(() => cleanup.observe(document.getElementById('overlays'), { childList: true }));
      return root;
    },
  });
}

function confirmReport(book, librarianName) {
  openLayer({
    label: 'Report this book',
    build: (close) =>
      el('div', { class: 'panel', style: { width: 'min(520px, 100%)' } },
        closeButton(close),
        el('h2', {}, `Hand it to ${librarianName}?`),
        el('p', {}, 'The library welcomes stories about anything, including painful things. But if this one is spam, attacks people for who they are, or exposes a real person, let her know. Once a few readers have flagged it, it comes off the shelves.'),
        el('div', { class: 'row' },
          el('button', {
            class: 'btn',
            type: 'button',
            onclick: async () => {
              try {
                await api(`/api/books/${book.id}/report`, { method: 'POST' });
                toast(`Thank you. ${librarianName} will keep an eye on it.`);
              } catch (err) {
                toast(err.message);
              }
              close('reported');
            },
          }, 'Yes, flag it'),
          el('button', { class: 'btn secondary', type: 'button', autofocus: true, onclick: () => close('cancel') }, 'Never mind'),
        ),
      ),
  });
}
