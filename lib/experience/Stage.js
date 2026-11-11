/**
 * One fixed full-screen WebGL canvas that draws every bottle as a plane synced to its DOM <img>, plus particle sculptures.
 */
import { imageCache } from './assets';
import { DPR, REDUCED, THREE, clamp, mouse } from './env';
import { scrollVel, stage } from './runtime';
import { VERT_UV } from './shaders/common';
import { PARTICLE_FRAG, PARTICLE_VERT, PLANE_FRAG } from './shaders/stage';

export class Stage {
  constructor(canvas) {
    this.canvas = canvas; this.items = []; this.time = 0; this.wasDrawing = true;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 1, 10000);
    this.resize();
  }
  resize() {
    const w = innerWidth, h = innerHeight; this.w = w; this.h = h;
    this.renderer.setPixelRatio(DPR());
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // place the camera so that 1 world unit = 1 CSS pixel on the z = 0 plane
    this.camera.position.z = (h / 2) / Math.tan(THREE.MathUtils.degToRad(15));
    this.camera.far = this.camera.position.z * 3;
    this.camera.updateProjectionMatrix();
    this.items.forEach(it => it.onResize?.());
  }
  add(el, material, opts = {}) {
    const geo = opts.geometry || new THREE.PlaneGeometry(1, 1, 1, 1);
    const mesh = opts.object || new THREE.Mesh(geo, material);
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    const item = { el, mesh, mat: material, pad: opts.pad || 0, depthScale: opts.depthScale || false, update: opts.update, onResize: opts.onResize };
    this.items.push(item);
    return item;
  }
  update(dt) {
    this.time += REDUCED ? dt * .25 : dt;
    let any = false;
    for (const it of this.items) {
      const r = it.el.getBoundingClientRect();
      const vis = r.width > 0 && r.bottom > -150 && r.top < this.h + 150;
      it.mesh.visible = vis; it.rect = r;
      if (!vis) continue;
      any = true;
      const pw = r.width * (1 + it.pad * 2), ph = r.height + r.width * it.pad * 2;
      it.mesh.position.set(r.left + r.width / 2 - this.w / 2, this.h / 2 - (r.top + r.height / 2), 0);
      it.mesh.scale.set(pw, ph, it.depthScale ? pw : 1);
      if (it.mat.uniforms.uTime) it.mat.uniforms.uTime.value = this.time;
      if (it.mat.uniforms.uVel) it.mat.uniforms.uVel.value = clamp(scrollVel, -1.2, 1.2);
      it.update?.(it, dt);
    }
    if (any || this.wasDrawing) this.renderer.render(this.scene, this.camera);
    this.wasDrawing = any;
  }
}

export function planeMaterial(tex, frag = PLANE_FRAG, extra = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: VERT_UV, fragmentShader: frag, transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true,
    uniforms: { uTex: { value: tex }, uTime: { value: 0 }, uHover: { value: 0 }, uDistort: { value: 0 }, uAlpha: { value: 1 }, uVel: { value: 0 }, uMouse: { value: new THREE.Vector2(.5, .5) }, ...extra },
  });
}

/* Rebuild an image (already loaded) as particles that follow a stage plane item. */
export function attachParticles(planeItem, src, cols, opts = {}) {
  const img = imageCache.get(src);
  if (!img || !stage || REDUCED) return null;
  const rows = Math.max(2, Math.round(cols * img.naturalHeight / img.naturalWidth));
  const cv = document.createElement('canvas'); cv.width = cols; cv.height = rows;
  const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0, cols, rows);
  let px; try { px = ctx.getImageData(0, 0, cols, rows).data; } catch (e) { return null; }   // tainted canvas (file://) → plain plane
  const uv = [], col = [], rnd = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const i = (y * cols + x) * 4, a = px[i + 3];
    if (a < 24) continue;
    uv.push((x + .5) / cols, 1 - (y + .5) / rows);
    col.push(px[i] / 255, px[i + 1] / 255, px[i + 2] / 255, a / 255);
    rnd.push(Math.random(), Math.random(), Math.random());
  }
  const n = uv.length / 2;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute('aUv', new THREE.BufferAttribute(new Float32Array(uv), 2));
  g.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array(col), 4));
  g.setAttribute('aRnd', new THREE.BufferAttribute(new Float32Array(rnd), 3));
  const mat = new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VERT, fragmentShader: PARTICLE_FRAG, transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true,
    uniforms: { uTime: { value: 0 }, uForm: { value: opts.form ?? 0 }, uDissolve: { value: 0 }, uBurst: { value: 0 }, uCell: { value: 1 }, uPx: { value: 1 },
      uCamZ: { value: 1000 }, uNoir: { value: 0 }, uSpread: { value: opts.spread ?? 520 }, uMouse: { value: new THREE.Vector2(-9999, -9999) } },
  });
  const points = new THREE.Points(g, mat);
  const state = mat.uniforms;
  const item = stage.add(planeItem.el, mat, { object: points, update(it) {
    // follow the plane exactly (position, tilt, scale)
    it.mesh.position.copy(planeItem.mesh.position); it.mesh.rotation.copy(planeItem.mesh.rotation); it.mesh.scale.copy(planeItem.mesh.scale);
    state.uCell.value = it.rect.width / cols;
    state.uPx.value = stage.renderer.getPixelRatio();
    state.uCamZ.value = stage.camera.position.z;
    state.uMouse.value.set(mouse.x - stage.w / 2, stage.h / 2 - mouse.y);
    // the crisp plane takes over once the particles have settled
    const fm = state.uForm.value, dv = state.uDissolve.value, bu = state.uBurst.value;
    const k = THREE.MathUtils.smoothstep(fm, .9, .985) * (1 - THREE.MathUtils.smoothstep(dv, 0, .2)) * (1 - bu * .35);
    // planes that don't set their own alpha each frame keep a base value instead (avoids compounding)
    const base = planeItem.baseAlpha !== undefined ? planeItem.baseAlpha : planeItem.mat.uniforms.uAlpha.value;
    planeItem.mat.uniforms.uAlpha.value = base * k;
    it.mesh.visible = it.mesh.visible && (fm < .999 || dv > .001 || bu > .001);
    opts.update?.(it);
  } });
  item.mesh.renderOrder = 3;
  item.u = state;
  return item;
}
