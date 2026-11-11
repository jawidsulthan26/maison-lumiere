/**
 * Shared Lenis instance (created by <SmoothScroll/> in the root layout).
 * Anything that needs to scroll, stop or start the page imports from here.
 */
let lenis = null;
export const getLenis = () => lenis;
export const setLenis = l => { lenis = l; };
export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();
export function scrollToTarget(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.6, ...opts });
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else target?.scrollIntoView?.();
}
