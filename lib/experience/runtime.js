/**
 * Live shared state between engine modules (ES live bindings: importers always
 * see the current value; only this module assigns).
 */
/** @type {import('./Stage').Stage | null} */
export let stage = null;
/** @type {import('./HeroScene').HeroScene | null} */
export let hero = null;
export function setScene(s, h) { stage = s; hero = h; }

/** Smoothed scroll velocity (≈ -1…1) — drives the jelly wobble on bottles. */
export let scrollVel = 0;
let lastScrollY = 0;
export function trackScrollVelocity(dt) {
  const y = scrollY, v = (y - lastScrollY) / Math.max(dt, .001) / 2200;
  lastScrollY = y;
  scrollVel = scrollVel + (Math.max(-1.5, Math.min(1.5, v)) - scrollVel) * .12;
}

/** Opening a product from a home card / carousel slide (set by the React page). */
let openProductHook = () => {};
export const setOpenProduct = fn => { openProductHook = fn || (() => {}); };
export const openProduct = el => openProductHook(el);
