/**
 * Footer wordmark that ripples like liquid under the cursor.
 */
import { $, GL, IS_TOUCH, THREE, lerp, mouse } from './env';
import { stage } from './runtime';
import { VERT_UV } from './shaders/common';
import { WORD_FRAG } from './shaders/stage';

/* ---------------------------------------------------------------------------
   14. Footer wordmark — letters react to the cursor with liquid displacement
   --------------------------------------------------------------------------- */
export function initWordmark() {
  const el = $('#footer-word');
  if (!GL || IS_TOUCH) { el.removeAttribute('data-gl'); return; }   // plain text on touch devices
  const canvas = document.createElement('canvas');
  const tex = new THREE.CanvasTexture(canvas);
  tex.premultiplyAlpha = true; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  const PAD = .06;
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT_UV, fragmentShader: WORD_FRAG, transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true,
    uniforms: { uTex: { value: tex }, uMouse: { value: new THREE.Vector2(-1, -1) }, uSize: { value: new THREE.Vector2(1, 1) }, uStr: { value: 0 }, uTime: { value: 0 } },
  });
  const draw = () => {
    const r = el.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 2);
    const pw = r.width * (1 + PAD * 2), ph = r.height + r.width * PAD * 2, padPx = r.width * PAD;
    canvas.width = Math.ceil(pw * dpr); canvas.height = Math.ceil(ph * dpr);
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    const cs = getComputedStyle(el);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.fillStyle = '#000'; ctx.textBaseline = 'middle';
    // draw each glyph exactly where the DOM laid it out
    const range = document.createRange(); const node = el.firstChild;
    for (let i = 0; i < node.length; i++) {
      range.setStart(node, i); range.setEnd(node, i + 1);
      const cr = range.getBoundingClientRect();
      ctx.fillText(node.data[i], cr.left - r.left + padPx, cr.top - r.top + cr.height / 2 + padPx);
    }
    tex.needsUpdate = true;
    mat.uniforms.uSize.value.set(pw, ph);
  };
  (document.fonts?.ready || Promise.resolve()).then(draw);
  let str = 0;
  stage.add(el, mat, { pad: PAD, onResize: draw, update(it) {
    const r = it.rect;
    const pw = r.width * (1 + PAD * 2), ph = r.height + r.width * PAD * 2;
    const lx = (mouse.x - (r.left - r.width * PAD)) / pw, ly = 1 - (mouse.y - (r.top - r.width * PAD)) / ph;
    const inside = lx > -.05 && lx < 1.05 && ly > -.2 && ly < 1.2;
    const speed = Math.min(Math.hypot(mouse.vx, mouse.vy) / 40, 1);
    str = lerp(str, inside ? .55 + speed * .6 : 0, .06);
    mouse.vx *= .9; mouse.vy *= .9;
    mat.uniforms.uStr.value = str;
    const m = mat.uniforms.uMouse.value; m.x = lerp(m.x, lx, .12); m.y = lerp(m.y, ly, .12);
  } });
}
