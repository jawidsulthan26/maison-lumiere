'use client';
/** /order/[id] — confirmation: animated check, confetti, tracker, details, receipt. */
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import ShopHeader from '@/components/shop/ShopHeader';
import LineItem from '@/components/shop/LineItem';
import Confetti from '@/components/checkout/Confetti';
import { useShop } from '@/context/ShopContext';
import { money } from '@/lib/format';
import { downloadReceipt } from '@/lib/receipt';

export default function OrderView({ id }) {
  const { ready, lastOrder: o } = useShop();
  const ref = useRef(null);
  const match = o && o.no === id;
  useEffect(() => {
    if (!match || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ delay: .4 })
        .to('.done__check circle', { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' })
        .to('.done__check path', { strokeDashoffset: 0, duration: .6, ease: 'power2.out' }, '-=.2')
        .from('.done > *:not(svg)', { y: 24, opacity: 0, stagger: .08, duration: .9, ease: 'expo.out' }, .3)
        .from('.done-grid .panel', { y: 30, opacity: 0, stagger: .1, duration: .9, ease: 'expo.out' }, .6);
    }, ref);
    return () => ctx.revert();
  }, [match]);

  if (!ready) return <div className="view"><ShopHeader backLabel="Home" backHref="/" /></div>;
  if (!match) return (
    <div className="view"><ShopHeader backLabel="Home" backHref="/" />
      <div className="shop-wrap"><div className="empty"><h4>Order not found</h4><p className="body-s">Orders are kept on this device only (demo).</p><Link className="btn-solid" href="/shop">Shop fragrances</Link></div></div>
    </div>
  );
  const D = o.details, t = o.totals;
  return (
    <div className="view" ref={ref}>
      <Confetti />
      <ShopHeader backLabel="Home" backHref="/" />
      <div className="shop-wrap">
        <div className="done">
          <svg className="done__check" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" /><path d="M38 62l15 15 30-33" /></svg>
          <span className="done__no">Order {o.no} · confirmed</span>
          <h1>Thank you,<br />{D.first || 'friend'}</h1>
          <p className="body-s" style={{ maxWidth: 520 }}>Your fragrance is being prepared and hand-wrapped. A confirmation has been sent to <b>{D.email}</b> (demo — no email is actually sent).</p>
        </div>
        <div className="track">{['Order placed', 'Packed', 'Shipped', 'Delivered'].map((s, i) => <div key={s} className={i === 0 ? 'is-on' : ''}><i />{s}</div>)}</div>
        <div className="done-grid">
          <div className="panel"><b>Arriving</b>{o.ship.eta}<br />{o.ship.name} delivery</div>
          <div className="panel"><b>Delivering to</b>{D.first} {D.last}<br />{D.addr}{D.addr2 ? `, ${D.addr2}` : ''}<br />{D.city} {D.zip}, {D.country}</div>
          <div className="panel"><b>Paid with</b>{o.pay}<br />Total {money(t.total)}</div>
        </div>
        <div className="panel">
          <h3>Your order</h3>
          {o.items.map((l, i) => <LineItem key={i} line={l} unit={l.unit} mini />)}
          <div style={{ height: 14 }} />
          <div className="totals">
            <div><span>Subtotal</span><span>{money(t.sub)}</span></div>
            {t.disc > 0 && <div className="disc"><span>Promo</span><span>−{money(t.disc)}</span></div>}
            <div><span>Shipping</span><span>{t.ship ? money(t.ship) : 'Free'}</span></div>
            {t.cod > 0 && <div><span>COD fee</span><span>{money(t.cod)}</span></div>}
            <div><span>Tax</span><span>{money(t.tax)}</span></div>
            <div className="grand"><span>Total paid</span><b>{money(t.total)}</b></div>
          </div>
        </div>
        <div className="done-actions"><Link className="btn-solid" href="/shop">Continue shopping</Link><button className="btn-ghost" onClick={() => downloadReceipt(o)}>Download receipt</button></div>
      </div>
    </div>
  );
}
