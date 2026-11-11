'use client';
import { useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import Field from '@/components/shop/Field';
import { validateDetails } from '@/lib/validation';

const COUNTRIES = ['United States', 'India', 'United Arab Emirates', 'United Kingdom', 'Saudi Arabia', 'Singapore', 'Canada', 'Australia'];

/** Step 1 — contact + shipping address. */
export default function DetailsStep({ initial, onNext }) {
  const [d, setD] = useState({ country: 'United States', ...initial });
  const [err, setErr] = useState({});
  const set = k => v => { setD(x => ({ ...x, [k]: v })); if (err[k]) setErr(e => ({ ...e, [k]: undefined })); };
  const submit = e => {
    e.preventDefault();
    const errors = validateDetails(d);
    setErr(errors);
    const first = Object.keys(errors)[0];
    if (first) {
      const el = document.getElementById(`f-${first}`); el?.focus();
      gsap.fromTo(el?.closest('.field'), { x: -8 }, { x: 0, duration: .6, ease: 'elastic.out(1,.3)' });
      return;
    }
    onNext(d);
  };
  const f = (k, label, props = {}) => <Field id={k} label={label} value={d[k]} onChange={set(k)} error={err[k]} {...props} />;
  return (
    <form className="co-step" onSubmit={submit} noValidate>
      <h2>Your details</h2>
      <div className="fgrid">
        {f('email', 'Email', { type: 'email', autoComplete: 'email', autoFocus: true })}
        {f('phone', 'Phone', { type: 'tel', autoComplete: 'tel' })}
        {f('first', 'First name', { autoComplete: 'given-name' })}
        {f('last', 'Last name', { autoComplete: 'family-name' })}
        <div className="span2">{f('addr', 'Address', { autoComplete: 'address-line1' })}</div>
        <div className="span2">{f('addr2', 'Apartment, suite (optional)', { autoComplete: 'address-line2' })}</div>
      </div>
      <div className="fgrid3">
        {f('city', 'City', { autoComplete: 'address-level2' })}
        {f('zip', 'Postal code', { autoComplete: 'postal-code', inputMode: 'numeric' })}
        <div className="field">
          <select id="f-country" value={d.country} onChange={e => set('country')(e.target.value)} autoComplete="country-name">
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <label htmlFor="f-country">Country</label>
        </div>
      </div>
      <label className="toggle">
        <div><span>Email me exclusive launches</span><small>Early access, never spam</small></div>
        <input type="checkbox" checked={!!d.news} onChange={e => set('news')(e.target.checked)} /><span className="switch" />
      </label>
      <div className="co-actions">
        <Link className="link-btn" href="/cart">← Back to cart</Link>
        <button type="submit" className="btn-solid" data-cursor="link">Continue to delivery</button>
      </div>
    </form>
  );
}
