'use client';
/** /cart — full bag with promo and summary. */
import { useRef } from 'react';
import Link from 'next/link';
import ShopHeader from '@/components/shop/ShopHeader';
import LineItem from '@/components/shop/LineItem';
import FreeShipMeter from '@/components/shop/FreeShipMeter';
import PromoField from '@/components/shop/PromoField';
import Totals from '@/components/shop/Totals';
import EmptyState from '@/components/shop/EmptyState';
import { BagIcon, LockIcon } from '@/components/ui/Icons';
import { useShop } from '@/context/ShopContext';
import { computeTotals } from '@/lib/pricing';
import useReveal from '@/hooks/useReveal';

export default function CartView() {
  const { ready, bag, promo, setQty, removeLine, toast } = useShop();
  const ref = useRef(null);
  const t = computeTotals(bag, { promo });
  useReveal(ref, [ready]);
  return (
    <div className="view" ref={ref}>
      <ShopHeader backLabel="Continue shopping" backHref="/shop" />
      <div className="shop-wrap">
        <div className="page-head" data-rise><span className="eyebrow-c">Step 1 of 4</span><h1>Your Cart</h1></div>
        {!ready ? null : bag.length ? (
          <div className="co-split">
            <div className="panel" data-rise>
              <FreeShipMeter net={t.net} />
              {bag.map((l, i) => <LineItem key={i + l.id} line={l} index={i} onQty={setQty} onRemove={k => { removeLine(k); toast('Removed from your bag'); }} />)}
              <div className="cart-gift"><span className="eyebrow-c">Complimentary</span><p className="body-s">Every order is hand-wrapped in our signature box with two discovery samples of your choice.</p></div>
            </div>
            <aside className="panel sticky summary-first" data-rise>
              <h3>Summary</h3><PromoField /><div style={{ height: 14 }} /><Totals t={t} promo={promo} />
              <div style={{ height: 16 }} />
              <Link className="btn-solid btn-block" href="/checkout" data-cursor="link">Secure checkout</Link>
              <div style={{ height: 12 }} />
              <div className="secure"><LockIcon /> Encrypted demo checkout · no real payment</div>
            </aside>
          </div>
        ) : <EmptyState icon={<BagIcon />} title="Your cart is empty" text="Find your signature — every bottle ships beautifully wrapped." cta="Shop fragrances" href="/shop" />}
      </div>
    </div>
  );
}
