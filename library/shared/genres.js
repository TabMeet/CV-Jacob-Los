// The shelves of the library, in the order you pass them walking in.
// `id` is stored in the database; `name` is what the brass plaque says;
// `hint` is given to the AI (and the offline fallback) to decide where a story belongs.

export const GENRES = [
  { id: 'life', name: 'Life Stories', hint: 'true or true-feeling personal stories, memoir, things that happened to the writer' },
  { id: 'letters', name: 'Letters & Diaries', hint: 'unsent letters, diary entries, notes addressed to someone' },
  { id: 'poetry', name: 'Poetry', hint: 'poems, verse, lyrical fragments with line breaks' },
  { id: 'essays', name: 'Essays & Reflections', hint: 'thoughts, opinions, reflections and musings about life, ideas or the world' },
  { id: 'literary', name: 'Literary Fiction', hint: 'character-driven fiction about ordinary life, relationships, quiet drama, historical fiction' },
  { id: 'romance', name: 'Romance', hint: 'stories centred on love, longing and relationships' },
  { id: 'mystery', name: 'Mystery & Crime', hint: 'detectives, crimes, secrets, suspense, thrillers' },
  { id: 'fantasy', name: 'Fantasy', hint: 'magic, myths, dragons, invented worlds' },
  { id: 'scifi', name: 'Science Fiction', hint: 'the future, space, technology, robots, other planets' },
  { id: 'horror', name: 'Horror & Ghost Stories', hint: 'fear, ghosts, the uncanny, monsters, dread' },
  { id: 'humor', name: 'Humor', hint: 'funny stories, comedy, absurdity, satire' },
  { id: 'fables', name: 'Fables & Fairy Tales', hint: "fairy tales, fables, bedtime stories, children's stories, talking animals" },
];

export const GENRE_IDS = GENRES.map((g) => g.id);

export function isGenre(id) {
  return GENRE_IDS.includes(id);
}

export function genreName(id) {
  return GENRES.find((g) => g.id === id)?.name ?? 'Uncategorised';
}
