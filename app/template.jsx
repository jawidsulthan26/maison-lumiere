'use client';
/** Page transition: every navigation reveals the new page with an ink drop from the last click. */
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

let last = null, first = true;
if (typeof window !== 'undefined') addEventListener('pointerdown', e => (last = { x: e.clientX, y: e.clientY }), true);

export default function Template({ children }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (first) { first = false; return; }          // the first page has its own intro
    const o = last || { x: innerWidth / 2, y: innerHeight / 2 }, R = Math.hypot(innerWidth, innerHeight) * 1.05;
    const el = ref.current; el.classList.add('is-entering');
    const tw = gsap.fromTo(el, { clipPath: `circle(0px at ${o.x}px ${o.y}px)` },
      { clipPath: `circle(${R}px at ${o.x}px ${o.y}px)`, duration: .9, ease: 'power3.inOut', onComplete: () => { el.style.clipPath = ''; el.classList.remove('is-entering'); } });
    last = null;
    return () => tw.kill();
  }, []);
  return <div className="page" ref={ref}>{children}</div>;
}
