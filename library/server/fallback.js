// Offline helpers, used when no AI is configured or when an AI call fails.
// They're simple on purpose: the library should keep working with no API key.

import { GENRES, isGenre } from './genres.js';

const STOP = new Set(`first last next really maybe since though until upon onto towards something nothing
make makes making take took tell told give gave find found need needed keep kept seem seemed
a an and are as at be been but by for from had has have he her hers him his how i if in into is it its
just me my no not of on or our out she so than that the their them then there they this to too up us was we were what
when where which who why will with would you your yours i'm it's don't didn't can't was all one about over very like
could should more some any only also back after before down again still even much many every each own same other
little know said says say got get going went come came make made think thought want wanted look looked felt feel
day days time times way ever never always nothing something someone anything everything because while through am do did`.split(/\s+/));

const KEYWORDS = {
  life: ['remember', 'mother', 'father', 'grandmother', 'grandfather', 'childhood', 'years', 'hospital', 'school', 'my mom', 'my dad', 'growing up', 'true story', 'happened'],
  letters: ['dear', 'love,', 'yours,', 'sincerely', 'diary', 'today i', 'i miss you', 'letter', 'p.s.'],
  poetry: ['poem', 'verse'],
  essays: ['perhaps', 'society', 'meaning', 'believe', 'think about', 'we often', 'question', 'truth', 'why do we', 'i wonder'],
  literary: ['kitchen', 'window', 'quiet', 'evening', 'silence', 'marriage', 'village', 'century', 'war'],
  romance: ['kiss', 'love', 'heart', 'lover', 'her eyes', 'his eyes', 'wedding', 'date', 'longing', 'together'],
  mystery: ['detective', 'murder', 'police', 'clue', 'suspect', 'body', 'crime', 'secret', 'alibi', 'disappeared', 'killer'],
  fantasy: ['dragon', 'magic', 'spell', 'wizard', 'witch', 'kingdom', 'sword', 'elf', 'fairy', 'enchanted', 'quest', 'realm'],
  scifi: ['robot', 'planet', 'spaceship', 'galaxy', 'android', 'future', 'alien', 'laser', 'starship', 'orbit', 'ai ', 'colony'],
  horror: ['ghost', 'blood', 'scream', 'haunted', 'dark', 'monster', 'corpse', 'shadow', 'demon', 'terror', 'grave'],
  humor: ['funny', 'laughed', 'ridiculous', 'joke', 'hilarious', 'awkward', 'oops', 'chaos', 'absurd'],
  fables: ['once upon a time', 'the fox', 'the rabbit', 'the bear', 'moral', 'the king', 'princess', 'little', 'happily ever after'],
};

export function wordsOf(text) {
  return (text.toLowerCase().match(/[a-zà-ÿ'’]+/g) ?? []).map((w) => w.replace(/’/g, "'"));
}

export function guessGenre(text) {
  const lower = ` ${text.toLowerCase()} `;
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const avgLine = lines.reduce((s, l) => s + l.length, 0) / Math.max(lines.length, 1);

  const scores = Object.fromEntries(GENRES.map((g) => [g.id, 0]));
  for (const [genre, words] of Object.entries(KEYWORDS)) {
    for (const w of words) {
      const hits = lower.split(w).length - 1;
      scores[genre] += Math.min(hits, 4);
    }
  }
  // Many short lines usually means a poem.
  if (lines.length >= 4 && avgLine < 45) scores.poetry += 6;
  // Opens like a letter.
  if (/^\s*(dear|to my|hi |hello )/i.test(text)) scores.letters += 6;
  // First person past tense with family words reads like a life story.
  const firstPerson = (lower.match(/\b(i|my|me)\b/g) ?? []).length / Math.max(wordsOf(text).length, 1);
  if (firstPerson > 0.04) scores.life += 2;

  const [best, score] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (score >= 2 && isGenre(best)) return best;
  return firstPerson > 0.04 ? 'life' : 'literary';
}

function titleCase(s) {
  const small = new Set(['a', 'an', 'the', 'of', 'in', 'on', 'and', 'to', 'for', 'at', 'by', 'with']);
  return s
    .split(/\s+/)
    .map((w, i) => (i > 0 && small.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

/** Words worth searching for: no stopwords, no tiny words. */
export function keywords(text) {
  return [...new Set(wordsOf(text).filter((w) => w.length > 3 && !STOP.has(w)))];
}

const TRAILING = new Set([...STOP, 'i', 'a', 'an', 'the', 'to', 'of', 'and', 'my', 'in', 'on']);

/** A few plausible titles: recurring words, and the opening phrase. */
export function guessTitles(text) {
  const counts = new Map();
  for (const w of wordsOf(text)) {
    if (w.length < 4 || STOP.has(w) || w.endsWith('ly')) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length).map(([w]) => w);
  const titles = [];
  const firstLine = text.trim().split(/\n|(?<=[.!?,;:])\s/)[0]?.replace(/[^\p{L}\p{N}' ]/gu, '').trim() ?? '';
  const opening = firstLine.split(/\s+/).slice(0, 6);
  while (opening.length > 2 && TRAILING.has(opening[opening.length - 1].toLowerCase())) opening.pop();
  if (opening.length >= 2 && opening.length <= 6) titles.push(titleCase(opening.join(' ')));
  if (top[0]) titles.push(titleCase(`The ${top[0]}`));
  if (top[0] && top[1] && top[1].length >= 5) titles.push(titleCase(`Of ${top[0]} and ${top[1]}`));
  if (titles.length < 3) titles.push('Untitled, but Not Unloved');
  return [...new Set(titles)].slice(0, 3);
}

export function summarise(text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > 220 ? `${clean.slice(0, 217)}…` : clean;
}

export function themesOf(text) {
  const counts = new Map();
  for (const w of wordsOf(text)) {
    if (w.length < 4 || STOP.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w]) => w);
}

// Very small safety net for when there's no AI to read submissions.
export function basicModeration(text) {
  const links = (text.match(/https?:\/\/|www\./gi) ?? []).length;
  if (links >= 3) return { accepted: false, reason: 'The library doesn’t shelve advertisements or lists of links.' };
  const letters = (text.match(/\p{L}/gu) ?? []).length;
  if (letters < text.length * 0.5) return { accepted: false, reason: 'This doesn’t look quite like writing yet.' };
  if (/(.)\1{14,}/.test(text)) return { accepted: false, reason: 'This doesn’t look quite like writing yet.' };
  const words = wordsOf(text);
  const unique = new Set(words).size;
  if (words.length > 40 && unique / words.length < 0.15) return { accepted: false, reason: 'This seems to repeat itself rather a lot.' };
  return { accepted: true, reason: '' };
}

const CRISIS = /\b(kill myself|end my life|suicid|want to die|don'?t want to (live|be here)|self[- ]?harm|cut myself|no reason to live)\b/i;

export function soundsLikeCrisis(text) {
  return CRISIS.test(text);
}

// Words people use when asking the librarian for a mood, mapped to shelves.
const MOOD_TO_GENRE = {
  life: ['true', 'real', 'memoir', 'life', 'grief', 'loss', 'lonely', 'alone', 'family', 'mother', 'father', 'heal'],
  letters: ['letter', 'letters', 'diary', 'journal', 'unsent'],
  poetry: ['poem', 'poems', 'poetry', 'verse'],
  essays: ['essay', 'think', 'thoughts', 'reflect', 'ideas', 'meaning'],
  literary: ['literary', 'quiet', 'slow', 'beautiful'],
  romance: ['love', 'romance', 'romantic', 'heartbreak', 'crush'],
  mystery: ['mystery', 'crime', 'detective', 'thriller', 'suspense', 'murder'],
  fantasy: ['fantasy', 'magic', 'dragon', 'dragons', 'wizard', 'fairy'],
  scifi: ['scifi', 'sci-fi', 'space', 'future', 'robot', 'robots', 'science'],
  horror: ['horror', 'scary', 'ghost', 'ghosts', 'creepy', 'spooky', 'frighten'],
  humor: ['funny', 'laugh', 'humor', 'humour', 'cheer', 'silly', 'comedy', 'smile'],
  fables: ['fable', 'fairy', 'tale', 'tales', 'children', 'kids', 'bedtime', 'animals'],
};

export function genreFromRequest(text) {
  const words = new Set(wordsOf(text));
  for (const [genre, list] of Object.entries(MOOD_TO_GENRE)) {
    if (list.some((w) => words.has(w))) return genre;
  }
  return null;
}
