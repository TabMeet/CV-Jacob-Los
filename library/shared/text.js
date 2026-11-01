// Tidying up what people write, the same way on the server and in the local edition.

export const MIN_WORDS = 12;
export const MAX_CHARS = 60_000;

export function wordCount(text) {
  return String(text ?? '').trim().split(/\s+/).filter(Boolean).length;
}

/** Normalise line endings and strip control characters; keep everything else as written. */
export function cleanText(text) {
  return String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

export function cleanTitle(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, 90);
}

export function timeOfDay(hour) {
  const h = Number.isInteger(hour) && hour >= 0 && hour < 24 ? hour : new Date().getHours();
  if (h < 5) return 'the middle of the night';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'late evening';
}
