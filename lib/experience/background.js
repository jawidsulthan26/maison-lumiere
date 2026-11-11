/**
 * Amber droplets layer: ~60 dots clustered around the hero splash and the Essence section.
 */
import { $, IS_TOUCH, REDUCED, isMobile } from './env';
import { RO as ResizeObserver, later as setTimeout, on as addEventListener } from './lifecycle';

/* 4. Amber droplets — ~60 dots over the full page height, clustered around the hero
   splash and the Essence section, sparse elsewhere; slow float + light mouse parallax. */
export function initBackgroundDrops() {
  const host = $('#drops'); if (!host) return;
  const rand = (a, b) => a + Math.random() * (b - a);
  const build = () => {
    host.innerHTML = '';
    // measure the real page (footer bottom) with this layer collapsed, so it can never stretch the page itself
    host.style.height = '0px';
    const foot = $('.footer');
    const H = Math.ceil(foot ? foot.getBoundingClientRect().bottom + scrollY : document.documentElement.scrollHeight);
    const W = document.documentElement.clientWidth;
    host.style.height = H + 'px';
    const docRect = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top + scrollY, w: r.width, h: r.height }; };
    const splash = docRect($('.hero__bottle')), ess = docRect($('#essence-stage'));
    const zones = [
      { n: .42, r: { x: splash.x - splash.w * .05, y: splash.y - splash.h * .35, w: splash.w * 1.1, h: splash.h * 1.45 } },  // hero splash
      { n: .33, r: { x: ess.x - 40, y: ess.y - 60, w: ess.w + 80, h: ess.h + 120 } },                                             // essence
      { n: .25, r: { x: 0, y: 0, w: W, h: H } },                                                                                  // sparse elsewhere
    ];
    const total = isMobile() ? 36 : 60;
    const frag = document.createDocumentFragment();
    zones.forEach(z => {
      const n = Math.round(total * z.n);
      for (let k = 0; k < n; k++) {
        const sharp = Math.random() < .7;
        const size = sharp ? rand(3, 8) : rand(14, 30);
        const d = document.createElement('span');
        d.className = 'drop ' + (sharp ? 'drop--sharp' : 'drop--bokeh');
        d.style.cssText = `width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;left:${(z.r.x + Math.random() * z.r.w).toFixed(0)}px;top:${(z.r.y + Math.random() * z.r.h).toFixed(0)}px;` +
          `opacity:${(sharp ? rand(.5, .9) : rand(.25, .4)).toFixed(2)};--d:${(sharp ? rand(.4, 1) : rand(1, 1.8)).toFixed(2)};` +
          `--t:${rand(6, 10).toFixed(1)}s;--dl:${(-rand(0, 10)).toFixed(1)}s`;
        d.appendChild(document.createElement('i'));
        frag.appendChild(d);
      }
    });
    host.appendChild(frag);
  };
  build();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 300); });
  const foot = $('.footer'); let lastH = 0;
  if (foot) new ResizeObserver(() => { const h = foot.getBoundingClientRect().bottom + scrollY; if (Math.abs(h - lastH) > 40) { lastH = h; clearTimeout(rt); rt = setTimeout(build, 200); } }).observe(document.querySelector('main'));
  // rebuild once late layout (fonts, images) has settled
  setTimeout(build, 900);
  if (REDUCED || IS_TOUCH) return;
  addEventListener('pointermove', e => {
    host.style.setProperty('--mx', ((e.clientX / innerWidth - .5) * -12).toFixed(2));
    host.style.setProperty('--my', ((e.clientY / innerHeight - .5) * -12).toFixed(2));
  }, { passive: true });
}
