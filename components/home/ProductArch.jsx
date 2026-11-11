import Link from 'next/link';
import { money } from '@/lib/format';

/** A bottle on its soft arch with name + price (rolls to "View details" on hover).
 *  Clicks are handled by the engine (shared-element flight); the hidden link keeps it keyboard + SEO friendly. */
export default function ProductArch({ product: p, variant = 'card' }) {
  const Wrap = variant === 'card' ? 'article' : 'article';
  const media = variant === 'card'
    ? <div className="card__media"><img className="card__img" data-gl="product" src={p.img} alt={`${p.name} perfume bottle`} width={p.w} height={p.h} loading="eager" /></div>
    : <div className="slide__media"><img data-gl="slide" src={p.img} alt={`${p.name} perfume bottle`} width={p.w} height={p.h} /></div>;
  return (
    <Wrap className={variant} data-cursor="view" data-name={p.name} data-id={p.id} aria-roledescription={variant === 'slide' ? 'slide' : undefined}>
      <div className="card__arch" />
      {media}
      <div className="card__meta">
        <h3 className="card__name product-name">{p.name}</h3>
        <div className="price-roll price"><span>{money(p.price)}</span><span>View details</span></div>
        <Link href={`/product/${p.id}`} className="sr-only">View {p.name}</Link>
      </div>
    </Wrap>
  );
}
