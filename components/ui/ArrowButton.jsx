import Link from 'next/link';

const Arrow = () => <svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg>;

/** "Explore Collection ↗" — text + circular outline arrow (the arrow swaps on hover). */
export default function ArrowButton({ href, children, className = '' }) {
  const inner = (
    <>
      <span className="btn-arrow__label">{children}</span>
      <span className="btn-arrow__circle"><Arrow /><Arrow /></span>
    </>
  );
  const cls = `btn-arrow btn-link ${className}`.trim();
  return href.startsWith('#')
    ? <a href={href} className={cls} data-cursor="link">{inner}</a>
    : <Link href={href} className={cls} data-cursor="link">{inner}</Link>;
}
