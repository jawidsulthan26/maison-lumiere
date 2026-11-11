'use client';
/** Demo bank verification ("3-D Secure") — any 6 digits pass. */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { money } from '@/lib/format';

export default function OtpModal({ last4, total, onDone, onCancel }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [err, setErr] = useState('');
  const refs = useRef([]), box = useRef(null);
  useEffect(() => { refs.current[0]?.focus(); gsap.from(box.current, { y: 40, opacity: 0, scale: .96, duration: .7, ease: 'expo.out' }); }, []);
  const set = (i, v) => {
    const c = v.replace(/\D/g, '');
    if (c.length > 1) { // pasted code
      const n = [...digits]; c.slice(0, 6).split('').forEach((ch, j) => (n[j] = ch)); setDigits(n); refs.current[Math.min(5, c.length)]?.focus(); return;
    }
    const n = [...digits]; n[i] = c; setDigits(n); setErr('');
    if (c && refs.current[i + 1]) refs.current[i + 1].focus();
  };
  const verify = () => digits.join('').length < 6 ? setErr('Enter all 6 digits') : onDone();
  // rendered on <body>: the payment panel's backdrop-filter would otherwise trap a fixed overlay
  return createPortal(
    <div className="otp">
      <div className="otp__box" ref={box} role="dialog" aria-modal="true" aria-label="Verify payment">
        <span className="eyebrow-c">Bank verification · demo</span>
        <h3>Enter the code</h3>
        <p className="body-s">We sent a 6-digit code to the phone linked to your card ending {last4}. <b>Demo code: 123456</b> (any 6 digits work).</p>
        <div className="otp__inputs">
          {digits.map((d, i) => (
            <input key={i} ref={el => (refs.current[i] = el)} value={d} inputMode="numeric" maxLength={6} aria-label={`Digit ${i + 1}`}
              onChange={e => set(i, e.target.value)}
              onKeyDown={e => { if (e.key === 'Backspace' && !d && i) refs.current[i - 1].focus(); if (e.key === 'Enter') verify(); if (e.key === 'Escape') onCancel(); }} />
          ))}
        </div>
        <p className="otp__err">{err}</p>
        <button className="btn-solid btn-block" onClick={verify}>Verify &amp; pay {money(total)}</button>
        <button className="link-btn" style={{ alignSelf: 'center' }} onClick={onCancel}>Cancel</button>
      </div>
    </div>,
    document.body
  );
}
