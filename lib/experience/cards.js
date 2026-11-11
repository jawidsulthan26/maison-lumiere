/**
 * Signature collection cards: ripple shader, 3D tilt, glow, particle assembly.
 */
import { attachParticles, planeMaterial } from './Stage';
import { makeTexture, opacityOf } from './assets';
import { $, $$, GL, HAS_GSAP, ScrollTrigger, gsap, isMobile, lerp } from './env';
import { openProduct, stage } from './runtime';

/* ---------------------------------------------------------------------------
   11. Product cards — ripple shader, 3D tilt, glow, price roll
   --------------------------------------------------------------------------- */
export function initCards() {
  $$('.card').forEach(card => {
    const img = $('.card__img', card);
    let item = null;
    if (GL) {
      item = stage.add(img, planeMaterial(makeTexture(img.getAttribute('src'))), {
        update(it) {
          it.mat.uniforms.uAlpha.value = opacityOf(card);
          it.mesh.rotation.x = lerp(it.mesh.rotation.x, it.tx || 0, .12);
          it.mesh.rotation.y = lerp(it.mesh.rotation.y, it.ty || 0, .12);
          it.mesh.position.y += (it.lift || 0);
        },
      });
      item.lift = 0;
      item.parts = attachParticles(item, img.getAttribute('src'), isMobile() ? 52 : 90, { spread: 300 });
    }
    const st = { rx: 0, ry: 0, glow: 0 };
    const apply = () => { card.style.setProperty('--rx', st.rx + 'deg'); card.style.setProperty('--ry', st.ry + 'deg'); card.style.setProperty('--glow', st.glow); };
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      st.rx = (0.5 - py) * 10; st.ry = (px - .5) * 14; apply();
      if (item) {
        const ir = item.rect || img.getBoundingClientRect();
        item.mat.uniforms.uMouse.value.set((e.clientX - ir.left) / ir.width, 1 - (e.clientY - ir.top) / ir.height);
        item.tx = -(0.5 - py) * .25; item.ty = (px - .5) * .35;
      }
    });
    card.addEventListener('pointerenter', () => {
      if (!HAS_GSAP) return;
      gsap.to(st, { glow: 1, duration: .6, onUpdate: apply });
      if (item) { gsap.to(item.mat.uniforms.uHover, { value: 1, duration: .8, ease: 'power2.out' }); gsap.to(item, { lift: 10, duration: .8, ease: 'expo.out' });
        if (item.parts && item.parts.u.uForm.value > .99) gsap.to(item.parts.u.uBurst, { value: .3, duration: .9, ease: 'power2.out' }); }
    });
    card.addEventListener('pointerleave', () => {
      if (!HAS_GSAP) return;
      gsap.to(st, { rx: 0, ry: 0, glow: 0, duration: .9, ease: 'expo.out', onUpdate: apply });
      if (item) { item.tx = 0; item.ty = 0; gsap.to(item.mat.uniforms.uHover, { value: 0, duration: 1.2, ease: 'power2.out' }); gsap.to(item, { lift: 0, duration: .9, ease: 'expo.out' });
        if (item.parts) gsap.to(item.parts.u.uBurst, { value: 0, duration: 1.1, ease: 'power2.out' }); }
    });
    card.addEventListener('click', () => openProduct(card));
    if (item?.parts && HAS_GSAP) ScrollTrigger.create({ trigger: card, start: 'top 88%', once: true,
      onEnter: () => gsap.to(item.parts.u.uForm, { value: 1, duration: 2.6, ease: 'power2.inOut', delay: $$('.card').indexOf(card) * .14 }) });
  });
}
