// Entry point of the local edition: the whole library in one file, no server,
// no API key. Built into dist/quiet-library-local.html by `npm run build:local`.

import { backend } from './local/setup.js'; // first: swaps in the in-browser backend
import { createStudio } from './local/studio.js';
import { toast } from './ui.js';
import { local } from './api.js';
import './main.js';

addEventListener('library:ready', (e) => {
  e.detail.backend = backend; // for the filming scripts in promo/
  createStudio({ backend, lib: e.detail });
  if (!local.get('ql.local.welcomed', false)) {
    local.set('ql.local.welcomed', true);
    setTimeout(() => toast('Local edition: everything is saved in this browser. Press S (or the Studio button) for filming tools.', { ms: 9000 }), 1200);
  }
}, { once: true });
