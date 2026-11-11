import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="view">
      <div className="shop-wrap"><div className="empty" style={{ paddingTop: '20vh' }}>
        <h4>Page not found</h4><p className="body-s">This page drifted away like a top note.</p>
        <Link className="btn-solid" href="/">Back home</Link>
      </div></div>
    </div>
  );
}
