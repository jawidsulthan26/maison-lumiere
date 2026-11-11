'use client';
import { useShop } from '@/context/ShopContext';
import LineItem from '@/components/shop/LineItem';
import PromoField from '@/components/shop/PromoField';
import Totals from '@/components/shop/Totals';
import { LockIcon } from '@/components/ui/Icons';

/** Sticky order summary beside the checkout steps. */
export default function OrderSummary({ t }) {
  const { bag, promo } = useShop();
  return (
    <aside className="panel sticky summary-first" data-rise>
      <h3>Order summary</h3>
      {bag.map((l, i) => <LineItem key={i + l.id} line={l} mini />)}
      <div style={{ height: 14 }} />
      <PromoField />
      <div style={{ height: 12 }} />
      <Totals t={t} promo={promo} full />
      <div style={{ height: 12 }} />
      <div className="secure"><LockIcon /> Demo checkout · your card is never charged</div>
    </aside>
  );
}
