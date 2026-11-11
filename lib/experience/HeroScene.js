/**
 * Hero 3D scene behind the bottle (glow, droplets, dust) with camera parallax.
 */
import { DPR, IS_TOUCH, REDUCED, THREE, clamp, gsap, isMobile, lerp, mouse } from './env';
import { IO as IntersectionObserver } from './lifecycle';
import { PALETTES, VERT_FULLSCREEN } from './shaders/common';
import { DROP_FRAG, DROP_VERT, DUST_FRAG, DUST_VERT, FLUID_FRAG } from './shaders/hero';

export class HeroScene {
  constructor(canvas, section, bottleEl) {
    this.canvas = canvas; this.section = section; this.bottleEl = bottleEl;
    this.visible = true; this.time = 0;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, .1, 60);
    this.camera.position.set(0, 0, 10);
    this.colors = { deep: new THREE.Color(...PALETTES.elan.deep), mid: new THREE.Color(...PALETTES.elan.mid), light: new THREE.Color(...PALETTES.elan.light) };
    const colorUniforms = () => ({ uDeep: { value: this.colors.deep }, uMid: { value: this.colors.mid }, uLight: { value: this.colors.light } });
    const lite = isMobile();

    // (a) metaball fluid — fullscreen quad behind everything
    this.fluid = new THREE.ShaderMaterial({
      vertexShader: VERT_FULLSCREEN, fragmentShader: FLUID_FRAG, transparent: true, depthWrite: false, depthTest: false,
      uniforms: { uRes: { value: new THREE.Vector2(1, 1) }, uMouse: { value: new THREE.Vector2(0, 0) }, uCenter: { value: new THREE.Vector2(0, -.1) },
        uTime: { value: 0 }, uScale: { value: 1 }, uMouseOn: { value: 0 }, uIntensity: { value: 0 }, ...colorUniforms() },
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.fluid);
    quad.frustumCulled = false; quad.renderOrder = -1; this.scene.add(quad);

    // (b) instanced amber droplets
    const N = REDUCED ? 0 : lite ? 36 : 96;
    const base = new THREE.IcosahedronGeometry(1, lite ? 1 : 2);
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute('position', base.getAttribute('position'));
    geo.setAttribute('normal', base.getAttribute('normal'));
    const seeds = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) {
      const side = Math.random() < .55 ? 1 : -1;
      seeds[i * 4] = side > 0 ? Math.random() * 1.2 + .05 : Math.PI - (Math.random() * 1.2 + .05);
      seeds[i * 4 + 1] = Math.random();
      seeds[i * 4 + 2] = Math.pow(Math.random(), 2.6) * .06 + .01;
      seeds[i * 4 + 3] = Math.random();
    }
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
    geo.instanceCount = N;
    this.drops = new THREE.ShaderMaterial({
      vertexShader: DROP_VERT, fragmentShader: DROP_FRAG, transparent: true, depthWrite: true,
      uniforms: { uTime: { value: 0 }, uScale: { value: 1 }, uOrigin: { value: new THREE.Vector3() }, uMouseW: { value: new THREE.Vector3(99, 99, 0) }, ...colorUniforms() },
    });
    const dropMesh = new THREE.Mesh(geo, this.drops); dropMesh.frustumCulled = false; this.scene.add(dropMesh);

    // (c) golden dust with depth of field
    const M = REDUCED ? 120 : lite ? 160 : 520;
    const pos = new Float32Array(M * 3), rnd = new Float32Array(M * 3);
    for (let i = 0; i < M; i++) {
      pos[i * 3] = (Math.random() - .5) * 18; pos[i * 3 + 1] = (Math.random() - .5) * 9; pos[i * 3 + 2] = Math.random() * 10 - 7;
      rnd[i * 3] = Math.random(); rnd[i * 3 + 1] = Math.random(); rnd[i * 3 + 2] = Math.random();
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    dg.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 3));
    this.dust = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT, fragmentShader: DUST_FRAG, transparent: true, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uPx: { value: 1 }, uFocus: { value: 10 }, uSize: { value: 26 }, uGold: { value: new THREE.Color(.8, .55, .28) } },
    });
    const pts = new THREE.Points(dg, this.dust); pts.frustumCulled = false; this.scene.add(pts);

    this.resize();
    new IntersectionObserver(([e]) => (this.visible = e.isIntersecting), { rootMargin: '80px' }).observe(section);
  }
  resize() {
    const w = this.section.clientWidth, h = this.section.clientHeight;
    this.w = w; this.h = h;
    this.renderer.setPixelRatio(DPR());
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.fluid.uniforms.uRes.value.set(w, h);
    this.dust.uniforms.uPx.value = this.renderer.getPixelRatio() * (h / 900);
    this.worldH = 2 * 10 * Math.tan(THREE.MathUtils.degToRad(17.5));
    this.pxToWorld = this.worldH / h;
    const s = clamp(w / 1440, .55, 1.15);
    this.fluid.uniforms.uScale.value = isMobile() ? 1.25 : 1;
    this.drops.uniforms.uScale.value = s * (isMobile() ? 1.4 : 1);
    this.measure();
  }
  measure() {
    // splash origin = slightly right of the bottle neck, in hero-local coordinates
    const sr = this.section.getBoundingClientRect(), br = this.bottleEl.getBoundingClientRect();
    const px = br.left - sr.left + br.width * .53, py = br.top - sr.top + br.height * .42;
    this.origin = { px, py };
    this.fluid.uniforms.uCenter.value.set((px / this.w - .5) * (this.w / this.h), -(py / this.h - .5));
    this.drops.uniforms.uOrigin.value.set((px - this.w / 2) * this.pxToWorld, -(py - this.h / 2) * this.pxToWorld, 0);
  }
  setPalette(name, dur = 1.4) {
    const p = PALETTES[name];
    ['deep', 'mid', 'light'].forEach(k => gsap.to(this.colors[k], { r: p[k][0], g: p[k][1], b: p[k][2], duration: dur, ease: 'power2.inOut' }));
  }
  update(dt) {
    if (!this.visible) return;
    this.time += REDUCED ? 0 : dt;
    const sr = this.section.getBoundingClientRect();
    const lx = mouse.x - sr.left, ly = mouse.y - sr.top;
    const inside = mouse.active && ly > 0 && ly < this.h;
    const u = this.fluid.uniforms;
    u.uTime.value = this.time;
    u.uMouseOn.value = lerp(u.uMouseOn.value, inside ? 1 : 0, .05);
    const tmx = (lx / this.w - .5) * (this.w / this.h), tmy = -(ly / this.h - .5);
    u.uMouse.value.x = lerp(u.uMouse.value.x, tmx, .08); u.uMouse.value.y = lerp(u.uMouse.value.y, tmy, .08);
    this.drops.uniforms.uTime.value = this.time;
    this.drops.uniforms.uMouseW.value.set((lx - this.w / 2) * this.pxToWorld, -(ly - this.h / 2) * this.pxToWorld, 0);
    this.dust.uniforms.uTime.value = this.time;
    // camera parallax with the cursor
    const cx = IS_TOUCH ? 0 : mouse.nx * .45, cy = IS_TOUCH ? 0 : -mouse.ny * .28;
    this.camera.position.x = lerp(this.camera.position.x, cx, .04);
    this.camera.position.y = lerp(this.camera.position.y, cy, .04);
    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
  }
}
