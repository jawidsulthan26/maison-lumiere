/**
 * Lifecycle tracking so the home experience can be started and fully torn down
 * (Next.js client navigation mounts / unmounts the home page).
 *
 * Engine modules import these under the native names — e.g.
 *   import { on as addEventListener, later as setTimeout } from './lifecycle'
 * so page-level listeners, timers, observers and frames are released on cleanup.
 */
let alive = false;
let disposers = [];

export const isAlive = () => alive;
export function begin() { alive = true; disposers = []; }
export function track(fn) { disposers.push(fn); return fn; }
export function end() {
  alive = false;
  for (const fn of disposers.reverse()) { try { fn(); } catch (e) { /* already gone */ } }
  disposers = [];
}

/** window.addEventListener, removed on cleanup */
export function on(type, fn, opts) {
  window.addEventListener(type, fn, opts);
  track(() => window.removeEventListener(type, fn, opts));
}
/** document.addEventListener, removed on cleanup */
export function onDoc(type, fn, opts) {
  document.addEventListener(type, fn, opts);
  track(() => document.removeEventListener(type, fn, opts));
}
/** setTimeout that never fires after cleanup */
export const later = (fn, ms, ...args) => window.setTimeout(() => { if (alive) fn(...args); }, ms);
/** requestAnimationFrame that never fires after cleanup */
export const raf = cb => window.requestAnimationFrame(t => { if (alive) cb(t); });

export class IO extends IntersectionObserver {
  constructor(cb, opts) { super(cb, opts); track(() => this.disconnect()); }
}
export class RO extends ResizeObserver {
  constructor(cb) { super(cb); track(() => this.disconnect()); }
}
