/** localStorage helpers (safe in private mode / SSR). */
const P = 'ml_';
export function load(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try { const v = localStorage.getItem(P + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}
export function save(key, value) {
  try { localStorage.setItem(P + key, JSON.stringify(value)); } catch (e) { /* storage full / blocked */ }
}
