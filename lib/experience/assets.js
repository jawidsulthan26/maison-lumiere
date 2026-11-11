/**
 * Image preloading + Three.js texture creation (images are decoded once and shared).
 */
import { $$, HAS_GSAP, THREE, gsap } from './env';
import { later as setTimeout } from './lifecycle';

export const imageCache = new Map();

/** Preload every image inside `root` (plus any extra URLs) so WebGL can build textures from them. */
export function preload(onProgress, root = document, extra = []) {
  const srcs = [...new Set([...$$('img', root).map(i => i.getAttribute('src')), ...extra].filter(Boolean))];
  let done = 0; const total = srcs.length + 1;
  const tick = () => onProgress(++done / total);
  const jobs = srcs.map(src => new Promise(res => {
    if (imageCache.has(src)) { tick(); return res(); }
    const img = new Image(); img.decoding = 'async';
    img.onload = () => { imageCache.set(src, img); tick(); res(); };
    img.onerror = () => { tick(); res(); };
    img.src = src;
  }));
  const fonts = (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]) : Promise.resolve()).then(tick);
  return Promise.all([...jobs, fonts]);
}

export function makeTexture(src) {
  const img = imageCache.get(src);
  if (!img || !THREE) return null;
  const t = new THREE.Texture(img);
  t.premultiplyAlpha = true;       // clean edges on the transparent bottle cut-outs
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

// reads the opacity GSAP applied to a DOM ancestor so WebGL planes fade with their cards
export const opacityOf = el => (HAS_GSAP ? Number(gsap.getProperty(el, 'opacity')) : 1);
