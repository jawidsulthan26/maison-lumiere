'use client';
/** Home navigation (hide-on-scroll + active section are driven by the engine). */
import Link from 'next/link';
import { CONFIG } from '@/lib/config';
import { useShop } from '@/context/ShopContext';
import Logo from '@/components/ui/Logo';
import { BagIcon, HeartIcon, SearchIcon } from '@/components/ui/Icons';

export default function HomeNav() {
  const { count, wish, openDrawer, openSearch } = useShop();
  return (
    <header className="nav" id="nav">
      <div className="wrap nav__inner">
        <a href="#top" className="nav__logo" aria-label={`${CONFIG.brand} — home`} data-cursor="link">
          <Logo /><span className="nav__logo-name">{CONFIG.brand}</span>
        </a>
        <ul className="nav__links">
          <li><a href="#top" className="is-active" data-cursor="link">Home</a></li>
          <li><a href="#product" data-cursor="link">Product</a></li>
          <li><Link href="/shop" data-cursor="link">Store</Link></li>
          <li><a href="#contact" data-cursor="link">Contact</a></li>
        </ul>
        <div className="nav__icons">
          <button aria-label="Search" onClick={openSearch} data-cursor="link"><SearchIcon /></button>
          <button aria-label="Bag" onClick={openDrawer} data-cursor="link" data-bag-target><BagIcon /><span className={`bag-count ${count ? 'is-on' : ''}`}>{count}</span></button>
          <Link href="/wishlist" aria-label="Wishlist" data-cursor="link"><HeartIcon /><span className={`bag-count ${wish.length ? 'is-on' : ''}`}>{wish.length}</span></Link>
        </div>
      </div>
    </header>
  );
}
