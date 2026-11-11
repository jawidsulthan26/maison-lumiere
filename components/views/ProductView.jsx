'use client';
/** /product/[slug] — options, live engraving on the glass, gift wrap, add to bag / buy now. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import ShopHeader from '@/components/shop/ShopHeader';
import ProductTile from '@/components/shop/ProductTile';
import HeartButton from '@/components/shop/HeartButton';
import Qty from '@/components/shop/Qty';
import { useShop } from '@/context/ShopContext';
import { PRODUCTS } from '@/lib/products';
import { SIZES, CONCENTRATIONS, ENGRAVING_FEE, GIFT_FEE, FREE_SHIPPING_FROM, unitPrice, concById } from '@/lib/pricing';
import { money } from '@/lib/format';
import { takeFlight, flyIn, flyToBag } from '@/lib/flight';
import { TruckIcon, SwapIcon, DropIcon } from '@/components/ui/Icons';
import useReveal from '@/hooks/useReveal';

const DROPS = Array.from({ length: 9 }, (_, i) => ({ s: 4 + (i % 4) * 2, l: 8 + (i * 37) % 84, t: 10 + (i * 23) % 70, d: i }));

export default function ProductView({ product: p }) {
  const router = useRouter();
  const { addToBag, toast, openDrawer } = useShop();
  const [opt, setOpt] = useState({ size: 1, conc: 'edp', engrave: '', gift: false, msg: '', qty: 1 });
  const root = useRef(null), stage = useRef(null), bottle = useRef(null), img = useRef(null), priceEl = useRef(null);
  const line = { id: p.id, ...opt };
  const price = unitPrice(line);
  const set = patch => setOpt(o => ({ ...o, ...patch }));
  useReveal(root, [p.id]);

  // the bottle you clicked flies into place (or rises in)
  useEffect(() => {
    const f = takeFlight();
    if (f) requestAnimationFrame(() => flyIn(f, img.current));
    else gsap.from(img.current, { y: 60, opacity: 0, scale: .9, duration: 1.4, ease: 'expo.out', delay: .2 });
  }, [p.id]);
  // the bottle tilts toward the cursor
  useEffect(() => {
    if (matchMedia('(hover: none)').matches) return;
    const st = stage.current, b = bottle.current;
    const rx = gsap.quickTo(b, 'rotationX', { duration: .8, ease: 'power3' }), ry = gsap.quickTo(b, 'rotationY', { duration: .8, ease: 'power3' });
    const move = e => { const r = st.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 22); rx(-((e.clientY - r.top) / r.height - .5) * 12); };
    const leave = () => { rx(0); ry(0); };
    st.addEventListener('pointermove', move); st.addEventListener('pointerleave', leave);
    return () => { st.removeEventListener('pointermove', move); st.removeEventListener('pointerleave', leave); };
  }, []);
  // price counts to its new value
  const shown = useRef(price);
  useEffect(() => {
    const o = { v: shown.current };
    const tw = gsap.to(o, { v: price, duration: .6, ease: 'power2.out', onUpdate: () => { if (priceEl.current) priceEl.current.textContent = money(Math.round(o.v)); } });
    shown.current = price; return () => tw.kill();
  }, [price]);

  const add = () => {
    addToBag(line);
    flyToBag(img.current);
    toast(<><b>{p.name}</b> added to your bag</>, p.img);
    setTimeout(openDrawer, 850);
  };
  const buy = () => { addToBag(line); router.push('/checkout'); };
  const related = PRODUCTS.filter(x => x.id !== p.id).slice(0, 4);

  return (
    <div className="view" ref={root}>
      <ShopHeader />
      <div className="shop-wrap">
        <div className="pd">
          <div className="pd__stage" ref={stage}>
            <div className="pd__glow" /><div className="pd__arch" />
            <div className="pd__drops" aria-hidden="true">{DROPS.map(d => <i key={d.d} style={{ width: d.s, height: d.s, left: d.l + '%', top: d.t + '%', animationDelay: `-${d.d}s` }} />)}</div>
            <div className="pd__bottle" ref={bottle}>
              <img ref={img} src={p.img} alt={`${p.name} perfume bottle`} style={{ transform: `scale(${[.8, .92, 1.06][opt.size]})` }} />
              <span className="pd__engrave" style={{ opacity: opt.engrave ? 1 : 0 }}>{opt.engrave}</span>
            </div>
          </div>
          <div className="pd__info">
            <nav className="crumbs" data-rise aria-label="Breadcrumb"><Link href="/">Home</Link>/<Link href="/shop">Shop</Link>/<span>{p.name}</span></nav>
            <span className="eyebrow-c" data-rise>{p.fam}</span>
            <h1 data-rise>{p.name}</h1>
            <div className="rating" data-rise><i>★★★★★</i> 4.9 · Loved by our community</div>
            <div className="pd__price" data-rise><b ref={priceEl}>{money(price)}</b><span>{SIZES[opt.size].ml} ml · {concById(opt.conc).label}</span></div>
            <p className="body-s" data-rise>{p.desc}</p>
            <div className="notes-pyr" data-rise><div><b>Top</b><span>{p.top}</span></div><div><b>Heart</b><span>{p.heart}</span></div><div><b>Base</b><span>{p.base}</span></div></div>
            <div className="opt" data-rise>
              <div className="opt__label">Size</div>
              <div className="pills" role="radiogroup" aria-label="Size">
                {SIZES.map((s, i) => <button key={s.ml} className={`pill ${i === opt.size ? 'is-on' : ''}`} role="radio" aria-checked={i === opt.size} onClick={() => set({ size: i })}>{s.ml} ml <small>{money(Math.round(p.price * s.k))}</small></button>)}
              </div>
            </div>
            <div className="opt" data-rise>
              <div className="opt__label">Concentration</div>
              <div className="pills" role="radiogroup" aria-label="Concentration">
                {CONCENTRATIONS.map(c => <button key={c.id} className={`pill ${c.id === opt.conc ? 'is-on' : ''}`} role="radio" aria-checked={c.id === opt.conc} onClick={() => set({ conc: c.id })}>{c.label}{c.k > 1 && <small>+30%</small>}</button>)}
              </div>
            </div>
            <div className="opt" data-rise>
              <div className="opt__label">Personalise <em>engraving +{money(ENGRAVING_FEE)} · watch it appear on the glass</em></div>
              <div className="field">
                <input id="pd-engrave" maxLength={12} placeholder=" " autoComplete="off" value={opt.engrave} onChange={e => set({ engrave: e.target.value.replace(/[<>]/g, '') })} />
                <label htmlFor="pd-engrave">Engraving (up to 12 letters)</label><span className="field__hint">{opt.engrave.length}/12</span>
              </div>
            </div>
            <label className="toggle" data-rise>
              <div><span>Gift wrap &amp; handwritten note</span><small>+{money(GIFT_FEE)} · signature box with ribbon</small></div>
              <input type="checkbox" checked={opt.gift} onChange={e => set({ gift: e.target.checked })} /><span className="switch" />
            </label>
            {opt.gift && <div className="field"><textarea id="pd-msg" placeholder=" " maxLength={160} value={opt.msg} onChange={e => set({ msg: e.target.value })} /><label htmlFor="pd-msg">Gift message</label></div>}
            <div className="pd__buy" data-rise>
              <Qty value={opt.qty} onChange={d => set({ qty: Math.max(1, Math.min(10, opt.qty + d)) })} />
              <button className="btn-solid" onClick={add} data-cursor="link">Add to bag · {money(price * opt.qty)}</button>
              <HeartButton id={p.id} className="pd__heart" />
              <button className="btn-ghost" onClick={buy} data-cursor="link">Buy now</button>
            </div>
            <div className="pd__perks" data-rise><div><TruckIcon />Free shipping over {money(FREE_SHIPPING_FROM)}</div><div><SwapIcon />30-day easy returns</div><div><DropIcon />2 free samples with every order</div></div>
            <div className="acc" data-rise>
              <details><summary>How to wear it</summary><p className="body-s">Spray on pulse points — wrists, neck and behind the ears — from 15 cm. Let it settle; don&apos;t rub. Layer with the matching body cream for a longer trail.</p></details>
              <details><summary>Ingredients</summary><p className="body-s">Alcohol denat., parfum (fragrance), aqua, limonene, linalool, coumarin, citral. Vegan formula, never tested on animals.</p></details>
              <details><summary>Delivery &amp; returns</summary><p className="body-s">Standard delivery in 4–6 working days, express in 2–3. Unopened bottles can be returned within 30 days for a full refund.</p></details>
            </div>
          </div>
        </div>
        <section className="related"><h2>You may also love</h2><div className="tiles">{related.map(r => <ProductTile key={r.id} product={r} />)}</div></section>
      </div>
    </div>
  );
}
