// Builds the local edition: the whole library in ONE html file that runs by
// double-clicking it. No server, no install, no API key.
//
//   npm run build:local   ->   dist/quiet-library-local.html
//
// The fonts (all SIL Open Font License) are embedded when the build machine is
// online, so the file looks the same without internet. If they can't be
// downloaded, the file links to Google Fonts instead.

import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const out = join(root, 'dist', 'quiet-library-local.html');

const html = readFileSync(join(pub, 'index.html'), 'utf8');
const fontsHref = html.match(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com[^"]+)">/)?.[1];

async function embeddedFonts() {
  if (!fontsHref) return null;
  try {
    const css = await (await fetch(fontsHref.replace(/&amp;/g, '&'), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' },
    })).text();
    // Google serves one @font-face per alphabet. Keep Latin (covers é, ë, ö, ñ and friends);
    // rarer letters fall back to the system serif.
    const blocks = [...css.matchAll(/\/\* latin \*\/\s*(@font-face\s*{[^}]+})/g)].map((m) => m[1]);
    if (!blocks.length) throw new Error('no font faces found');
    const urls = [...new Set(blocks.flatMap((b) => [...b.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1])))];
    const data = new Map();
    await Promise.all(urls.map(async (u) => {
      const res = await fetch(u);
      if (!res.ok) throw new Error(`${res.status} for ${u}`);
      data.set(u, Buffer.from(await res.arrayBuffer()).toString('base64'));
    }));
    return blocks.map((b) => b.replace(/url\((https:[^)]+)\)/g, (_, u) => `url(data:font/woff2;base64,${data.get(u)})`)).join('\n');
  } catch (err) {
    console.warn(`! Could not embed fonts (${err.message}); the file will load them from Google Fonts when online.`);
    return null;
  }
}

const bundle = await build({
  entryPoints: [join(pub, 'js', 'local-main.js')],
  bundle: true,
  format: 'iife',
  write: false,
  target: ['chrome110', 'edge110', 'firefox115', 'safari16'],
  legalComments: 'none',
  charset: 'utf8',
});
const js = bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

const fonts = await embeddedFonts();
const css = [fonts, readFileSync(join(pub, 'css', 'library.css'), 'utf8'), readFileSync(join(pub, 'css', 'studio.css'), 'utf8')]
  .filter(Boolean)
  .join('\n')
  .replace(/<\/style/gi, '<\\/style');

let page = html
  .replace(/\s*<link rel="stylesheet" href="css\/library\.css">/, '')
  .replace(/\s*<script type="module" src="js\/main\.js"><\/script>/, '')
  .replace('<title>The Quiet Library</title>', '<title>The Quiet Library · local edition</title>');
if (fonts) page = page.replace(/\s*<link rel="preconnect"[^>]*>/g, '').replace(/\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, '');
page = page
  .replace('</head>', `  <style>\n${css}\n  </style>\n</head>`)
  .replace('</body>', `<script>\n${js}\n</script>\n</body>`)
  .replace('<html lang="en">', '<html lang="en">\n<!-- The Quiet Library, local edition. Built from library/ with `npm run build:local`. Double-click to open. -->');

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, page);
console.log(`Built ${out.replace(`${root}/`, '')} (${(page.length / 1024).toFixed(0)} KB${fonts ? ', fonts embedded' : ''}).`);
