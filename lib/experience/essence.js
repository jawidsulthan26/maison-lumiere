/**
 * Essence of Elegance: rotating bottle, orbiting scent particles, ring + notes reveal.
 */
import { attachParticles, planeMaterial } from './Stage';
import { makeTexture, opacityOf } from './assets';
import { $, $$, GL, HAS_GSAP, REDUCED, ScrollTrigger, THREE, clamp, gsap, isMobile } from './env';
import { RO as ResizeObserver, on as addEventListener } from './lifecycle';
import { stage } from './runtime';
import { ESSENCE_FRAG, ORBIT_FRAG, ORBIT_VERT } from './shaders/stage';

/* ---------------------------------------------------------------------------
   13. Essence — rotating bottle, orbiting scent-note particles, links to notes
   --------------------------------------------------------------------------- */
export function initEssence() {
  const stageEl = $('#essence-stage'), ringEl = $('#essence-ring'), svg = $('#essence-svg');
  const notes = $$('.note', stageEl);
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };
  const ring = mk('circle', { class: 'ring' });
  const links = notes.map(() => mk('path', { class: 'link' }));
  const glows = notes.map(() => mk('circle', { class: 'anchor-glow', r: 0 }));
  const anchors = notes.map(() => mk('circle', { class: 'anchor', r: 0 }));
  const geom = { cx: 0, cy: 0, R: 0, ang: [0, 0, 0, 0] };

  const measure = () => {
    const s = stageEl.getBoundingClientRect(), r = ringEl.getBoundingClientRect();
    geom.cx = r.left - s.left + r.width / 2; geom.cy = r.top - s.top + r.height / 2; geom.R = r.width / 2;
    svg.setAttribute('viewBox', `0 0 ${s.width} ${s.height}`);
    ring.setAttribute('cx', geom.cx); ring.setAttribute('cy', geom.cy); ring.setAttribute('r', geom.R);
    const C = 2 * Math.PI * geom.R; ring.style.strokeDasharray = C; ring.dataset.len = C;
    notes.forEach((n, i) => {
      const nr = n.getBoundingClientRect();
      const left = nr.left - s.left, top = nr.top - s.top;
      const right = i % 2 === 0;               // TL/BL connect from their right edge
      const tx = right ? left + nr.width + 14 : left - 14, ty = top + nr.height * .5;
      const a = Math.atan2(ty - geom.cy, tx - geom.cx);
      geom.ang[i] = a;
      const ax = geom.cx + Math.cos(a) * geom.R, ay = geom.cy + Math.sin(a) * geom.R;
      [anchors[i], glows[i]].forEach(c => { c.setAttribute('cx', ax); c.setAttribute('cy', ay); });
      const mx = (ax + tx) / 2;
      links[i].setAttribute('d', `M${ax},${ay} C${mx},${ay} ${mx},${ty} ${tx},${ty}`);
      const len = links[i].getTotalLength(); links[i].style.strokeDasharray = len; links[i].dataset.len = len;
    });
  };
  measure();
  addEventListener('resize', measure);
  // keep the anchors/lines aligned after fonts settle or the layout shifts
  new ResizeObserver(measure).observe(stageEl);

  const noteState = [0, 0, 0, 0];
  const show = { v: REDUCED ? 1 : 0 };
  if (HAS_GSAP && !REDUCED) {
    ring.style.strokeDashoffset = ring.dataset.len;
    links.forEach(l => (l.style.strokeDashoffset = l.dataset.len));
    gsap.set(notes, { opacity: 0, y: 24 });
    ScrollTrigger.create({ trigger: stageEl, start: 'top 80%', once: true, onEnter: () => {
      gsap.to(ring, { strokeDashoffset: 0, duration: 2.6, ease: 'expo.inOut' });
      gsap.to(show, { v: 1, duration: 2, ease: 'power2.out' });
    } });
    // each note fades in in turn as you scroll, its line draws from the ring and its particles light up
    const tl = gsap.timeline({ scrollTrigger: { trigger: stageEl, start: 'top 65%', end: 'center 45%', scrub: .8 } });
    [0, 1, 2, 3].forEach(i => {
      const at = i * .9;
      tl.to(links[i], { strokeDashoffset: 0, duration: 1, ease: 'none' }, at)
        .to(anchors[i], { attr: { r: 3 }, duration: .4 }, at)
        .to(glows[i], { attr: { r: 11 }, duration: .6 }, at)
        .to(noteState, { [i]: 1, duration: .8 }, at)
        .to(notes[i], { opacity: 1, y: 0, duration: .8, ease: 'power2.out' }, at + .5);
    });
  } else {
    links.forEach(l => (l.style.strokeDashoffset = 0));
    anchors.forEach(a => a.setAttribute('r', 3)); glows.forEach(g => g.setAttribute('r', 11));
    noteState.fill(1);
  }

  if (!GL) return;
  // rotating bottle: a gently curved plane turning in 3D with a moving glass sheen
  const bottleImg = $('.essence__bottle img');
  const geo = new THREE.PlaneGeometry(1, 1, 48, 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, (Math.cos(x * Math.PI * .9) - 1) * .32); }
  const bmat = planeMaterial(makeTexture(bottleImg.getAttribute('src')), ESSENCE_FRAG, { uSpin: { value: 0 } });
  const essItem = stage.add(bottleImg, bmat, { geometry: geo, depthScale: true, update(it) {
    const t = stage.time;
    const spin = Math.sin(t * .35) * .55;
    it.mesh.rotation.y = spin; bmat.uniforms.uSpin.value = spin * 1.6;
    it.mesh.position.y += Math.sin(t * .7) * 6;
    it.mat.uniforms.uAlpha.value = clamp(show.v * 1.4, 0, 1) * (REDUCED ? 1 : opacityOf(bottleImg.parentElement));
  } });
  const essParts = attachParticles(essItem, bottleImg.getAttribute('src'), isMobile() ? 56 : 90, { spread: 600 });
  if (essParts && HAS_GSAP) ScrollTrigger.create({ trigger: stageEl, start: 'top 70%', once: true, onEnter: () => gsap.to(essParts.u.uForm, { value: 1, duration: 3, ease: 'power2.inOut' }) });
  if (!REDUCED) gsap.from(bottleImg.parentElement, { opacity: 0, y: 40, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: stageEl, start: 'top 75%' } });

  // orbiting scent-note particles
  const N = isMobile() ? 70 : 140;
  const og = new THREE.BufferGeometry();
  og.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  const ang = new Float32Array(N), rnd = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { ang[i] = Math.random() * Math.PI * 2; rnd[i * 3] = Math.random(); rnd[i * 3 + 1] = Math.random(); rnd[i * 3 + 2] = Math.random(); }
  og.setAttribute('aAng', new THREE.BufferAttribute(ang, 1));
  og.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 3));
  const omat = new THREE.ShaderMaterial({
    vertexShader: ORBIT_VERT, fragmentShader: ORBIT_FRAG, transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true,
    uniforms: { uTime: { value: 0 }, uR: { value: 100 }, uPx: { value: 1 }, uShow: { value: 0 }, uNotes: { value: new THREE.Vector4() }, uNoteAng: { value: new THREE.Vector4() } },
  });
  const orbit = new THREE.Points(og, omat);
  stage.add(ringEl, omat, { object: orbit, update(it) {
    // Points are positioned in pixels: undo the plane scaling
    it.mesh.scale.set(1, 1, 1);
    omat.uniforms.uR.value = it.rect.width / 2;
    omat.uniforms.uPx.value = stage.renderer.getPixelRatio();
    omat.uniforms.uShow.value = show.v;
    // screen y is flipped vs. SVG, so mirror the note angles
    omat.uniforms.uNotes.value.set(...noteState);
    omat.uniforms.uNoteAng.value.set(...geom.ang.map(a => -a));
  } });
}
