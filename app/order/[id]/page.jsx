import OrderView from '@/components/views/OrderView';

export const metadata = { title: 'Order confirmed', robots: { index: false } };
export default function OrderPage({ params }) { return <OrderView id={params.id} />; }
