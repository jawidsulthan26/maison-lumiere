'use client';
import { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { PROMOS } from '@/lib/pricing';

/** Promo code input (LUMIERE10 / WELCOME15). */
export default function PromoField() {
  const { promo, applyPromo, toast } = useShop();
  const [code, setCode] = useState(promo || '');
  const [bad, setBad] = useState(false);
  const apply = e => {
    e.preventDefault();
    const r = applyPromo(code);
    setBad(!r.ok);
    if (r.ok && r.label) toast(`✓ ${r.label} applied`);
  };
  return (
    <form onSubmit={apply}>
      <div className="promo">
        <div className="field"><input id="promo-in" placeholder=" " value={code} onChange={e => { setCode(e.target.value); setBad(false); }} autoComplete="off" /><label htmlFor="promo-in">Promo code</label></div>
        <button type="submit">Apply</button>
      </div>
      <div className={`promo-msg ${bad ? 'bad' : promo ? 'ok' : ''}`}>
        {bad ? 'That code isn’t valid — try LUMIERE10' : promo ? `✓ ${PROMOS[promo].label} applied` : 'Try LUMIERE10 or WELCOME15'}
      </div>
    </form>
  );
}
