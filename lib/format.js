import { CONFIG } from './config';

/** 150 → "$150", 451.8 → "$451.80" */
export function money(n) {
  const v = Math.round(n * 100) / 100;
  return CONFIG.currency + v.toLocaleString(CONFIG.locale, { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
}
