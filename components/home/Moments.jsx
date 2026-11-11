import { CONFIG } from '@/lib/config';
import ArrowButton from '@/components/ui/ArrowButton';
import InkPhoto from './InkPhoto';

/** 6. Fragrance Made For Every Moment — copy + 3 overlapping circular photos (parallax). */
export default function Moments() {
  return (
    <section className="moment" aria-labelledby="mom-title">
      <div className="wrap">
        <div className="moment__text">
          <h2 className="display h2 split-title js-split" id="mom-title">Fragrance Made For <br />Every Moment</h2>
          <p className="body-s reveal">From the first spray to the final lingering note, every {CONFIG.brand} fragrance is created to become part of your story.</p>
          <ul className="moment__list body-s">
            <li className="reveal">Crafted with refined ingredients</li>
            <li className="reveal">Designed for lasting impressions</li>
          </ul>
          <ArrowButton href="/shop" className="reveal">Explore {CONFIG.brand}</ArrowButton>
        </div>
        <div className="moment__circles">
          <InkPhoto className="moment__c1" speed="-0.06" src="/images/photo_moment_1.webp" alt="Woman enjoying a perfume gift" w={899} h={953} />
          <InkPhoto className="moment__c2" speed="0.05" src="/images/photo_moment_2.webp" alt="Woman applying perfume to her neck" w={1032} h={1122} />
          <InkPhoto className="moment__c3" speed="-0.12" src="/images/photo_moment_3.webp" alt="Perfume spray with white flowers" w={706} h={736} />
        </div>
      </div>
    </section>
  );
}
