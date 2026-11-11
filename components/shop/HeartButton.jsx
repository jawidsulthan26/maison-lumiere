'use client';
import gsap from 'gsap';
import { useShop } from '@/context/ShopContext';
import { getProduct } from '@/lib/products';
import { HeartIcon } from '@/components/ui/Icons';

/** Wishlist heart with a springy pop. */
export default function HeartButton({ id, className = '', style }) {
  const { wish, toggleWish, toast } = useShop();
  const on = wish.includes(id);
  const click = e => {
    e.preventDefault(); e.stopPropagation();
    const added = toggleWish(id), p = getProduct(id);
    gsap.fromTo(e.currentTarget, { scale: .7 }, { scale: 1, duration: .7, ease: 'elastic.out(1,.4)' });
    toast(added ? <>♥ Saved <b>{p.name}</b> to your wishlist</> : 'Removed from wishlist', added ? p.img : null);
  };
  return (
    <button className={`icon-btn heart-btn ${on ? 'is-on' : ''} ${className}`} style={style} onClick={click}
      aria-pressed={on} aria-label={`${on ? 'Remove' : 'Save'} ${getProduct(id)?.name} ${on ? 'from' : 'to'} wishlist`} data-cursor="link">
      <HeartIcon />
    </button>
  );
}
