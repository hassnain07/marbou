/** Builds /search?q=...&city=... (city is a `sudanCities` id, "" = all Sudan). */
export function buildSearchUrl(q: string, city: string): string {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (city) params.set('city', city);
  const qs = params.toString();
  return `/search${qs ? `?${qs}` : ''}`;
}
