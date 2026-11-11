/** 7. The Essence of Elegance — bottle inside a thin ring, 4 notes around it, orbiting particles. */
const NOTES = [
  'Fresh citrus and delicate florals create a bright and captivating first impression. Carefully balanced to feel effortlessly elegant, the scent unfolds with timeless sophistication.',
  'Fresh citrus and delicate florals blend together to create a bright and memorable introduction. Elegant, refreshing, and beautifully balanced, the fragrance reveals its charm with every moment.',
  'Fresh citrus and delicate florals create a bright, captivating, and refined opening. Each note is designed to awaken the senses and leave a graceful impression behind.',
  'Fresh citrus and delicate florals create a luminous and captivating first impression. Softly unfolding with remarkable elegance, it captures the essence of modern luxury.',
];
const POS = ['tl', 'tr', 'bl', 'br'];
const ORBIT = [['50%', '0'], ['100%', '50%'], ['50%', '100%'], ['0', '50%'], ['85%', '15%'], ['15%', '85%']];

export default function Essence() {
  return (
    <section className="essence" aria-labelledby="ess-title">
      <div className="wrap">
        <div className="section-head">
          <h2 className="display h2 section-title js-split" id="ess-title">The Essence of Elegance</h2>
          <p className="lede subtitle reveal lede--wide">Discover a fragrance crafted to capture confidence, sophistication, and timeless beauty. Every note is carefully selected to create a scent that feels truly unforgettable.</p>
        </div>
        <div className="essence__stage" id="essence-stage">
          <svg className="essence__svg" id="essence-svg" aria-hidden="true">
            <defs><linearGradient id="linkGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#C8875A" stopOpacity=".9" /><stop offset="1" stopColor="#C8875A" stopOpacity=".15" /></linearGradient></defs>
          </svg>
          <div className="glow glow--essence" aria-hidden="true" />
          <div className="essence__ring" id="essence-ring">
            <div className="orbit-fallback">{ORBIT.map(([l, t], i) => <i key={i} style={{ left: l, top: t }} />)}</div>
          </div>
          <div className="essence__bottle"><img data-gl="essence" src="/images/11_essence_bottle.webp" alt="Signature perfume bottle" width="196" height="426" /></div>
          {NOTES.map((n, i) => <p key={i} className={`note note--${POS[i]}`} data-note={i}>{n}</p>)}
        </div>
      </div>
    </section>
  );
}
