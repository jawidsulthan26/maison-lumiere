/**
 * Text animations: MESMERIZING blur-to-sharp, drift on scroll, word reveals, paragraph reveals.
 */
import { $, $$, GL, HAS_GSAP, REDUCED, gsap, isMobile } from './env';

/* ---------------------------------------------------------------------------
   8. Text animations
   --------------------------------------------------------------------------- */
export function splitChars(el) {
  const text = el.textContent; el.textContent = '';
  return [...text].map(ch => { const s = document.createElement('span'); s.className = 'char'; s.textContent = ch; s.setAttribute('aria-hidden', 'true'); el.appendChild(s); return s; });
}

export function splitWords(el) {
  // keeps <br> tags; wraps every word in a mask for a rise-in reveal
  const parts = el.innerHTML.split(/(<br\s*\/?>)/i);
  el.innerHTML = parts.map(p => /<br/i.test(p) ? p : p.split(/(\s+)/).map(w => w.trim() ? `<span class="split-word"><span>${w}</span></span>` : w).join('')).join('');
  return $$('.split-word > span', el);
}

export let heroChars = [];

export function prepareText() {
  heroChars = splitChars($('#hero-title'));
  // 5. tuck the mini bottles inside the 2nd letter (E) and the last letter (G)
  const mE = $('.title-mini--e'), mG = $('.title-mini--g');
  if (mE && heroChars[1]) heroChars[1].appendChild(mE);
  if (mG && heroChars[heroChars.length - 1]) heroChars[heroChars.length - 1].appendChild(mG);
  if (!HAS_GSAP || REDUCED) return;
  gsap.set(heroChars, { opacity: 0, filter: 'blur(18px)', yPercent: 18, scale: 1.06 });
  gsap.set(['.hero__minis', '.hero__aside', '.hero__scroll'], { opacity: 0, y: 24 });
  if (!GL) gsap.set('#hero-img', { opacity: 0, y: 40, scale: .96 });
}

export function introHero() {
  if (!HAS_GSAP || REDUCED) return;
  const tl = gsap.timeline({ delay: .05 });
  // staggered blur → sharp letter reveal, from the centre outwards
  tl.to(heroChars, { opacity: 1, filter: 'blur(0px)', yPercent: 0, scale: 1, duration: 1.6, ease: 'expo.out', stagger: { each: .07, from: 'center' } }, 0)
    .to(['.hero__minis', '.hero__aside', '.hero__scroll'], { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: .08 }, .6);
  if (!GL) tl.to('#hero-img', { opacity: 1, y: 0, scale: 1, duration: 1.6, ease: 'expo.out' }, .2);
  tl.add(() => gsap.set(heroChars, { clearProps: 'filter' }));
}

export function initScrollAnimations() {
  if (!HAS_GSAP) return;
  // hero letters drift apart as you scroll away
  if (!REDUCED) {
    const mid = (heroChars.length - 1) / 2;
    gsap.to(heroChars, { x: i => (i - mid) * innerWidth * .012, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    gsap.to('.hero__title', { yPercent: 45, opacity: .25, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  }
  if (REDUCED) return;

  // section headings: masked word rise
  $$('.js-split').forEach(el => {
    const words = splitWords(el);
    gsap.from(words, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  // paragraphs + buttons
  $$('.reveal').forEach(el => gsap.from(el, { y: 26, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));
  // product cards
  gsap.from('.card', { y: 70, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.cards', start: 'top 85%' } });
  gsap.from('.slide', { y: 60, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '#carousel', start: 'top 85%' } });
  // parallax on the moment circles
  $$('.moment__circles .ink').forEach(el => gsap.to(el, { y: () => parseFloat(el.dataset.speed) * innerHeight * (isMobile() ? .5 : 1.6), ease: 'none',
    scrollTrigger: { trigger: '.moment', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } }));
  // footer wordmark rises in
  gsap.from('.footer__word', { yPercent: 30, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 85%' } });
}
