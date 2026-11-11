'use client';
/** 3D card that mirrors what you type, tilts toward the cursor and flips for the CVV. */
import { useRef } from 'react';
import gsap from 'gsap';
import { CONFIG } from '@/lib/config';
import { cardBrand } from '@/lib/validation';

export default function CardPreview({ card, holder, flipped }) {
  const ref = useRef(null);
  const d = (card.num || '').replace(/\D/g, ''), amex = cardBrand(d) === 'Amex';
  const mask = amex ? '•••• •••••• •••••' : '•••• •••• •••• ••••';
  let k = 0; const num = mask.replace(/•/g, () => d[k++] || '•');
  const move = e => {
    const r = ref.current.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    ref.current.querySelectorAll('.cc__face').forEach(f => { f.style.setProperty('--gx', x * 100 + '%'); f.style.setProperty('--gy', y * 100 + '%'); });
    gsap.to(ref.current.firstChild, { rotationY: (flipped ? 180 : 0) + (x - .5) * 16, rotationX: -(y - .5) * 10, duration: .6 });
  };
  const leave = () => gsap.to(ref.current.firstChild, { rotationY: flipped ? 180 : 0, rotationX: 0, duration: .8, clearProps: 'transform' });
  return (
    <div className={`cc ${flipped ? 'is-flip' : ''}`} ref={ref} onPointerMove={move} onPointerLeave={leave} aria-hidden="true">
      <div className="cc__inner">
        <div className="cc__face cc__front">
          <div className="cc__top"><span className="cc__chip" /><span className="cc__brand">{cardBrand(d)}</span></div>
          <div className="cc__num">{num}</div>
          <div className="cc__row">
            <div><small>Card holder</small><span>{card.name || holder || 'Your Name'}</span></div>
            <div style={{ textAlign: 'right' }}><small>Expires</small><span>{card.exp || 'MM/YY'}</span></div>
          </div>
        </div>
        <div className="cc__face cc__back"><div className="cc__stripe" /><div className="cc__sign">{(card.cvv || '').replace(/./g, '•') || '•••'}</div><p>Demo card preview · {CONFIG.brand}</p></div>
      </div>
    </div>
  );
}
