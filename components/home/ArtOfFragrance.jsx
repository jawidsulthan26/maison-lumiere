import { CONFIG } from '@/lib/config';
import ArrowButton from '@/components/ui/ArrowButton';
import InkPhoto from './InkPhoto';

/** 4. The Art of Fine Fragrance — oval portrait + copy. */
export default function ArtOfFragrance() {
  return (
    <section className="art" aria-labelledby="art-title">
      <div className="wrap">
        <InkPhoto className="art__media" src="/images/photo_art_of_fragrance_woman.webp" alt="Woman applying perfume, eyes closed" w={1673} h={1793} />
        <div className="art__text">
          <h2 className="display h2 split-title js-split" id="art-title">The Art of Fine <br />Fragrance</h2>
          <p className="body-s reveal">Discover fragrances created to express elegance, confidence, and individuality. At {CONFIG.brand}, every scent is carefully composed to leave a memorable impression.</p>
          <p className="body-s reveal">From fresh botanical notes to warm woods and sensual amber, each fragrance reveals a unique character designed for every mood and moment.</p>
          <p className="body-s reveal">Experience refined aromas, timeless craftsmanship, and a signature scent that feels beautifully yours.</p>
          <ArrowButton href="/shop" className="reveal">Discover More</ArrowButton>
        </div>
      </div>
    </section>
  );
}
