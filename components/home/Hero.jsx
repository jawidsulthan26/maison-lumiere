import { CONFIG } from '@/lib/config';
import ArrowButton from '@/components/ui/ArrowButton';

/** 2. Hero — giant title, splash bottle over a liquid pool, Élan / Noir selector, tagline. */
export default function Hero() {
  return (
    <section className="hero" id="hero" aria-label="Introduction">
      <canvas id="hero-gl" aria-hidden="true" />
      <svg className="swoosh" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-40 640 C 180 520, 300 300, 520 210 S 860 60, 1010 -20" strokeWidth="1.5" opacity=".45" />
        <path d="M-40 720 C 220 600, 360 380, 590 270 S 900 120, 1080 10" strokeWidth="1" opacity=".3" />
        <path d="M-40 560 C 140 470, 250 260, 450 170 S 760 40, 900 -30" strokeWidth="1.2" opacity=".25" />
      </svg>
      <div className="hero__inner">
        <div className="glow glow--hero" aria-hidden="true" />
        <h1 className="hero__title hero-title display" id="hero-title" aria-label="Mesmerizing">MESMERIZING</h1>
        {/* tucked inside the E and the G by the engine */}
        <img className="title-mini title-mini--e" src="/images/02_elan_mini.webp" alt="" aria-hidden="true" />
        <img className="title-mini title-mini--g" src="/images/08_velvet_rose.webp" alt="" aria-hidden="true" />

        <div className="hero__bottle">
          <div className="hero__pool" id="hero-pool" aria-hidden="true" />
          <img id="hero-img" data-gl="hero" src="/images/01_hero_splash_bottle.webp" alt="Amber perfume bottle in a golden liquid splash" width="3066" height="1077" />
        </div>

        <div className="hero__minis" role="group" aria-label="Choose fragrance">
          <button className="mini is-active" data-variant="elan" aria-pressed="true" data-cursor="link">
            <img src="/images/02_elan_mini.webp" alt="" width="85" height="104" /><span>Élan</span>
          </button>
          <button className="mini" data-variant="noir" aria-pressed="false" data-cursor="link">
            <img src="/images/03_noir_mini.webp" alt="" width="85" height="99" /><span>Noir</span>
          </button>
        </div>

        <div className="hero__aside">
          <p>Elegant notes, refined ingredients,<br /> and unforgettable character.</p>
          <ArrowButton href="#product">Explore Collection</ArrowButton>
        </div>
        <div className="hero__scroll" aria-hidden="true"><i />Scroll</div>
      </div>
      <span className="sr-only">{CONFIG.brand}</span>
    </section>
  );
}
