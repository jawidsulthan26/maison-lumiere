/**
 * Ink-in-water mask reveal for the oval and circular photos (SVG filters).
 */
import { $, $$, HAS_GSAP, REDUCED, ScrollTrigger, gsap } from './env';

/* ---------------------------------------------------------------------------
   9. Ink-in-water mask reveal for the oval + circular photos (SVG, no WebGL needed)
   --------------------------------------------------------------------------- */
export function initInk() {
  $$('.ink').forEach((el, i) => {
    const src = el.dataset.src, w = +el.dataset.w, h = +el.dataset.h;
    if (REDUCED || !HAS_GSAP) return;    // keep the plain clipped <img>
    const id = 'ink' + i;
    const blobs = Array.from({ length: 5 }, (_, k) => {
      const a = k * 2.4 + i, rr = k === 0 ? 0 : .22;
      return `<circle cx="${(w / 2 + Math.cos(a) * w * rr).toFixed(1)}" cy="${(h / 2 + Math.sin(a) * h * rr).toFixed(1)}" r="0" fill="#fff"/>`;
    }).join('');
    el.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${el.querySelector('img')?.alt || ''}">
        <defs>
          <clipPath id="${id}c"><ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2 * .985}" ry="${h / 2 * .985}"/></clipPath>
          <filter id="${id}f" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="${(2.6 / w).toFixed(4)}" numOctaves="3" seed="${i * 7 + 3}" result="n"/>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="${(w * .3).toFixed(0)}" xChannelSelector="R" yChannelSelector="B" result="d"/>
            <feGaussianBlur in="d" stdDeviation="${(w * .014).toFixed(1)}"/>
            <feComponentTransfer><feFuncA type="linear" slope="2.6" intercept="-.6"/></feComponentTransfer>
          </filter>
          <mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><g filter="url(#${id}f)">${blobs}</g></mask>
        </defs>
        <g clip-path="url(#${id}c)"><image href="${src}" width="${w}" height="${h}" mask="url(#${id}m)" preserveAspectRatio="xMidYMid slice"/></g>
      </svg>`;
    const circles = $$('circle', el), image = $('image', el), svg = $('svg', el);
    gsap.set(image, { scale: 1.18, transformOrigin: '50% 50%' });
    const tl = gsap.timeline({ paused: true, onComplete: () => { image.removeAttribute('mask'); } });
    tl.to(circles, { attr: { r: Math.max(w, h) * .9 }, duration: 2.4, ease: 'power2.out', stagger: .16 }, 0)
      .to(image, { scale: 1, duration: 2.6, ease: 'expo.out' }, 0);
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => tl.play() });
    // gentle zoom on hover
    el.addEventListener('pointerenter', () => gsap.to(image, { scale: 1.06, duration: 1.2, ease: 'expo.out' }));
    el.addEventListener('pointerleave', () => gsap.to(image, { scale: 1, duration: 1.2, ease: 'expo.out' }));
    svg.style.display = 'block';
  });
}
