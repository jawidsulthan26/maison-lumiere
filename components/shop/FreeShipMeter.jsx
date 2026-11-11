import { money } from '@/lib/format';
import { FREE_SHIPPING_FROM } from '@/lib/pricing';

/** "You're $48 away from free shipping" with a shimmering progress bar. */
export default function FreeShipMeter({ net }) {
  const left = Math.max(0, FREE_SHIPPING_FROM - net), pct = Math.min(100, (net / FREE_SHIPPING_FROM) * 100);
  return (
    <div className="ship">
      <p>{left > 0 ? <>You&apos;re <b>{money(left)}</b> away from free shipping</> : <b>You’ve unlocked free shipping ✦</b>}</p>
      <div className="ship__bar"><i style={{ '--p': `${pct}%` }} /></div>
    </div>
  );
}
