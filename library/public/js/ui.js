// Small DOM helpers: building elements safely, overlays, toasts.

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('--')) node.style.setProperty(k, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'html') node.innerHTML = v; // only ever used with our own SVG art
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, v);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const stack = [];
export const overlayOpen = () => stack.length > 0;

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select, [tabindex]:not([tabindex="-1"])';

/**
 * Open a modal layer. `build(close)` returns the content element.
 * Returns { close, root }.
 */
export function openLayer({ label, build, className = 'overlay', onClose, dismissable = true }) {
  const previous = document.activeElement;
  const root = el('div', { class: className, role: 'dialog', 'aria-modal': 'true', 'aria-label': label });
  let closed = false;

  const close = (reason) => {
    if (closed) return;
    closed = true;
    const i = stack.indexOf(entry);
    if (i >= 0) stack.splice(i, 1);
    root.classList.add('closing');
    setTimeout(() => root.remove(), prefersReducedMotion() ? 0 : 260);
    onClose?.(reason);
    if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
  };

  const entry = { root, close, dismissable };
  root.append(build(close));
  if (dismissable && className === 'overlay') {
    root.addEventListener('pointerdown', (e) => {
      if (e.target === root) close('backdrop');
    });
  }
  document.getElementById('overlays').append(root);
  stack.push(entry);
  requestAnimationFrame(() => {
    const target = root.querySelector('[autofocus]') ?? root.querySelector(FOCUSABLE);
    target?.focus({ preventScroll: true });
  });
  return { close, root };
}

export function closeAllLayers() {
  for (const entry of [...stack].reverse()) entry.close('all');
}

document.addEventListener('keydown', (e) => {
  const top = stack[stack.length - 1];
  if (!top) return;
  if (e.key === 'Escape' && top.dismissable) {
    e.preventDefault();
    top.close('escape');
  } else if (e.key === 'Tab') {
    // keep focus inside the top layer
    const items = [...top.root.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

export function closeButton(close) {
  return el('button', { class: 'close', type: 'button', 'aria-label': 'Close', onclick: () => close('button') }, '×');
}

export function toast(text, { icon = null, ms = 6000 } = {}) {
  const box = document.getElementById('toasts');
  const t = el('div', { class: 'toast' }, icon ? el('span', { class: 'toast-icon', html: icon }) : null, el('span', {}, text));
  box.append(t);
  while (box.children.length > 3) box.firstElementChild.remove();
  setTimeout(() => {
    t.classList.add('out');
    setTimeout(() => t.remove(), 500);
  }, ms);
}

export function plural(n, one, many = `${one}s`) {
  return `${n.toLocaleString()} ${n === 1 ? one : many}`;
}

export function readsLabel(n) {
  if (n === 0) return 'Not read yet';
  if (n === 1) return 'Read once';
  if (n === 2) return 'Read twice';
  return `Read ${n.toLocaleString()} times`;
}

export function timeAgo(at) {
  const s = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return m === 1 ? 'a minute ago' : `${m} minutes ago`;
  const h = Math.round(m / 60);
  return h === 1 ? 'an hour ago' : `${h} hours ago`;
}
