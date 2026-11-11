import { CONFIG } from '@/lib/config';

/** Intro loader — the real bottle fills with amber (WebGL), then pours into the hero. Shown once per visit. */
export default function Loader() {
  return (
    <div id="loader" aria-hidden="true">
      <canvas id="loader-gl" />
      {/* the bottle the shader reads (and the CSS fallback when WebGL is off) */}
      <div className="loader__bottle" style={{ '--p': 0 }}>
        <img id="loader-body" src="/images/11_essence_body.webp" alt="" />
        <img className="loader__fill" src="/images/11_essence_body.webp" alt="" />
      </div>
      <img id="loader-cap" src="/images/11_essence_cap.webp" alt="" hidden />
      <div className="loader__ui">
        <div className="loader__count"><span id="loader-count">00</span></div>
        <div className="loader__brand">{CONFIG.brand}</div>
      </div>
    </div>
  );
}
