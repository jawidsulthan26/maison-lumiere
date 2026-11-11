/**
 * Ultimate collection carousel: autoplay, glass refraction, particle break-up, hover grow.
 */
import { attachParticles, planeMaterial } from './Stage';
import { makeTexture, opacityOf } from './assets';
import { $, $$, GL, HAS_GSAP, REDUCED, ScrollTrigger, gsap, isMobile } from './env';
import { IO as IntersectionObserver, isAlive, on as addEventListener } from './lifecycle';
import { openProduct, stage } from './runtime';

/* ---------------------------------------------------------------------------
   12. Carousel — WebGL glass refraction between slides, centre item scales up
   --------------------------------------------------------------------------- */
export function initCarousel() {
  const stageEl = $('#carousel-stage');
  const slides = $$('.slide', stageEl);
  const dots = $$('#carousel-dots i');
  let active = 1, busy = false;
  const items = slides.map(s => {
    const img = $('img', s);
    const it = { slide: s, distort: 0, hover: 0 };
    if (GL) {
      it.gl = stage.add(img, planeMaterial(makeTexture(img.getAttribute('src'))), {
        update(g) { g.mat.uniforms.uDistort.value = it.distort; g.mat.uniforms.uAlpha.value = opacityOf(s) * (it.fade ?? 1); },
      });
      it.parts = attachParticles(it.gl, img.getAttribute('src'), isMobile() ? 56 : 96, { spread: 320 });
      if (it.parts && HAS_GSAP) ScrollTrigger.create({ trigger: '#carousel', start: 'top 85%', once: true,
        onEnter: () => gsap.to(it.parts.u.uForm, { value: 1, duration: 2.6, ease: 'power2.inOut', delay: slides.indexOf(s) * .15 }) });
    }
    s.addEventListener('pointermove', e => { if (!it.gl) return; const r = it.gl.rect; it.gl.mat.uniforms.uMouse.value.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height); });
    s.addEventListener('pointerenter', () => { it.gl && HAS_GSAP && gsap.to(it.gl.mat.uniforms.uHover, { value: 1, duration: .8 }); hoverGrow(it, true); });
    s.addEventListener('pointerleave', () => { it.gl && HAS_GSAP && gsap.to(it.gl.mat.uniforms.uHover, { value: 0, duration: 1.1 }); hoverGrow(it, false); });
    s.addEventListener('click', () => { const slot = slotOf(slides.indexOf(s)); slot === 0 ? openProduct(s) : go(slot); });
    return it;
  });
  const slotOf = i => ((i - active + 4) % 3) - 1;     // -1 left · 0 centre · 1 right
  const layout = () => {
    const w = stageEl.clientWidth;
    const m = isMobile();
    return {
      x: w * (m ? .34 : .385),
      y: m ? w * .12 : w * .055,
      sc: m ? 1.12 : 1.3,
      side: m ? .74 : 1,
    };
  };
  const place = (instant) => {
    const L = layout();
    items.forEach((it, i) => {
      const slot = slotOf(i);
      const props = { x: slot * L.x, y: slot === 0 ? L.y : 0, scale: slot === 0 ? L.sc : L.side, zIndex: slot === 0 ? 2 : 1 };
      it.slide.style.setProperty('--s', props.scale);
      if (instant || !HAS_GSAP) Object.assign(it.slide.style, { transform: `translate(${props.x}px, ${props.y}px) scale(${props.scale})`, zIndex: props.zIndex });
      else gsap.set(it.slide, props);
    });
    dots.forEach((d, i) => d.classList.toggle('is-on', i === active));
  };
  // hovering a slide makes it big: side bottles grow toward the centre size, the centre one swells a little
  function hoverGrow(it, on) {
    if (!HAS_GSAP || busy) return;
    const L = layout(), slot = slotOf(items.indexOf(it));
    const base = slot === 0 ? L.sc : L.side, big = slot === 0 ? L.sc * 1.08 : L.sc * .95;
    const sc = on ? big : base;
    gsap.to(it.slide, { scale: sc, '--s': sc, zIndex: on ? 3 : (slot === 0 ? 2 : 1), duration: .7, ease: 'expo.out', overwrite: 'auto' });
  }
  function go(dir) {
    if (busy || !HAS_GSAP) { if (!HAS_GSAP) { active = (active + dir + 3) % 3; place(true); } return; }
    busy = true;
    const prevSlots = items.map((_, i) => slotOf(i));
    active = (active + dir + 3) % 3;
    const L = layout();
    const tl = gsap.timeline({ onComplete: () => (busy = false) });
    items.forEach((it, i) => {
      const from = prevSlots[i], to = slotOf(i);
      const target = { x: to * L.x, y: to === 0 ? L.y : 0, scale: to === 0 ? L.sc : L.side, '--s': to === 0 ? L.sc : L.side };
      const wraps = Math.abs(to - from) > 1;
      const dur = REDUCED ? .01 : 1.25;
      // refraction strength follows a bell curve over the move
      tl.fromTo(it, { distort: 0 }, { distort: 1, duration: dur / 2, ease: 'sine.out', yoyo: true, repeat: 1 }, 0);
      // slides break into particles mid-move and re-assemble in their new slot
      if (it.parts && it.parts.u.uForm.value > .99) tl.fromTo(it.parts.u.uForm, { value: 1 }, { value: .42, duration: dur * .45, ease: 'power2.in', yoyo: true, repeat: 1 }, 0);
      if (wraps) {
        // the wrapping slide slips out one side and re-enters from the other through the glass
        tl.to(it.slide, { x: from * L.x * 1.35, opacity: 0, duration: dur * .45, ease: 'power2.in' }, 0)
          .set(it.slide, { x: to * L.x * 1.35, zIndex: 1 }, dur * .45)
          .to(it.slide, { x: target.x, y: target.y, scale: target.scale, opacity: 1, duration: dur * .55, ease: 'expo.out' }, dur * .45);
      } else {
        tl.set(it.slide, { zIndex: to === 0 ? 2 : 1 }, dur * .3)
          .to(it.slide, { ...target, duration: dur, ease: 'expo.inOut' }, 0);
      }
    });
    dots.forEach((d, i) => d.classList.toggle('is-on', i === active));
  }
  // automatic slider: advances every 3.6s; pauses while hovered, off-screen or in a background tab
  let hovering = false, inView = false, auto = null;
  const schedule = () => { if (!isAlive()) return; auto?.kill(); if (HAS_GSAP) auto = gsap.delayedCall(3.6, () => { if (!hovering && inView && !document.hidden) go(1); schedule(); }); };
  const carEl = $('#carousel');
  carEl.addEventListener('pointerenter', () => (hovering = true));
  carEl.addEventListener('pointerleave', () => (hovering = false));
  new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: .3 }).observe(carEl);
  schedule();
  $('.carousel__btn--prev').addEventListener('click', () => { go(-1); schedule(); });
  $('.carousel__btn--next').addEventListener('click', () => { go(1); schedule(); });
  // swipe
  let sx = null;
  stageEl.addEventListener('pointerdown', e => (sx = e.clientX));
  stageEl.addEventListener('pointerup', e => { if (sx === null) return; const d = e.clientX - sx; if (Math.abs(d) > 45) go(d < 0 ? 1 : -1); sx = null; });
  // keyboard
  $('#carousel').addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
  place(true);
  addEventListener('resize', () => place(true));
}
