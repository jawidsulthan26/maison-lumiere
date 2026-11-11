/** Builds and downloads a printable HTML receipt for an order. */
import { CONFIG } from './config';
import { money } from './format';
import { optionsText } from './pricing';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function downloadReceipt(o) {
  const t = o.totals, D = o.details;
  const rows = o.items.map(l => `<tr><td>${esc(l.name)}<br><small>${esc(optionsText(l))}</small></td><td>${l.qty}</td><td style="text-align:right">${money(l.unit * l.qty)}</td></tr>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><title>Receipt ${esc(o.no)}</title><style>body{font:14px/1.6 Georgia,serif;color:#1E1915;max-width:640px;margin:40px auto;padding:0 20px}h1{font-weight:400;letter-spacing:.2em;text-transform:uppercase}table{width:100%;border-collapse:collapse}td{padding:10px 0;border-bottom:1px solid #eee;vertical-align:top}small{color:#777}.t td{border:0;padding:4px 0}.g td{font-size:18px;border-top:1px solid #C8875A;padding-top:10px}</style>
<h1>${esc(CONFIG.brand)}</h1><p>Receipt · Order <b>${esc(o.no)}</b><br>${new Date(o.date).toLocaleString()}</p>
<p><b>Billed to</b><br>${esc(D.first)} ${esc(D.last)}<br>${esc(D.addr)}, ${esc(D.city)} ${esc(D.zip)}, ${esc(D.country)}<br>${esc(D.email)}</p>
<table>${rows}</table><table class="t"><tr><td>Subtotal</td><td style="text-align:right">${money(t.sub)}</td></tr>${t.disc ? `<tr><td>Promo</td><td style="text-align:right">−${money(t.disc)}</td></tr>` : ''}<tr><td>Shipping (${esc(o.ship.name)})</td><td style="text-align:right">${t.ship ? money(t.ship) : 'Free'}</td></tr>${t.cod ? `<tr><td>COD fee</td><td style="text-align:right">${money(t.cod)}</td></tr>` : ''}<tr><td>Tax</td><td style="text-align:right">${money(t.tax)}</td></tr><tr class="g"><td>Total</td><td style="text-align:right">${money(t.total)}</td></tr></table>
<p>Paid with ${esc(o.pay)}</p><p><small>Demo receipt — no real payment was taken.</small></p>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  a.download = `receipt-${o.no}.html`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
