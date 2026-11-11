'use client';
/** /checkout — Details → Delivery → Payment, then the order is placed and we go to /order/[id]. */
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import ShopHeader from '@/components/shop/ShopHeader';
import Stepper from '@/components/checkout/Stepper';
import DetailsStep from '@/components/checkout/DetailsStep';
import DeliveryStep from '@/components/checkout/DeliveryStep';
import PaymentStep from '@/components/checkout/PaymentStep';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useShop } from '@/context/ShopContext';
import { computeTotals } from '@/lib/pricing';
import { getLenis } from '@/lib/smoothScroll';
import useReveal from '@/hooks/useReveal';

export default function CheckoutView() {
  const router = useRouter();
  const { ready, bag, promo, details, saveDetails, placeOrder } = useShop();
  const [step, setStep] = useState(1);
  const [ship, setShip] = useState('std');
  const [pay, setPay] = useState('card');
  const [placed, setPlaced] = useState(false);
  const ref = useRef(null), pane = useRef(null);
  const t = computeTotals(bag, { promo, ship, pay });
  useReveal(ref, [ready]);

  useEffect(() => { if (ready && !bag.length && !placed) router.replace('/cart'); }, [ready, bag.length, placed, router]);
  useEffect(() => {
    if (!pane.current) return;
    gsap.from(pane.current.querySelectorAll('.co-step > *'), { y: 24, opacity: 0, duration: .8, ease: 'expo.out', stagger: .05 });
    getLenis()?.scrollTo(0, { duration: .8 });
  }, [step]);

  const back = () => (step > 1 ? setStep(step - 1) : router.push('/cart'));
  const paid = ({ card, upi }) => { setPlaced(true); const no = placeOrder({ ship, pay, card, upi }); router.push(`/order/${no}`); };
  if (!ready || !bag.length) return <div className="view"><ShopHeader secure onBack={back} /></div>;
  return (
    <div className="view" ref={ref}>
      <ShopHeader secure onBack={back} />
      <div className="shop-wrap">
        <div className="page-head" style={{ paddingBottom: 10 }} data-rise><h1>Checkout</h1></div>
        <Stepper step={step} />
        <div className="co-split">
          <div className="panel" ref={pane} data-rise>
            {step === 1 && <DetailsStep initial={details} onNext={d => { saveDetails(d); setStep(2); }} />}
            {step === 2 && <DeliveryStep details={details} ship={ship} setShip={setShip} net={t.net} hasGift={bag.some(l => l.gift)} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
            {step === 3 && <PaymentStep pay={pay} setPay={setPay} ship={ship} total={t.total} holder={`${details.first || ''} ${details.last || ''}`.trim()} onBack={() => setStep(2)} onPaid={paid} />}
          </div>
          <OrderSummary t={t} />
        </div>
      </div>
    </div>
  );
}
