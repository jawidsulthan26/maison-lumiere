/** Checkout validation (demo payment — no real card data ever leaves the browser). */
export const RX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^[+\d][\d\s-]{6,}$/,
  zip: /^[A-Za-z0-9 -]{3,10}$/,
  upi: /^[\w.-]{2,}@[a-zA-Z]{2,}$/,
};
export function validateDetails(d) {
  const e = {};
  if (!RX.email.test(d.email || '')) e.email = 'Enter a valid email address';
  if (!RX.phone.test(d.phone || '')) e.phone = 'Enter a valid phone number';
  if (!(d.first || '').trim()) e.first = 'Required';
  if (!(d.last || '').trim()) e.last = 'Required';
  if ((d.addr || '').trim().length < 5) e.addr = 'Enter your street address';
  if ((d.city || '').trim().length < 2) e.city = 'Required';
  if (!RX.zip.test(d.zip || '')) e.zip = 'Enter a valid postal code';
  return e;
}
export function luhn(n) {
  let s = 0, alt = false;
  for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; }
  return s % 10 === 0;
}
export const cardBrand = n => /^4/.test(n) ? 'Visa' : /^(5[1-5]|2[2-7])/.test(n) ? 'Mastercard' : /^3[47]/.test(n) ? 'Amex' : /^(60|65|81|82|508)/.test(n) ? 'RuPay' : /^6/.test(n) ? 'Discover' : 'Card';
export function validateCard(c) {
  const e = {}, d = (c.num || '').replace(/\D/g, '');
  if (!(d.length >= 15 && luhn(d))) e.cnum = 'Check your card number';
  const [mm, yy] = (c.exp || '').split('/').map(Number);
  if (!(mm >= 1 && mm <= 12 && yy >= 0 && new Date(2000 + yy, mm) > new Date())) e.cexp = 'Enter a valid future date';
  if (!/^\d{3,4}$/.test(c.cvv || '')) e.ccvv = '3 or 4 digits';
  if ((c.name || '').trim().length < 2) e.cname = 'Name as printed on the card';
  return e;
}
/** demo test numbers */
export const TEST_CARD = '4242 4242 4242 4242';
export const DECLINE_CARD = '4000000000000002';
