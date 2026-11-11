'use client';
/** Product tile used by Shop, Search, Wishlist and "You may also love". */
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { money } from '@/lib/format';
import { setFlight, flyToBag } from '@/lib/flight';
import HeartButton from './HeartButton';

export default function ProductTile({ product: p, action = 'quick', onAfter }) {
  const { addToBag, toast, openDrawer, toggleWish } = useShop();
  const add = e => {
    e.preventDefault(); e.stopPropagation();
    if (action === 'move') toggleWish(p.id);
    addToBag({ id: p.id, size: 1, conc: 'edp', engrave: '', gift: false, qty: 1 });
    flyToBag(e.currentTarget.closest('.tile').querySelector('img'));
    toast(<><b>{p.name}</b> added to your bag</>, p.img);
    setTimeout(openDrawer, 850);
    onAfter?.();
  };
  return (
    <article className="tile" data-cursor="view">
      <HeartButton id={p.id} className="tile__heart" />
      <Link href={`/product/${p.id}`} className="tile__link" onClick={e => setFlight(e.currentTarget.querySelector('img'))} aria-label={`${p.name} — ${money(p.price)}`}>
        <div className="tile__media"><img src={p.img} alt={p.name} loading="lazy" /></div>
        <h3 className="tile__name">{p.name}</h3>
        <p className="tile__fam">{p.fam}</p>
        <p className="tile__price">{money(p.price)} <small>· 50 ml</small></p>
      </Link>
      <button className="link-btn tile__quick" onClick={add} data-cursor="link">{action === 'move' ? 'Move to bag' : 'Quick add'}</button>
    </article>
  );
}
