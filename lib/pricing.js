/**
 * Prices, options, promo codes, shipping — and the totals maths used by bag, cart, checkout and receipt.
 */
import { getProduct } from './products';

export const SIZES = [{ ml: 30, k: .62 }, { ml: 50, k: 1 }, { ml: 100, k: 1.55 }];
export const CONCENTRATIONS = [{ id: 'edp', label: 'Eau de Parfum', k: 1 }, { id: 'ext', label: 'Extrait', k: 1.3 }];
export const ENGRAVING_FEE = 10;
export const GIFT_FEE = 8;
export const FREE_SHIPPING_FROM = 250;
export const TAX_RATE = .05;
export const COD_FEE = 5;
export const PROMOS = { LUMIERE10: { pct: 10, label: '10% off' }, WELCOME15: { pct: 15, label: '15% off your first order' } };
export const SHIPPING = [
  { id: 'std', name: 'Standard', days: [4, 6], price: net => (net >= FREE_SHIPPING_FROM ? 0 : 9) },
  { id: 'exp', name: 'Express', days: [2, 3], price: () => 19 },
  { id: 'same', name: 'Same-day courier', days: [0, 0], price: () => 29, note: 'Order before 2 pm · select cities' },
];
export const shippingById = id => SHIPPING.find(s => s.id === id) || SHIPPING[0];
export const concById = id => CONCENTRATIONS.find(c => c.id === id) || CONCENTRATIONS[0];

/** price of one bottle with its options */
export function unitPrice(line) {
  const p = getProduct(line.id); if (!p) return 0;
  return Math.round(p.price * SIZES[line.size].k * concById(line.conc).k) + (line.engrave ? ENGRAVING_FEE : 0) + (line.gift ? GIFT_FEE : 0);
}
/** identical options merge into one bag line */
export const lineKey = l => [l.id, l.size, l.conc, l.engrave || '', l.gift ? 1 : 0].join('|');
export const optionsText = l => [SIZES[l.size].ml + ' ml', concById(l.conc).label, l.engrave ? `Engraved “${l.engrave}”` : '', l.gift ? 'Gift wrapped' : ''].filter(Boolean).join(' · ');

export function computeTotals(bag, { promo = null, ship = 'std', pay = 'card' } = {}) {
  const sub = bag.reduce((s, l) => s + unitPrice(l) * l.qty, 0);
  const disc = promo && PROMOS[promo] ? Math.round(sub * PROMOS[promo].pct) / 100 : 0;
  const net = sub - disc;
  const shipping = shippingById(ship).price(net);
  const cod = pay === 'cod' ? COD_FEE : 0;
  const tax = Math.round(net * TAX_RATE * 100) / 100;
  return { sub, disc, net, ship: shipping, cod, tax, total: Math.round((net + shipping + cod + tax) * 100) / 100 };
}
