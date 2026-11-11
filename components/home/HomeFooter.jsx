import Link from 'next/link';
import { CONFIG } from '@/lib/config';
import InkPhoto from './InkPhoto';

const GALLERY = [
  ['photo_footer_1', 'Crystal perfume bottle with pink roses', 680, 699],
  ['photo_footer_2', 'Rose-pink perfume bottle among flowers', 950, 1063],
  ['photo_footer_3', 'Perfume bottles on wood with greenery', 681, 700],
  ['photo_footer_4', 'Dark perfume bottles in soft light', 680, 699],
  ['photo_footer_5', 'Golden perfume bottle on linen', 683, 717],
];

/** 8. Footer — liquid MESMERIZING wordmark, links, (02) caption, 5 oval photos (hover = big), legal. */
export default function HomeFooter() {
  return (
    <footer className="footer" id="contact">
      <div className="wrap">
        <div className="footer__top">
          <h2 className="footer__word footer-wordmark display" id="footer-word" data-gl="wordmark" aria-label="Mesmerizing">MESMERIZING</h2>
          <ul className="footer__links">
            <li><a href="#top" data-cursor="link">Home</a></li>
            <li><a href="#product" data-cursor="link">About</a></li>
            <li><a href="#contact" data-cursor="link">Contact</a></li>
          </ul>
        </div>
        <p className="footer__note reveal"><b>(02)</b>The art of fragrance begins with a single beautiful note.</p>
        <Link href="/shop" className="footer__more btn-link" data-cursor="link">More</Link>
        <div className="footer__gallery">
          {GALLERY.map(([n, alt, w, h]) => <InkPhoto key={n} src={`/images/${n}.webp`} alt={alt} w={w} h={h} />)}
        </div>
        <div className="footer__bar">
          <small>All Rights Reserved © {new Date().getFullYear()} {CONFIG.brand} Fragrance</small>
          <nav className="legal" aria-label="Legal"><a href="#" data-cursor="link">Privacy Policy</a><a href="#" data-cursor="link">Terms of Service</a><a href="#" data-cursor="link">Cookie Policy</a></nav>
        </div>
      </div>
    </footer>
  );
}
