'use client';
/** /wishlist — saved fragrances, move to bag. */
import { useRef } from 'react';
import ShopHeader from '@/components/shop/ShopHeader';
import ProductTile from '@/components/shop/ProductTile';
import EmptyState from '@/components/shop/EmptyState';
import { HeartIcon } from '@/components/ui/Icons';
import { useShop } from '@/context/ShopContext';
import { getProduct } from '@/lib/products';
import useReveal from '@/hooks/useReveal';

export default function WishlistView() {
  const { ready, wish } = useShop();
  const ref = useRef(null);
  const list = wish.map(getProduct).filter(Boolean);
  useReveal(ref, [ready]);
  return (
    <div className="view" ref={ref}>
      <ShopHeader />
      <div className="shop-wrap">
        <div className="page-head" data-rise>
          <span className="eyebrow-c">Saved for later</span><h1>Your Wishlist</h1>
          {list.length > 0 && <p className="body-s">{list.length} fragrance{list.length > 1 ? 's' : ''} you love. Move them to your bag whenever you&apos;re ready.</p>}
        </div>
        {!ready ? null : list.length
          ? <div className="tiles">{list.map(p => <ProductTile key={p.id} product={p} action="move" />)}</div>
          : <EmptyState icon={<HeartIcon />} title="Nothing saved yet" text="Tap the heart on any fragrance to keep it here." cta="Explore the collection" href="/shop" />}
      </div>
    </div>
  );
}
