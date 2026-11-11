/**
 * Shared-element transitions: remember where a bottle was clicked so the next page
 * can fly it into place, plus the "throw into the bag" arc.
 */
import gsap from 'gsap';

let pending = null;
export function setFlight(img) {
  if (!img) { pending = null; return; }
  const r = img.getBoundingClientRect();
  pending = { left: r.left, top: r.top, width: r.width, height: r.height, src: img.currentSrc || img.src, t: performance.now() };
}
/** consumed once by the product page (ignored if stale) */
export function takeFlight() {
  const f = pending; pending = null;
  return f && performance.now() - f.t < 2500 ? f : null;
}
export function flyIn(from, target) {
  if (!from || !target) return;
  const to = target.getBoundingClientRect();
  const ghost = new Image(); ghost.src = from.src; ghost.alt = '';
  Object.assign(ghost.style, { position: 'fixed', left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px',
    objectFit: 'contain', objectPosition: '50% 100%', zIndex: 150, pointerEvents: 'none' });
  document.body.appendChild(ghost); target.style.opacity = 0;
  gsap.to(ghost, { left: to.left, top: to.top, width: to.width, height: to.height, duration: 1.1, ease: 'expo.inOut',
    onComplete: () => { target.style.opacity = ''; ghost.remove(); } });
}
/** the bottle arcs up and drops into the bag icon */
export function flyToBag(img) {
  if (!img) return;
  const target = document.querySelector('[data-bag-target]:not([data-hidden])') || document.querySelector('[data-bag-target]');
  if (!target) return;
  const r = img.getBoundingClientRect(), t = target.getBoundingClientRect();
  const g = new Image(); g.src = img.currentSrc || img.src; g.alt = '';
  Object.assign(g.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', objectFit: 'contain', zIndex: 200, pointerEvents: 'none' });
  document.body.appendChild(g);
  const dx = t.left + t.width / 2 - (r.left + r.width / 2), dy = t.top + t.height / 2 - (r.top + r.height / 2);
  gsap.timeline({ onComplete: () => { g.remove(); gsap.fromTo(target, { scale: 1.35 }, { scale: 1, duration: .8, ease: 'elastic.out(1,.4)' }); } })
    .to(g, { x: dx, duration: .85, ease: 'power1.inOut' }, 0)
    .to(g, { y: dy, duration: .85, ease: 'back.in(1.6)' }, 0)
    .to(g, { scale: .08, rotation: 30, opacity: .7, duration: .85, ease: 'power2.in' }, 0);
}
