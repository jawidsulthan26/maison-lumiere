'use client';
/**
 * Lenis smooth scrolling for every page, synced with GSAP ScrollTrigger.
 * Also: in-page anchor links glide, and each route change starts at the top.
 */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis, setLenis, scrollToTarget } from '@/lib/smoothScroll';

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const lenis = new Lenis({ lerp: .09, smoothWheel: true });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const raf = t => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // #anchor links (on the current page) glide instead of jumping
    const onClick = e => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const target = id === '#top' ? 0 : document.querySelector(id); if (target === null) return;
      e.preventDefault(); scrollToTarget(target);
    };
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('click', onClick); gsap.ticker.remove(raf); lenis.destroy(); setLenis(null); };
  }, []);

  // new page → start at the top (or at the #hash when arriving at /#section)
  useEffect(() => {
    const lenis = getLenis();
    const hash = window.location.hash;
    if (hash.length > 1) { const el = document.querySelector(hash); if (el) { setTimeout(() => scrollToTarget(el, { duration: 1.2 }), 700); return; } }
    lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
