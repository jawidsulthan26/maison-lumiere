/**
 * Intro loader — runs once per visit.
 */
import { preload } from './assets';
import { $, DPR, GL, HAS_GSAP, REDUCED, THREE, gsap, lerp } from './env';
import { later as setTimeout, on as addEventListener, raf as requestAnimationFrame } from './lifecycle';
import { VERT_FULLSCREEN } from './shaders/common';
import { LOADER_FRAG } from './shaders/loader';

export function runLoader() {
  return new Promise(resolve => {
    const loaderEl = $('#loader');
    const countEl = $('#loader-count');
    const state = { shown: 0, target: 0 };
    let renderer, mat, raf;

    if (GL) {
      const canvas = $('#loader-gl');
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true });
      renderer.setPixelRatio(DPR());
      renderer.setSize(innerWidth, innerHeight, false);
      mat = new THREE.ShaderMaterial({
        vertexShader: VERT_FULLSCREEN, fragmentShader: LOADER_FRAG, transparent: true,
        uniforms: { uRes: { value: new THREE.Vector2(innerWidth, innerHeight) }, uTime: { value: 0 },
          uFill: { value: 0 }, uTilt: { value: 0 }, uPour: { value: 0 }, uFlood: { value: 0 }, uReveal: { value: 0 },
          uReady: { value: 0 }, uCapLift: { value: 0 }, uBody: { value: null }, uCap: { value: null },
          uBodySize: { value: new THREE.Vector2(.44 * 588 / 850, .44) } },
      });
      // the real bottle photo (body + cap) — fades in as soon as both are decoded
      const texOf = el => new Promise(res => { const go = () => { const t = new THREE.Texture(el); t.needsUpdate = true; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; res(t); };
        el.complete && el.naturalWidth ? go() : (el.onload = go, el.onerror = () => res(null)); });
      Promise.all([texOf($('#loader-body')), texOf($('#loader-cap'))]).then(([b, c]) => {
        if (!b || !c) return;
        mat.uniforms.uBody.value = b; mat.uniforms.uCap.value = c;
        HAS_GSAP ? gsap.to(mat.uniforms.uReady, { value: 1, duration: .8, ease: 'power2.out' }) : (mat.uniforms.uReady.value = 1);
      });
      const fit = () => { const h = innerWidth / innerHeight < .7 ? .36 : .44; mat.uniforms.uBodySize.value.set(h * 588 / 850, h); };
      fit(); addEventListener('resize', fit);
      const scene = new THREE.Scene();
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); quad.frustumCulled = false; scene.add(quad);
      const cam = new THREE.Camera();
      const t0 = performance.now();
      const loop = () => {
        mat.uniforms.uTime.value = (performance.now() - t0) / 1000;
        state.shown = lerp(state.shown, state.target, 0.08);
        mat.uniforms.uFill.value = state.shown;
        countEl.textContent = String(Math.round(state.shown * 100)).padStart(2, '0');
        renderer.render(scene, cam);
        raf = requestAnimationFrame(loop);
      };
      loop();
      addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight, false); mat.uniforms.uRes.value.set(innerWidth, innerHeight); });
    } else {
      const vial = $('.loader__bottle');
      const loop = () => {
        state.shown = lerp(state.shown, state.target, 0.1);
        vial.style.setProperty('--p', state.shown.toFixed(3));
        countEl.textContent = String(Math.round(state.shown * 100)).padStart(2, '0');
        raf = requestAnimationFrame(loop);
      };
      loop();
    }

    const finish = () => {
      const cleanup = () => {
        cancelAnimationFrame(raf);
        if (renderer) { renderer.dispose(); renderer.forceContextLoss?.(); }
        loaderEl.remove();
      };
      document.body.classList.remove('is-loading');
      if (!GL || REDUCED || !HAS_GSAP) {
        const el = loaderEl; el.style.transition = 'opacity .6s'; el.style.opacity = '0';
        resolve(); setTimeout(cleanup, 650); return;
      }
      const u = mat.uniforms;
      gsap.timeline({ onComplete: cleanup })
        .to('.loader__ui', { opacity: 0, duration: .35 }, 0)
        .to(u.uCapLift, { value: .32, duration: .7, ease: 'power2.in' }, 0)          // cap lifts off
        .to(u.uTilt, { value: 2.05, duration: 1.15, ease: 'power2.inOut' }, .35)     // bottle tips over
        .to(u.uPour, { value: 1, duration: 1.5, ease: 'none' }, .6)                 // and pours
        .to(u.uFlood, { value: 1, duration: 1.05, ease: 'power2.in' }, 1.05)
        .add(() => resolve(), 2.1)
        .to(u.uReveal, { value: 1, duration: 1.25, ease: 'power3.inOut' }, 2.1);
    };

    const minTime = new Promise(r => setTimeout(r, REDUCED ? 200 : 900));
    Promise.all([preload(p => (state.target = p)), minTime]).then(() => {
      state.target = 1;
      // wait until the displayed fill catches up, then pour
      const wait = () => (state.shown > 0.985 ? finish() : requestAnimationFrame(wait));
      wait();
    });
  });
}
