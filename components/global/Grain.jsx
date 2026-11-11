'use client';
/** Subtle animated film grain over the whole site (noise generated once on a canvas). */
import { useEffect, useRef } from 'react';

export default function Grain() {
  const ref = useRef(null);
  useEffect(() => {
    const c = document.createElement('canvas'); c.width = c.height = 180;
    const ctx = c.getContext('2d'); const d = ctx.createImageData(180, 180);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    ctx.putImageData(d, 0, 0);
    ref.current.style.backgroundImage = `url(${c.toDataURL()})`;
  }, []);
  return <div className="grain" ref={ref} aria-hidden="true" />;
}
