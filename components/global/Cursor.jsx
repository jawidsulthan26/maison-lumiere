'use client';
/** Custom cursor: a small dot + ring that grows into "View" over products, and into a ring over links. */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const root = useRef(null);
  useEffect(() => {
    if (matchMedia('(hover: none), (pointer: coarse)').matches) return;
    const cur = root.current, dot = cur.querySelector('.cursor__dot'), ring = cur.querySelector('.cursor__ring');
    document.documentElement.classList.add('has-cursor');
    const dx = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
    const rx = gsap.quickTo(ring, 'x', { duration: .55, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .55, ease: 'power3' });
    const move = e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); };
    const over = e => {
      const t = e.target.closest?.('[data-cursor]');
      cur.classList.toggle('is-view', t?.dataset.cursor === 'view');
      cur.classList.toggle('is-link', t?.dataset.cursor === 'link');
    };
    const hide = () => cur.classList.add('is-hidden'), show = () => cur.classList.remove('is-hidden');
    addEventListener('pointermove', move);
    document.addEventListener('pointerover', over);
    document.addEventListener('pointerleave', hide);
    document.addEventListener('pointerenter', show);
    return () => {
      removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerleave', hide);
      document.removeEventListener('pointerenter', show);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);
  return (
    <div className="cursor" ref={root} aria-hidden="true">
      <div className="cursor__ring"><span>View</span></div><div className="cursor__dot" />
    </div>
  );
}
