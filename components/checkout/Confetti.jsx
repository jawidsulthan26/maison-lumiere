'use client';
/** Burst of gold drops + ribbons on the confirmation page. */
import { useEffect, useRef } from 'react';

export default function Confetti() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const cols = ['#C8875A', '#E8B47F', '#F6D7B0', '#8A5A35', '#FBE6C8'];
    const ps = Array.from({ length: innerWidth < 768 ? 80 : 150 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .32,
      vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 4, r: Math.random() * 5 + 2.5, c: cols[(Math.random() * cols.length) | 0], drop: Math.random() < .6, rot: Math.random() * 6 }));
    const t0 = performance.now(); let raf;
    const tick = now => {
      const t = (now - t0) / 1000; ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(p => {
        p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.rot += .08;
        ctx.globalAlpha = Math.max(0, 1 - t / 3.6); ctx.fillStyle = p.c;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        if (p.drop) { ctx.beginPath(); ctx.moveTo(0, -p.r * 1.6); ctx.bezierCurveTo(p.r, -p.r * .2, p.r, p.r, 0, p.r); ctx.bezierCurveTo(-p.r, p.r, -p.r, -p.r * .2, 0, -p.r * 1.6); ctx.fill(); }
        else ctx.fillRect(-p.r, -p.r / 3, p.r * 2, p.r / 1.5);
        ctx.restore();
      });
      if (t < 3.8) raf = requestAnimationFrame(tick); else c.style.display = 'none';
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas id="confetti" ref={ref} aria-hidden="true" />;
}
