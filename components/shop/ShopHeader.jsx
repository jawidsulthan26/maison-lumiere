'use client';
/** Sticky header on every shop page: back · brand · search / wishlist / bag (or "Secure checkout"). */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CONFIG } from '@/lib/config';
import { useShop } from '@/context/ShopContext';
import { BackIcon, BagIcon, HeartIcon, LockIcon, SearchIcon } from '@/components/ui/Icons';

export default function ShopHeader({ backLabel = 'Back', backHref, onBack, secure = false }) {
  const router = useRouter();
  const { count, wish, openDrawer, openSearch } = useShop();
  const back = () => {
    if (onBack) return onBack();
    if (backHref) return router.push(backHref);
    window.history.length > 1 ? router.back() : router.push('/');
  };
  return (
    <header className="view__bar">
      <button className="view__back" onClick={back} data-cursor="link"><BackIcon /><span>{backLabel}</span></button>
      <Link className="view__brand" href="/" data-cursor="link">{CONFIG.brand}</Link>
      <div className="view__actions">
        {secure ? <span className="secure"><LockIcon /> Secure checkout</span> : (
          <>
            <button className="icon-btn" onClick={openSearch} aria-label="Search" data-cursor="link"><SearchIcon /></button>
            <Link className="icon-btn" href="/wishlist" aria-label="Wishlist" data-cursor="link"><HeartIcon /><span className={`count-badge ${wish.length ? 'is-on' : ''}`}>{wish.length}</span></Link>
            <button className="icon-btn" onClick={openDrawer} aria-label="Bag" data-cursor="link" data-bag-target><BagIcon /><span className={`count-badge ${count ? 'is-on' : ''}`}>{count}</span></button>
          </>
        )}
      </div>
    </header>
  );
}
