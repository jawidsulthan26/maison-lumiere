'use client';
/** Drop-down live search across names, families and notes. */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { PRODUCTS } from '@/lib/products';
import { stopScroll, startScroll } from '@/lib/smoothScroll';
import { CloseIcon, SearchIcon } from '@/components/ui/Icons';
import ProductTile from './ProductTile';

export default function SearchOverlay() {
  const { searchOpen, closeSearch } = useShop();
  const [q, setQ] = useState('');
  const box = useRef(null), veil = useRef(null), input = useRef(null), shown = useRef(false);
  const pathname = usePathname();
  useEffect(() => { closeSearch(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const b = box.current, v = veil.current;
    if (searchOpen) {
      shown.current = true; b.hidden = false; v.hidden = false; stopScroll();
      gsap.fromTo(b, { yPercent: -100 }, { yPercent: 0, duration: .7, ease: 'expo.out' });
      gsap.fromTo(v, { opacity: 0 }, { opacity: 1, duration: .4 });
      setTimeout(() => input.current?.focus(), 150);
      const esc = e => e.key === 'Escape' && closeSearch();
      addEventListener('keydown', esc); return () => removeEventListener('keydown', esc);
    } else if (shown.current) {
      gsap.to(b, { yPercent: -100, duration: .5, ease: 'power3.in', onComplete: () => { b.hidden = true; } });
      gsap.to(v, { opacity: 0, duration: .4, onComplete: () => { v.hidden = true; } });
      startScroll();
    }
  }, [searchOpen, closeSearch]);

  const term = q.trim().toLowerCase();
  const list = !term ? PRODUCTS : PRODUCTS.filter(p => [p.name, p.fam, p.top, p.heart, p.base].join(' ').toLowerCase().includes(term));
  return (
    <>
      <div className="veil veil--search" ref={veil} hidden onClick={closeSearch} />
      <div className="search" ref={box} hidden role="dialog" aria-label="Search" data-lenis-prevent>
        <div className="search__row">
          <SearchIcon />
          <input ref={input} value={q} onChange={e => setQ(e.target.value)} placeholder="Search fragrances" autoComplete="off" aria-label="Search fragrances" />
          <button className="icon-btn" onClick={closeSearch} aria-label="Close search"><CloseIcon /></button>
        </div>
        <p className="search__hint">Try “amber”, “rose”, “oud” or “vanilla”</p>
        <div className="search__res">
          {list.length ? list.map(p => <ProductTile key={p.id} product={p} onAfter={closeSearch} />) : <p className="body-s">No fragrance matches “{q}”.</p>}
        </div>
      </div>
    </>
  );
}
