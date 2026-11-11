# Maison Lumière — luxury perfume storefront

Next.js 14 (App Router) · Three.js · GSAP + ScrollTrigger · Lenis. Plain JavaScript, no TypeScript.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production
```

Deploys as-is to Vercel (or any Node host). Every page is pre-rendered except `/order/[id]`.

## Pages

| Route | What it is |
|---|---|
| `/` | Home: loader, 3D hero, collections, carousel, essence, footer |
| `/shop` | All fragrances with family filters and price sort |
| `/product/[slug]` | Size, concentration, live engraving, gift wrap, add to bag / buy now |
| `/cart` | Full bag, promo codes, summary |
| `/wishlist` | Saved fragrances → move to bag |
| `/checkout` | Details → Delivery → Payment (card / UPI / cash on delivery) |
| `/order/[id]` | Confirmation, tracker, receipt download |

The bag drawer, search and toast live in the root layout, so they work on every page.

## Where things are

```
app/                    routes (thin server files: metadata + one view component)
  layout.jsx            fonts, global CSS, providers, cursor, grain, drawer, search, toast
  template.jsx          ink-drop page transition between routes
components/
  home/                 one component per home section (Hero, SignatureCollection, …)
  views/                the client body of each shop page
  shop/                 header, tiles, line items, totals, promo, drawer, search, fields
  checkout/             stepper, details, delivery, payment, 3D card, OTP, confetti
  global/               SmoothScroll (Lenis), Cursor, Grain, Toast
  ui/                   icons, logo, arrow button
context/ShopContext.jsx bag, wishlist, promo, details, orders (saved in localStorage)
lib/
  config.js             ← brand name, currency, locale
  products.js           ← catalogue (names, prices, notes, images)
  pricing.js            ← sizes, fees, promo codes, shipping, tax, totals maths
  validation.js · delivery.js · format.js · storage.js · flight.js · receipt.js
  experience/           the home WebGL + animation engine (see below)
styles/                 one CSS file per section; globals.css imports them in order
public/images/          all bottle + lifestyle images (WebP)
```

## The home engine (`lib/experience`)

`HomeExperience.jsx` renders the static markup, then dynamically imports the engine in the browser:
`startExperience()` boots everything and `stopExperience()` releases all of it when you navigate away
(listeners, timers, observers, ScrollTriggers, tweens and WebGL contexts are tracked in `lifecycle.js`).
The loader plays once per visit.

| File | Effect |
|---|---|
| `loader.js` + `shaders/loader.js` | the real bottle fills with amber, cap lifts, tips, pours, floods into the hero |
| `HeroScene.js` + `shaders/hero.js` | glow, glassy droplets and golden dust with depth of field behind the hero |
| `Stage.js` + `shaders/stage.js` | one fixed canvas drawing every bottle as a plane; particle sculptures |
| `heroBottle.js` | hero bottle, Élan/Noir liquid wipe, particle formation/dissolve, liquid pool |
| `cards.js` · `carousel.js` · `essence.js` · `wordmark.js` | the per-section effects |
| `text.js` · `ink.js` · `background.js` · `nav.js` | text reveals, ink-mask photos, droplets, nav |

## Before going live

- **Payment is a demo.** No money moves. Plug a real gateway (Razorpay / Stripe) into
  `components/checkout/PaymentStep.jsx` (`pay_`) and create orders on a server instead of `placeOrder()` in the context.
- **Placeholder copy:** fragrance notes and descriptions (`lib/products.js`), the 4.9★ rating, delivery prices,
  the 5% tax and the promo codes (`lib/pricing.js`).
- Orders, bag and wishlist are stored in the browser only — replace with your backend / CMS.
- Test cards: `4242 4242 4242 4242` (success, then any 6-digit code) · `4000 0000 0000 0002` (declined).
