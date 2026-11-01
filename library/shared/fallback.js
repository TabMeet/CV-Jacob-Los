// Offline helpers, used when no AI is configured or when an AI call fails.
// They're simple on purpose: the library should keep working with no API key.

import { GENRES, isGenre, genreName } from './genres.js';
import { LIBRARIAN, CAT } from './characters.js';

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

// ---------------------------------------------------------------------------
// The librarian without AI: a handful of kind, mood-aware replies.

const pick = (list) => list[Math.floor(Math.random() * list.length)];

const MOOD_LINES = [
  { test: /\b(lonely|alone|no one|nobody (cares|understands)|isolated)\b/i, genre: 'life',
    lines: ['Then you’ve come to the right place, dear. Everyone on these shelves has felt that way at some point. Start with this one.', 'Sit a while, dear. You’re not the only one who has felt that. These were written by people who have.'] },
  { test: /\b(grief|griev|loss|lost (my|a|someone)|losing|died|death|passed away|miss (him|her|them))\b/i, genre: 'life',
    lines: ['Ah. Grief is heavy to carry on your own. These were written by people who have carried it too.', 'Oh, my dear. Take your time with these. There’s no hurry in here.'] },
  { test: /\b(laugh|funny|cheer|silly|smile|humou?r)\b/i, genre: 'humor',
    lines: [`A smile, is it? I know just the shelf. Mind you don’t laugh too loudly; ${CAT.name} is napping.`, 'Something to make you laugh. Here, these should do it.'] },
  { test: /\b(comfort|cosy|cozy|gentle|soft|calm|warm|kind)\b/i, genre: null,
    lines: ['Something gentle, then. About a cup of tea’s worth of reading.', 'Here, dear. These are like a warm blanket.'] },
  { test: /\b(scary|scare|ghost|horror|creepy|spooky|frighten)\b/i, genre: 'horror',
    lines: ['Brave, aren’t you? Keep the lamp on for this one.', 'I wouldn’t read these alone. Mind you, you’re not alone in here.'] },
  { test: /\b(love|romance|romantic|heartbreak|crush)\b/i, genre: 'romance',
    lines: ['Ah, love. We have a whole shelf of hearts, dear.', 'Love stories. I still read one most evenings, you know.'] },
  { test: /\b(hope|hopeful|uplift|inspir)\b/i, genre: null,
    lines: ['Hope. Yes, we keep plenty of that here.', 'These ones end with the window open, so to speak.'] },
];

/**
 * @param {string} message
 * @param {{ random(n: number, opts?: object): object[], search(words: string[], n: number): object[] }} store
 */
export function offlineLibrarian(message, store) {
  const text = String(message ?? '');
  if (soundsLikeCrisis(text)) {
    return {
      reply: `Oh, my dear. I’m so glad you told me. You matter, and you don’t have to carry this alone. Please reach out to someone right now: a person you trust, your local emergency number, or a free helpline (findahelpline.com lists them). I’ll keep a chair warm for you here.`,
      bookIds: store.random(1, { genre: 'life' }).map((b) => b.id),
      walkTo: null,
    };
  }

  // Small talk first.
  if (/\b(who wrote|author|writer of|wrote this|who made)\b/i.test(text)) {
    return { reply: 'Nobody knows, dear, not even me. That’s rather the point. All we know is how many people have read it.', bookIds: [], walkTo: null };
  }
  if (new RegExp(`\\b(cat|kitty|${CAT.name})\\b`, 'i').test(text)) {
    return { reply: `That’s ${CAT.name}. Sits in the window and watches over everyone. Been here longer than I have, I sometimes think.`, bookIds: [], walkTo: null };
  }
  if (/\b(thank|thanks|lovely|sweet)\b/i.test(text) && text.length < 60) {
    return { reply: pick(['You’re very welcome, dear.', 'Any time. That’s what I’m here for.', 'Oh, it’s my pleasure, dear.']), bookIds: [], walkTo: null };
  }
  if (/\b(write|writing|my own story)\b/i.test(text) && !/\b(read|book about)\b/i.test(text)) {
    return { reply: 'The writing rooms are at the very back, dear. Close the door, take your time, and bring it to me when it’s done. I’ll find it a shelf.', bookIds: [], walkTo: null };
  }
  if (/^\s*(hi|hello|hey|good (morning|afternoon|evening))\b/i.test(text) && text.length < 40) {
    return { reply: `Hello, dear. I’m ${LIBRARIAN.name}. What are you in the mood for today?`, bookIds: [], walkTo: null };
  }

  const mood = MOOD_LINES.find((m) => m.test.test(text));
  const genre = genreFromRequest(text) ?? mood?.genre ?? null;
  const wantsUnread = /\b(unread|nobody has|no one has|first reader|new|fresh)\b/i.test(text);
  const surprise = /\b(surprise|anything|random|whatever|you choose|you pick)\b/i.test(text);

  let books = [];
  if (wantsUnread) books = store.random(3, { unreadFirst: true });
  if (!books.length && genre) books = store.random(3, { genre });
  if (!books.length && !surprise) books = store.search(keywords(text), 3);
  if (!books.length && (surprise || mood)) books = store.random(3);

  let reply;
  if (books.length && wantsUnread) reply = 'These are still waiting for their very first reader. Wouldn’t it be lovely to be the one?';
  else if (books.length && surprise) reply = pick(['Close your eyes and hold out your hand. There.', 'Let’s see what the shelves want you to read today.']);
  else if (books.length && mood) reply = pick(mood.lines);
  else if (books.length) reply = pick(['I think one of these might be what you’re after, dear. Take your time.', 'Ah, yes. Try one of these.']);
  else if (genre) reply = `I don’t have quite the thing on hand, I’m afraid. You might have a wander along the ${genreName(genre)} shelf, though.`;
  else reply = 'I’m not sure I have that one yet, dear. Perhaps it’s waiting for you to write it. The writing rooms are just at the back.';

  return { reply, bookIds: books.map((b) => b.id), walkTo: books.length ? null : genre };
}
