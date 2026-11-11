'use client';
/**
 * Home page shell. Renders the static sections, then boots the WebGL / animation engine
 * (lib/experience) in the browser and tears it down when you navigate away.
 */
import { memo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setFlight } from '@/lib/flight';
import Loader from './Loader';
import HomeNav from './HomeNav';
import Hero from './Hero';
import SignatureCollection from './SignatureCollection';
import ArtOfFragrance from './ArtOfFragrance';
import UltimateCollection from './UltimateCollection';
import Moments from './Moments';
import Essence from './Essence';
import HomeFooter from './HomeFooter';

let booted = false;   // the loader plays once per visit

// sections never re-render: the engine owns their DOM after mount
const Sections = memo(function Sections() {
  return (
    <>
      <div className="bg-layer drops" id="drops" aria-hidden="true" />
      <main id="top">
        <Hero />
        <SignatureCollection />
        <ArtOfFragrance />
        <UltimateCollection />
        <Moments />
        <Essence />
      </main>
      <HomeFooter />
    </>
  );
});

export default function HomeExperience() {
  const router = useRouter();
  const [firstLoad] = useState(() => !booted);

  useEffect(() => {
    let stop = null, cancelled = false;
    booted = true;
    import('@/lib/experience').then(({ startExperience, stopExperience }) => {
      if (cancelled) return;
      stop = stopExperience;
      startExperience({
        firstLoad,
        onOpenProduct: el => { setFlight(el.querySelector('img')); router.push(`/product/${el.dataset.id}`); },
      });
    });
    return () => { cancelled = true; stop?.(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="home">
      {firstLoad && <Loader />}
      <canvas id="stage-gl" aria-hidden="true" />
      <HomeNav />
      <Sections />
    </div>
  );
}
