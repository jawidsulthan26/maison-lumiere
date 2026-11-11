import Link from 'next/link';

export default function EmptyState({ icon, title, text, cta, href }) {
  return (
    <div className="empty" data-rise>
      {icon}<h4>{title}</h4><p className="body-s">{text}</p>
      {cta && <Link className="btn-solid" href={href} data-cursor="link">{cta}</Link>}
    </div>
  );
}
