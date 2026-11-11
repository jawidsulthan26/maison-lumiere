import { byCollection } from '@/lib/products';
import ProductArch from './ProductArch';

/** 3. Discover Our Signature Collection — 4 bottles on arch cards. */
export default function SignatureCollection() {
  return (
    <section className="signature" id="product" aria-labelledby="sig-title">
      <div className="wrap">
        <div className="section-head">
          <h2 className="display h2 section-title js-split" id="sig-title">Discover Our Signature Collection</h2>
          <p className="lede subtitle reveal">Explore fragrances created with carefully selected notes, elegant compositions,<br /> and a lasting impression.</p>
        </div>
        <div className="cards-wrap">
          <div className="glow glow--row" aria-hidden="true" />
          <div className="cards">{byCollection('signature').map(p => <ProductArch key={p.id} product={p} />)}</div>
        </div>
      </div>
    </section>
  );
}
