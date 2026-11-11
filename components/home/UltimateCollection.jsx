import { byCollection } from '@/lib/products';
import ProductArch from './ProductArch';

/** 5. The Ultimate Fragrance Collection — 3-item WebGL carousel (autoplay, centre item larger). */
export default function UltimateCollection() {
  return (
    <section className="ultimate" id="store" aria-labelledby="ult-title">
      <div className="wrap">
        <div className="section-head">
          <h2 className="display h2 section-title js-split" id="ult-title">The Ultimate Fragrance Collection</h2>
          <p className="lede subtitle reveal">Explore signature scents crafted with carefully selected notes, elegant<br /> compositions, and a lasting impression.</p>
        </div>
        <div className="carousel" id="carousel" aria-roledescription="carousel" tabIndex={0}>
          <div className="carousel__stage" id="carousel-stage">
            <div className="glow glow--row" aria-hidden="true" />
            {byCollection('ultimate').map(p => <ProductArch key={p.id} product={p} variant="slide" />)}
          </div>
          <div className="carousel__nav">
            <button className="carousel__btn carousel__btn--prev" aria-label="Previous fragrance" data-cursor="link"><svg viewBox="0 0 64 44"><circle cx="40" cy="22" r="17" /><path d="M50 22H6m8-8-8 8 8 8" /></svg></button>
            <button className="carousel__btn carousel__btn--next" aria-label="Next fragrance" data-cursor="link"><svg viewBox="0 0 64 44"><circle cx="24" cy="22" r="17" /><path d="M14 22h44m-8-8 8 8-8 8" /></svg></button>
          </div>
          <div className="carousel__dots" id="carousel-dots"><i /><i className="is-on" /><i /></div>
        </div>
      </div>
    </section>
  );
}
