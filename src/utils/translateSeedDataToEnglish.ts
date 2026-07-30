/**
 * Detect Cyrillic characters in a string. Used by the dev-mode validator
 * to ensure no Russian seed text leaked into the displayed dataset.
 */
const CYRILLIC_RE = /[Ѐ-ӿԀ-ԯ]/;

export function hasCyrillic(value: string): boolean {
  return CYRILLIC_RE.test(value);
}
