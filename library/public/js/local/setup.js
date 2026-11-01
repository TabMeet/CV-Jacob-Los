// Must run before main.js: points the app at the in-browser backend.
import { useLocalBackend } from '../api.js';
import { createLocalBackend } from './backend.js';

export const backend = createLocalBackend();
useLocalBackend(backend);
document.documentElement.classList.add('local-edition');
