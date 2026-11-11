'use client';
/** Slide-in quick bag (available on every page). */
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useShop } from '@/context/ShopContext';
import { computeTotals } from '@/lib/pricing';
import { money } from '@/lib/format';
import { stopScroll, startScroll } from '@/lib/smoothScroll';
import { BagIcon, CloseIcon } from '@/components/ui/Icons';
import LineItem from './LineItem';
import FreeShipMeter from './FreeShipMeter';
import Totals from './Totals';

export default function BagDrawer() {
  const { drawerOpen, closeDrawer, bag, count, promo, setQty, removeLine, toast } = useShop();
  const panel = useRef(null), veil = useRef(null), shown = useRef(false);
  const t = computeTotals(bag, { promo });

  useEffect(() => {
    const p = panel.current, v = veil.current;
    if (drawerOpen) {
      shown.current = true; p.hidden = false; v.hidden = false; stopScroll();
      gsap.fromTo(p, { xPercent: 100 }, { xPercent: 0, duration: .8, ease: 'expo.out' });
      gsap.fromTo(v, { opacity: 0 }, { opacity: 1, duration: .5 });
      gsap.from(p.querySelectorAll('.line'), { x: 40, opacity: 0, duration: .8, ease: 'expo.out', stagger: .06, delay: .15 });
      setTimeout(() => p.querySelector('button')?.focus({ preventScroll: true }), 300);
      const esc = e => e.key === 'Escape' && closeDrawer();
      addEventListener('keydown', esc); return () => removeEventListener('keydown', esc);
    } else if (shown.current) {
      gsap.to(p, { xPercent: 100, duration: .55, ease: 'power3.in', onComplete: () => { p.hidden = true; } });
      gsap.to(v, { opacity: 0, duration: .5, onComplete: () => { v.hidden = true; } });
      startScroll();
    }
  }, [drawerOpen, closeDrawer]);

  const remove = i => { const n = bag[i]; removeLine(i); if (n) toast('Removed from your bag'); };
  return (
    <>
      <div className="veil" ref={veil} hidden onClick={closeDrawer} />
      <aside className="drawer" ref={panel} hidden role="dialog" aria-modal="true" aria-label="Your bag" data-lenis-prevent>
        <div className="drawer__head"><h3>Your bag ({count})</h3><button className="icon-btn" onClick={closeDrawer} aria-label="Close bag"><CloseIcon /></button></div>
        <div className="drawer__body">
          {bag.length ? <><FreeShipMeter net={t.net} />{bag.map((l, i) => <LineItem key={i + l.id} line={l} index={i} onQty={setQty} onRemove={remove} />)}</> : (
            <div className="empty"><BagIcon /><h4>Your bag is empty</h4><p className="body-s">Discover a scent that feels beautifully yours.</p>
              <Link className="btn-solid" href="/shop" onClick={closeDrawer}>Shop fragrances</Link></div>
          )}
        </div>
        {bag.length > 0 && (
          <div className="drawer__foot">
            <Totals t={t} promo={promo} />
            <Link className="btn-solid btn-block" href="/checkout" onClick={closeDrawer} data-cursor="link">Checkout · {money(t.net)}</Link>
            <Link className="link-btn" style={{ alignSelf: 'center' }} href="/cart" onClick={closeDrawer}>View full cart</Link>
          </div>
        )}
      </aside>
    </>
  );
}
