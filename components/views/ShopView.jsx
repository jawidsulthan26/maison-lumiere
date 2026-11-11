'use client';
/** /shop — all fragrances with family filters and price sort. */
import { useMemo, useRef, useState } from 'react';
import ShopHeader from '@/components/shop/ShopHeader';
import ProductTile from '@/components/shop/ProductTile';
import { PRODUCTS, FAMILIES, matchesFamily } from '@/lib/products';
import useReveal from '@/hooks/useReveal';

export default function ShopView() {
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('featured');
  const ref = useRef(null);
  const list = useMemo(() => {
    const l = PRODUCTS.filter(p => matchesFamily(p, filter));
    if (sort === 'low') return [...l].sort((a, b) => a.price - b.price);
    if (sort === 'high') return [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [filter, sort]);
  useReveal(ref, [filter, sort], '.tile');
  return (
    <div className="view" ref={ref}>
      <ShopHeader backLabel="Home" backHref="/" />
      <div className="shop-wrap">
        <div className="page-head" data-rise>
          <span className="eyebrow-c">The collection</span>
          <h1>All Fragrances</h1>
          <p className="body-s">Seven signatures, each composed with carefully selected notes and a lasting impression.</p>
        </div>
        <div className="filters" data-rise role="group" aria-label="Filter by family">
          {FAMILIES.map(f => <button key={f} className={`chip ${f === filter ? 'is-on' : ''}`} aria-pressed={f === filter} onClick={() => setFilter(f)}>{f}</button>)}
        </div>
        <div className="sortbar" data-rise>
          <span>{list.length} fragrance{list.length === 1 ? '' : 's'}</span>
          <select className="select" value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort">
            <option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
          </select>
        </div>
        <div className="tiles">{list.map(p => <ProductTile key={p.id} product={p} />)}</div>
      </div>
    </div>
  );
}
