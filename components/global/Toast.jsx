'use client';
import { useShop } from '@/context/ShopContext';

/** Small confirmation pill ("Amber Mist added to your bag"). */
export default function Toast() {
  const { toastMsg } = useShop();
  return (
    <div className={`toast ${toastMsg ? 'is-on' : ''}`} role="status" aria-live="polite">
      {toastMsg?.img && <img src={toastMsg.img} alt="" />}
      <span>{toastMsg?.msg}</span>
    </div>
  );
}
