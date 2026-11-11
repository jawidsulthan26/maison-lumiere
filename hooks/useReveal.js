'use client';
import { useEffect } from 'react';
import gsap from 'gsap';

/** Rise-in for every [data-rise] element (and optional extra selector) when a page mounts. */
export default function useReveal(ref, deps = [], extra) {
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current.querySelectorAll('[data-rise]'), { y: 34, opacity: 0, duration: 1, ease: 'expo.out', stagger: .06, delay: .2 });
      if (extra) gsap.from(ref.current.querySelectorAll(extra), { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .07, delay: .3 });
    }, ref);
    return () => ctx.revert();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
