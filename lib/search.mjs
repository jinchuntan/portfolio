/** Accent-insensitive, literal token search. Never interprets visitor input as markup or regex. */
export const normalize = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('en');
export function matches(text, query) {
  const haystack = normalize(text);
  return normalize(query).trim().split(/\s+/).every(token => haystack.includes(token));
}
export function filterEntries(entries, query, category = 'All') {
  return entries.filter(entry => (category === 'All' || entry.category === category) && matches(entry.text, query));
}
