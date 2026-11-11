'use client';
/**
 * Shop state for every page: bag, wishlist, promo, saved checkout details, orders,
 * plus the UI shared across pages (bag drawer, search, toast). Persisted to localStorage.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { load, save } from '@/lib/storage';
import { getProduct } from '@/lib/products';
import { lineKey, unitPrice, PROMOS, computeTotals, shippingById } from '@/lib/pricing';
import { deliveryWindow } from '@/lib/delivery';
import { cardBrand } from '@/lib/validation';

const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);

export function ShopProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [bag, setBag] = useState([]);
  const [wish, setWish] = useState([]);
  const [promo, setPromo] = useState(null);
  const [details, setDetails] = useState({});
  const [lastOrder, setLastOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef();

  // hydrate from storage after mount (keeps server and first client render identical)
  useEffect(() => {
    setBag(load('bag', []).filter(l => getProduct(l.id)));
    setWish(load('wish', []).filter(getProduct));
    setPromo(load('promo', null));
    setDetails(load('details', {}));
    setLastOrder(load('lastOrder', null));
    setReady(true);
  }, []);
  useEffect(() => { if (ready) save('bag', bag); }, [bag, ready]);
  useEffect(() => { if (ready) save('wish', wish); }, [wish, ready]);
  useEffect(() => { if (ready) save('promo', promo); }, [promo, ready]);

  const toast = useCallback((msg, img = null) => {
    setToastMsg({ msg, img, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const addToBag = useCallback(line => {
    setBag(b => {
      const k = lineKey(line), i = b.findIndex(x => lineKey(x) === k);
      if (i < 0) return [...b, { qty: 1, ...line }];
      const n = [...b]; n[i] = { ...n[i], qty: Math.min(10, n[i].qty + (line.qty || 1)), msg: line.msg || n[i].msg }; return n;
    });
  }, []);
  const setQty = useCallback((i, d) => setBag(b => b.map((l, k) => (k === i ? { ...l, qty: Math.max(1, Math.min(10, l.qty + d)) } : l))), []);
  const removeLine = useCallback(i => setBag(b => b.filter((_, k) => k !== i)), []);
  /** returns true when the fragrance was added, false when removed */
  const toggleWish = useCallback(id => {
    const on = !wish.includes(id);
    setWish(w => (on ? [...w.filter(x => x !== id), id] : w.filter(x => x !== id)));
    return on;
  }, [wish]);
  const applyPromo = useCallback(code => {
    const c = (code || '').trim().toUpperCase();
    if (!c) { setPromo(null); return { ok: true, cleared: true }; }
    if (PROMOS[c]) { setPromo(c); return { ok: true, label: PROMOS[c].label }; }
    return { ok: false };
  }, []);
  const saveDetails = useCallback(d => { setDetails(d); save('details', d); }, []);

  /** demo order placement — returns the order number */
  const placeOrder = useCallback(({ ship, pay, card, upi }) => {
    const t = computeTotals(bag, { promo, ship, pay });
    const s = shippingById(ship), digits = (card?.num || '').replace(/\D/g, '');
    const order = {
      no: 'ML' + String(Date.now()).slice(-7), date: new Date().toISOString(),
      items: bag.map(l => ({ ...l, name: getProduct(l.id).name, unit: unitPrice(l) })),
      totals: t, promo, ship: { name: s.name, eta: deliveryWindow(s.days) }, details,
      pay: pay === 'card' ? `${cardBrand(digits)} •••• ${digits.slice(-4)}` : pay === 'upi' ? `UPI · ${upi}` : 'Cash on delivery',
    };
    setLastOrder(order); save('lastOrder', order);
    save('orders', [order, ...load('orders', [])].slice(0, 20));
    setBag([]); setPromo(null);
    return order.no;
  }, [bag, promo, details]);

  const value = useMemo(() => ({
    ready, bag, wish, promo, details, lastOrder,
    count: bag.reduce((n, l) => n + l.qty, 0),
    addToBag, setQty, removeLine, toggleWish, applyPromo, saveDetails, placeOrder,
    drawerOpen, openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false),
    searchOpen, openSearch: () => setSearchOpen(true), closeSearch: () => setSearchOpen(false),
    toastMsg, toast,
  }), [ready, bag, wish, promo, details, lastOrder, addToBag, setQty, removeLine, toggleWish, applyPromo, saveDetails, placeOrder, drawerOpen, searchOpen, toastMsg, toast]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
