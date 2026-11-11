/** Photo revealed by an ink-in-water mask (the engine swaps the <img> for an SVG mask). */
export default function InkPhoto({ src, alt, w, h, className = '', speed }) {
  return (
    <div className={`ink ${className}`} data-cursor="view" data-src={src} data-w={w} data-h={h} data-speed={speed}>
      <img src={src} alt={alt} width={w} height={h} />
    </div>
  );
}
