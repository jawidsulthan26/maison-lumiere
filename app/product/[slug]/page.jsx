import { notFound } from 'next/navigation';
import ProductView from '@/components/views/ProductView';
import { PRODUCTS, getProduct } from '@/lib/products';

export function generateStaticParams() { return PRODUCTS.map(p => ({ slug: p.id })); }
export function generateMetadata({ params }) {
  const p = getProduct(params.slug);
  return p ? { title: p.name, description: p.desc } : {};
}
export default function ProductPage({ params }) {
  const p = getProduct(params.slug);
  if (!p) notFound();
  return <ProductView product={p} />;
}
