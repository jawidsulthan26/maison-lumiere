/**
 * Hero bottle: WebGL plane, liquid-wipe Élan/Noir swap, particle formation, the liquid pool.
 */
import { attachParticles, planeMaterial } from './Stage';
import { makeTexture } from './assets';
import { $, $$, GL, IS_TOUCH, REDUCED, THREE, gsap, isMobile, lerp, mouse } from './env';
import { heroItem, heroParts, heroShown, poolItem, setHeroState, variant } from './heroState';
import { later as setTimeout, on as addEventListener } from './lifecycle';
import { hero, stage } from './runtime';
import { VERT_UV } from './shaders/common';
import { HERO_FRAG, POOL_FRAG } from './shaders/stage';


export function initHeroBottle() {
  const img = $('#hero-img');
  $$('.mini').forEach(btn => btn.addEventListener('click', () => {
    const v = btn.dataset.variant; if (v === variant) return;
    $$('.mini').forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', b === btn); });
    setHeroState({ variant: v });
    if (GL && heroItem) {
      const u = heroItem.mat.uniforms;
      const target = v === 'noir' ? 1 : 0;
      gsap.killTweensOf(u.uWipe);
      u.uFrom.value = heroShown; u.uTo.value = target;
      gsap.fromTo(u.uWipe, { value: 0 }, { value: 1, duration: REDUCED ? .01 : 1.5, ease: 'power2.inOut',
        onComplete: () => { setHeroState({ heroShown: target }); u.uFrom.value = target; u.uWipe.value = 0; } });
      hero?.setPalette(v, REDUCED ? .01 : 1.5);
      if (heroParts) { gsap.to(heroParts.u.uNoir, { value: v === 'noir' ? 1 : 0, duration: 1.2 });
        gsap.fromTo(heroParts.u.uBurst, { value: 0 }, { value: 1, duration: .55, ease: 'power2.out', yoyo: true, repeat: 1, repeatDelay: .1 }); }
      if (!REDUCED) gsap.fromTo(heroItem.kick, { v: 1 }, { v: 0, duration: 1.4, ease: 'power3.out' });
    } else {
      img.classList.toggle('is-noir', v === 'noir');
    }
  }));
  if (!GL) return;
  const tex = makeTexture(img.getAttribute('src'));
  const mat = planeMaterial(tex, HERO_FRAG, { uWipe: { value: 0 }, uFrom: { value: 0 }, uTo: { value: 0 } });
  mat.uniforms.uAlpha.value = REDUCED ? 1 : 0;
  const tilt = { x: 0, y: 0 };
  setHeroState({ heroItem: stage.add(img, mat, {
    update(it) {
      // the bottle gently tilts toward the cursor; floats when idle
      const tx = IS_TOUCH ? 0 : mouse.ny * .1, ty = IS_TOUCH ? 0 : mouse.nx * .16;
      tilt.x = lerp(tilt.x, tx, .06); tilt.y = lerp(tilt.y, ty, .06);
      const t = REDUCED ? 0 : stage.time;
      it.mesh.rotation.set(tilt.x + Math.sin(t * .6) * .02, tilt.y, Math.sin(t * .4) * .012 - it.kick.v * .04);
      it.mesh.position.y += Math.sin(t * .8) * 5 - it.intro.y;
      it.mesh.scale.multiplyScalar(it.intro.s * (1 + it.kick.v * .025));
    },
  }) });
  heroItem.kick = { v: 0 };
  heroItem.intro = { y: REDUCED ? 0 : 150, s: REDUCED ? 1 : .96 };
  heroItem.mesh.renderOrder = 1;
  setHeroState({ heroParts: attachParticles(heroItem, img.getAttribute('src'), isMobile() ? 180 : 360, { spread: 700, update() {
    // scroll away from the hero → the bottle dissolves into a pouring stream of gold
    const hh = $('#hero').offsetHeight;
    heroParts.u.uDissolve.value = REDUCED ? 0 : THREE.MathUtils.smoothstep(scrollY, hh * .08, hh * .85);
  } }) });
  initPool();
}

export function initPool() {
  const el = $('#hero-pool'); if (!el || !stage || !hero) return;
  const rip = Array.from({ length: 8 }, () => new THREE.Vector4(.5, .5, -99, 0));
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT_UV, fragmentShader: POOL_FRAG, transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true,
    uniforms: { uTime: { value: 0 }, uAlpha: { value: REDUCED ? 1 : 0 }, uSize: { value: new THREE.Vector2(1, 1) }, uRip: { value: rip },
      uTex: { value: heroItem.mat.uniforms.uTex.value }, uMap: { value: new THREE.Vector4(0, 1, 0, 1) }, uNoir: { value: 0 }, uWater: { value: .86 },
      uDeep: { value: hero.colors.deep }, uMid: { value: hero.colors.mid }, uLight: { value: hero.colors.light } },
  });
  let k = 0;
  const drop = (x, y, w) => { rip[k].set(x, y, stage.time, w); k = (k + 1) % rip.length; };
  setHeroState({ poolItem: stage.add(el, mat, { update(it) { mat.uniforms.uSize.value.set(it.rect.width, it.rect.height);
    // map pool uv → bottle uv using where the bottle plane really is (includes its float/intro offsets)
    const hm = heroItem.mesh, bw = hm.scale.x, bh = hm.scale.y;
    const bl = stage.w / 2 + hm.position.x - bw / 2, bt = stage.h / 2 - hm.position.y - bh / 2;
    const r = it.rect;
    mat.uniforms.uMap.value.set((r.left - bl) / bw, r.width / bw, (r.top - bt) / bh, r.height / bh);
    mat.uniforms.uNoir.value = heroParts ? heroParts.u.uNoir.value : lerp(mat.uniforms.uNoir.value, variant === 'noir' ? 1 : 0, .05);
    if (heroParts) it.mat.uniforms.uAlpha.value = (it.baseA ?? 1) * (1 - heroParts.u.uDissolve.value * .9); } }) });
  poolItem.mesh.renderOrder = 2;
  poolItem.drop = drop;
  const uvAt = (x, y) => { const r = poolItem.rect || el.getBoundingClientRect(); return [(x - r.left) / r.width, 1 - (y - r.top) / r.height]; };
  let lx = 0, ly = 0, lt = 0;
  addEventListener('pointermove', e => {
    const [u, v] = uvAt(e.clientX, e.clientY);
    if (u < .05 || u > .95 || v < .05 || v > .86) return;
    const now = performance.now();
    if (Math.hypot(e.clientX - lx, e.clientY - ly) > 34 && now - lt > 90) { drop(u, v, .55); lx = e.clientX; ly = e.clientY; lt = now; }
  }, { passive: true });
  $('#hero').addEventListener('pointerdown', e => {
    const [u, v] = uvAt(e.clientX, e.clientY);
    drop(u > .05 && u < .95 && v > 0 && v < .86 ? u : .5, v > 0 && v < .86 ? v : .62, 1.2);
  });
  if (REDUCED) return;
  // drips from the splash fall into the pool on their own
  const drip = () => { if (hero.visible) drop(.3 + Math.random() * .4, .55 + Math.random() * .25, .45 + Math.random() * .3); setTimeout(drip, 900 + Math.random() * 1600); };
  setTimeout(drip, 2200);
}

export function introHeroGL() {
  if (!GL || !heroItem || REDUCED) return;
  heroItem.baseAlpha = 1;
  if (heroParts) gsap.fromTo(heroParts.u.uForm, { value: 0 }, { value: 1, duration: 3.8, delay: .7, ease: 'power2.inOut' });   // the bottle forms from golden dust
  else gsap.fromTo(heroItem.mat.uniforms.uAlpha, { value: 0 }, { value: 1, duration: 1.4 });
  gsap.to(heroItem.intro, { y: 0, s: 1, duration: 3.4, ease: 'expo.out', delay: .5 });
  if (poolItem) { poolItem.baseA = 0; gsap.to(poolItem, { baseA: 1, duration: 1.2, ease: 'power2.out' });
    setTimeout(() => { poolItem.drop(.5, .62, 1.4); setTimeout(() => poolItem.drop(.42, .7, .9), 260); }, 900); }
  gsap.fromTo(hero.fluid.uniforms.uIntensity, { value: 0 }, { value: 1, duration: 2.4, ease: 'power2.out' });
}
