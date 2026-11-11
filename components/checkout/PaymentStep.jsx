'use client';
/** Step 3 — Card / UPI / Cash on delivery. DEMO: no money moves; plug a real gateway into `pay()`. */
import { useRef, useState } from 'react';
import gsap from 'gsap';
import Field from '@/components/shop/Field';
import CardPreview from './CardPreview';
import OtpModal from './OtpModal';
import { money } from '@/lib/format';
import { shippingById, COD_FEE } from '@/lib/pricing';
import { deliveryWindow } from '@/lib/delivery';
import { validateCard, cardBrand, RX, DECLINE_CARD } from '@/lib/validation';
import { TruckIcon } from '@/components/ui/Icons';

const TABS = [['card', 'Card'], ['upi', 'UPI'], ['cod', 'Cash on delivery']];
const QR = (() => { // deterministic demo pattern
  let s = '', seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let y = 0; y < 29; y++) for (let x = 0; x < 29; x++) {
    const inF = (x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20);
    if (!inF && rnd() > .55) s += `M${x} ${y}h1v1h-1z`;
  }
  return s;
})();
const Finder = ({ x, y }) => <><rect x={x} y={y} width="7" height="7" fill="#1E1915" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" fill="#1E1915" /></>;

function formatCard(v) {
  const d = v.replace(/\D/g, '').slice(0, 19), amex = cardBrand(d) === 'Amex';
  const g = amex ? [4, 6, 5] : [4, 4, 4, 4, 3]; let out = [], i = 0;
  g.forEach(n => { if (d.slice(i, i + n)) out.push(d.slice(i, i + n)); i += n; });
  return out.join(' ');
}
const formatExp = v => { let e = v.replace(/\D/g, '').slice(0, 4); return e.length > 2 ? e.slice(0, 2) + '/' + e.slice(2) : e; };

export default function PaymentStep({ pay, setPay, ship, total, holder, onBack, onPaid }) {
  const [card, setCard] = useState({ num: '', name: holder || '', exp: '', cvv: '' });
  const [upi, setUpi] = useState('');
  const [err, setErr] = useState({});
  const [flip, setFlip] = useState(false);
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState('');
  const [payErr, setPayErr] = useState('');
  const [otp, setOtp] = useState(false);
  const fill = useRef(null);
  const s = shippingById(ship);
  const setC = k => v => { setCard(c => ({ ...c, [k]: k === 'num' ? formatCard(v) : k === 'exp' ? formatExp(v) : k === 'cvv' ? v.replace(/\D/g, '').slice(0, 4) : v })); setErr(e => ({ ...e, [k === 'num' ? 'cnum' : k === 'name' ? 'cname' : k === 'exp' ? 'cexp' : 'ccvv']: undefined })); };

  const reset = msg => { setBusy(false); setLabel(''); gsap.set(fill.current, { width: 0 }); if (msg) setPayErr(msg); };
  const pay_ = () => {
    setPayErr('');
    if (pay === 'card') { const e = validateCard(card); setErr(e); if (Object.keys(e).length) return; }
    if (pay === 'upi' && !RX.upi.test(upi)) { setErr({ upi: 'Enter a UPI ID like name@okbank' }); return; }
    setBusy(true);
    const msgs = ['Securing connection…', 'Authorising payment…', 'Confirming with your bank…'];
    let k = 0; setLabel(msgs[0]);
    const iv = setInterval(() => setLabel(msgs[Math.min(++k, 2)]), 800);
    gsap.fromTo(fill.current, { width: '0%' }, { width: '100%', duration: 2.4, ease: 'power1.inOut', onComplete: () => {
      clearInterval(iv);
      if (pay === 'card' && card.num.replace(/\D/g, '') === DECLINE_CARD) return reset('Your bank declined this card (demo). Try 4242 4242 4242 4242.');
      if (pay === 'card') return setOtp(true);
      onPaid({ card, upi });
    } });
  };
  const tabIndex = TABS.findIndex(t => t[0] === pay);
  return (
    <div className="co-step">
      <h2>Payment</h2>
      <div className="review"><b>Delivery</b><button className="link-btn" onClick={onBack}>Change</button><span style={{ gridColumn: '1/-1' }}>{s.name} · arrives {deliveryWindow(s.days)}</span></div>
      <div className="tabs" role="tablist">
        <span className="tabs__ink" style={{ transform: `translateX(${tabIndex * 100}%)` }} />
        {TABS.map(([id, n]) => <button key={id} role="tab" aria-selected={pay === id} className={pay === id ? 'is-on' : ''} onClick={() => setPay(id)}>{n}</button>)}
      </div>

      {pay === 'card' && (
        <div className="pay-pane is-on">
          <div className="demo-note">✦ <span><b>Demo payment — no money moves.</b> Use <b>4242 4242 4242 4242</b>, any future date and any CVV. <b>4000 0000 0000 0002</b> shows a declined card.{' '}
            <button onClick={() => setCard(c => ({ ...c, num: '4242 4242 4242 4242', exp: '12/29', cvv: '123' }))}>Fill test card</button></span></div>
          <CardPreview card={card} holder={holder} flipped={flip} />
          <div className="fgrid">
            <div className="span2"><Field id="cnum" label="Card number" value={card.num} onChange={setC('num')} error={err.cnum} inputMode="numeric" autoComplete="cc-number" maxLength={23} /></div>
            <div className="span2"><Field id="cname" label="Name on card" value={card.name} onChange={setC('name')} error={err.cname} autoComplete="cc-name" /></div>
            <Field id="cexp" label="Expiry (MM/YY)" value={card.exp} onChange={setC('exp')} error={err.cexp} inputMode="numeric" autoComplete="cc-exp" maxLength={5} />
            <Field id="ccvv" label="CVV" type="password" value={card.cvv} onChange={setC('cvv')} error={err.ccvv} inputMode="numeric" autoComplete="cc-csc" maxLength={4}
              onFocus={() => setFlip(true)} onBlur={() => setFlip(false)} />
          </div>
        </div>
      )}
      {pay === 'upi' && (
        <div className="pay-pane is-on">
          <div className="demo-note">✦ <span><b>Demo UPI.</b> Enter any UPI ID in the format <b>name@bank</b> — nothing is requested from your app.</span></div>
          <Field id="upi" label="UPI ID (e.g. name@okbank)" value={upi} onChange={v => { setUpi(v); setErr({}); }} error={err.upi} autoComplete="off" />
          <div className="upi-qr">
            <svg viewBox="0 0 29 29" aria-label="Demo QR pattern"><rect width="29" height="29" fill="#fff" /><path d={QR} fill="#1E1915" /><Finder x={0} y={0} /><Finder x={22} y={0} /><Finder x={0} y={22} /></svg>
            <div><b style={{ fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase' }}>Or scan to pay</b><p className="body-s">Demo pattern only — a real integration shows your merchant QR here.</p></div>
          </div>
        </div>
      )}
      {pay === 'cod' && (
        <div className="pay-pane is-on">
          <div className="demo-note"><TruckIcon /><span><b>Pay when it arrives.</b> A {money(COD_FEE)} handling fee applies. Cash or card on delivery.</span></div>
        </div>
      )}

      <div className="co-actions">
        <button className="link-btn" onClick={onBack}>← Back to delivery</button>
        <button className="btn-solid" onClick={pay_} disabled={busy} data-cursor="link"><span className="btn-fill" ref={fill} /><span>{busy ? label : `Pay ${money(total)}`}</span></button>
      </div>
      <p className="err" role="alert" style={{ color: '#B5472F', fontSize: 13, minHeight: 18 }}>{payErr}</p>
      {otp && <OtpModal last4={card.num.replace(/\D/g, '').slice(-4)} total={total}
        onDone={() => { setOtp(false); onPaid({ card, upi }); }}
        onCancel={() => { setOtp(false); reset('Payment cancelled — you have not been charged.'); }} />}
    </div>
  );
}
