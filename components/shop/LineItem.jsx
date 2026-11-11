'use client';
/** A bag line: full (editable) or mini (checkout summary / order). */
import Link from 'next/link';
import { getProduct } from '@/lib/products';
import { optionsText, unitPrice } from '@/lib/pricing';
import { money } from '@/lib/format';
import Qty from './Qty';

export default function LineItem({ line, index, mini = false, onQty, onRemove, unit }) {
  const p = getProduct(line.id); if (!p) return null;
  const each = unit ?? unitPrice(line);
  if (mini) return (
    <div className="line line--mini">
      <div className="line__img"><img src={p.img} alt="" /><b>{line.qty}</b></div>
      <div><div className="line__name">{p.name}</div><div className="line__opts" style={{ margin: '2px 0 0' }}>{optionsText(line)}</div></div>
      <div className="line__right">{money(each * line.qty)}</div>
    </div>
  );
  return (
    <div className="line">
      <Link href={`/product/${p.id}`} className="line__img"><img src={p.img} alt={p.name} /></Link>
      <div>
        <div className="line__name">{p.name}</div>
        <div className="line__opts">{optionsText(line)}</div>
        <Qty small value={line.qty} onChange={d => onQty(index, d)} />
      </div>
      <div className="line__right"><span>{money(each * line.qty)}</span><button className="line__remove" onClick={() => onRemove(index)}>Remove</button></div>
    </div>
  );
}
