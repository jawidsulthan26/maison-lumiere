import '@fontsource/italiana/400.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@/styles/globals.css';
import { CONFIG } from '@/lib/config';
import { ShopProvider } from '@/context/ShopContext';
import SmoothScroll from '@/components/global/SmoothScroll';
import Cursor from '@/components/global/Cursor';
import Grain from '@/components/global/Grain';
import Toast from '@/components/global/Toast';
import BagDrawer from '@/components/shop/BagDrawer';
import SearchOverlay from '@/components/shop/SearchOverlay';

export const metadata = {
  title: { default: `Mesmerizing — ${CONFIG.brand}`, template: `%s — ${CONFIG.brand}` },
  description: 'Luxury fragrances crafted with refined ingredients, elegant compositions and a lasting impression.',
};
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#FBF3EC' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="js">
      <body>
        <ShopProvider>
          <SmoothScroll />
          <Grain />
          <Cursor />
          {children}
          <BagDrawer />
          <SearchOverlay />
          <Toast />
        </ShopProvider>
      </body>
    </html>
  );
}
