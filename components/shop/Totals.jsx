import { money } from '@/lib/format';
import { FREE_SHIPPING_FROM, TAX_RATE } from '@/lib/pricing';

/** Subtotal → promo → shipping → tax → total. `full` shows checkout lines (shipping, COD, tax). */
export default function Totals({ t, promo, full = false, totalLabel = 'Total' }) {
  return (
    <div className="totals">
      <div><span>Subtotal</span><span>{money(t.sub)}</span></div>
      {t.disc > 0 && <div className="disc"><span>Promo {promo}</span><span>−{money(t.disc)}</span></div>}
      {full ? (
        <>
          <div><span>Shipping</span><span>{t.ship ? money(t.ship) : 'Free'}</span></div>
          {t.cod > 0 && <div><span>Cash on delivery fee</span><span>{money(t.cod)}</span></div>}
          <div><span>Tax (est. {TAX_RATE * 100}%)</span><span>{money(t.tax)}</span></div>
        </>
      ) : <div><span>Shipping</span><span>{t.net >= FREE_SHIPPING_FROM ? 'Free' : 'Calculated at checkout'}</span></div>}
      <div className="grand"><span>{totalLabel}</span><b>{money(full ? t.total : t.net)}</b></div>
    </div>
  );
}
