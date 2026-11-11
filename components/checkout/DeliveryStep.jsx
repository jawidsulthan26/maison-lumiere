import { SHIPPING } from '@/lib/pricing';
import { deliveryWindow } from '@/lib/delivery';
import { money } from '@/lib/format';
import { GiftIcon } from '@/components/ui/Icons';

/** Step 2 — delivery speed (real arrival dates). */
export default function DeliveryStep({ details: D, ship, setShip, net, hasGift, onBack, onNext }) {
  return (
    <div className="co-step">
      <h2>Delivery</h2>
      <div className="review">
        <b>Ship to</b><button className="link-btn" onClick={onBack}>Edit</button>
        <span style={{ gridColumn: '1/-1' }}>{D.first} {D.last} · {D.addr}{D.addr2 ? `, ${D.addr2}` : ''}, {D.city} {D.zip}, {D.country}</span>
      </div>
      <div role="radiogroup" aria-label="Delivery speed" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SHIPPING.map(s => {
          const pr = s.price(net);
          return (
            <label key={s.id} className={`choice ${ship === s.id ? 'is-on' : ''}`}>
              <input type="radio" name="ship" value={s.id} checked={ship === s.id} onChange={() => setShip(s.id)} />
              <span className="choice__dot" />
              <span className="choice__main"><b>{s.name}</b><small>Arrives {deliveryWindow(s.days)}{s.note ? ` · ${s.note}` : ''}</small></span>
              <span className="choice__price">{pr ? money(pr) : 'Free'}</span>
            </label>
          );
        })}
      </div>
      {hasGift && <div className="demo-note"><GiftIcon /><span><b>Gift order.</b> Prices are hidden on the packing slip and your note is handwritten on our card.</span></div>}
      <div className="co-actions">
        <button className="link-btn" onClick={onBack}>← Back to details</button>
        <button className="btn-solid" onClick={onNext} data-cursor="link">Continue to payment</button>
      </div>
    </div>
  );
}
