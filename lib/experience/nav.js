/**
 * Home nav: hide on scroll down, glass background, active link by section.
 */
import { $, $$, HAS_GSAP, ScrollTrigger } from './env';
import { on as addEventListener } from './lifecycle';

export function initNav() {
  const nav = $('#nav'); let last = 0;
  const onScroll = y => {
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > 600 && y > last + 2);
    if (y < last - 2) nav.classList.remove('is-hidden');
    last = y;
  };
  addEventListener('scroll', () => onScroll(scrollY), { passive: true });   // Lenis drives native scroll, so this fires for both
  // active link by section
  if (!HAS_GSAP) return;
  const links = $$('.nav__links a');
  [['#top', '#hero'], ['#product', '#product'], ['#store', '#store'], ['#contact', '#contact']].forEach(([href, sel]) => {
    ScrollTrigger.create({ trigger: sel, start: 'top 45%', end: 'bottom 45%', onToggle: s => s.isActive && links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === href)) });
  });
}
