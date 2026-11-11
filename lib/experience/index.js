/**
 * Home experience — boots the loader, WebGL stage, hero scene and every scroll
 * animation, and returns a cleanup that releases all of it.
 *
 *   const stop = await startExperience({ firstLoad, onOpenProduct });
 *   …
 *   stop();
 */
import { gsap, ScrollTrigger, GL, html, $, trackPointer } from './env';
import { begin, end, track, on, later, isAlive } from './lifecycle';
import { setScene, setOpenProduct, trackScrollVelocity, stage, hero } from './runtime';
import { resetHeroState } from './heroState';
import { preload } from './assets';
import { runLoader } from './loader';
import { Stage } from './Stage';
import { HeroScene } from './HeroScene';
import { initNav } from './nav';
import { initBackgroundDrops } from './background';
import { prepareText, introHero, initScrollAnimations } from './text';
import { initInk } from './ink';
import { initHeroBottle, introHeroGL } from './heroBottle';
import { initCards } from './cards';
import { initCarousel } from './carousel';
import { initEssence } from './essence';
import { initWordmark } from './wordmark';

function mountGL() {
  if (!GL) { html.classList.add('no-webgl'); return; }
  try {
    const s = new Stage($('#stage-gl'));
    const h = new HeroScene($('#hero-gl'), $('#hero'), $('.hero__bottle'));
    setScene(s, h);
    html.classList.add('gl-ready');
    track(() => {
      for (const r of [s.renderer, h.renderer]) { r.dispose(); r.forceContextLoss?.(); }
      setScene(null, null);
    });
  } catch (err) {
    console.warn('WebGL init failed, using image fallback', err);
    html.classList.add('no-webgl'); html.classList.remove('gl-ready');
    setScene(null, null);
  }
}

const safe = fn => { try { fn(); } catch (e) { console.warn(e); } };

export async function startExperience({ firstLoad = true, onOpenProduct } = {}) {
  begin();
  resetHeroState();
  setOpenProduct(onOpenProduct);
  const ctx = gsap.context(() => {});
  track(() => ctx.revert());
  track(() => { html.classList.remove('gl-ready', 'no-webgl'); document.body.classList.remove('is-loading'); });
  on('pointermove', trackPointer, { passive: true });

  ctx.add(() => prepareText());
  if (firstLoad && $('#loader')) {
    document.body.classList.add('is-loading');
    await runLoader();               // resolves at the moment the amber starts draining
  } else {
    await preload(() => {});         // returning visit: images are cached, no loader
  }
  if (!isAlive()) return stopExperience;

  ctx.add(() => {
    mountGL();
    initNav();
    initBackgroundDrops();
    safe(initHeroBottle); safe(initCards); safe(initCarousel); safe(initEssence); safe(initWordmark);
    initInk();
    initScrollAnimations();
    introHero(); introHeroGL();
  });

  // single render loop on GSAP's ticker (pauses automatically in background tabs)
  if (stage) {
    const tick = (t, dt) => {
      const s = Math.min(dt / 1000, .05);
      trackScrollVelocity(s);
      hero.update(s);
      stage.update(s);
    };
    gsap.ticker.add(tick);
    track(() => gsap.ticker.remove(tick));
  }

  let rt;
  on('resize', () => {
    clearTimeout(rt);
    rt = later(() => { stage?.resize(); hero?.resize(); ScrollTrigger.refresh(); }, 150);
  });
  // recalc after fonts + images finish shifting layout
  later(() => { hero?.measure(); ScrollTrigger.refresh(); }, 600);
  return stopExperience;
}

export function stopExperience() { end(); }
