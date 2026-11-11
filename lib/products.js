/**
 * Catalogue. `img` paths point at /public/images. `collection` places a product on the home page.
 * Notes, families and descriptions are placeholder copy — replace with the real fragrance details.
 */
export const PRODUCTS = [
  { id: 'amber-mist', name: 'Amber Mist', price: 150, img: '/images/04_amber_mist.webp', w: 172, h: 263, collection: 'signature',
    fam: 'Warm Amber', top: 'Bergamot · Pink Pepper', heart: 'Labdanum · Damask Rose', base: 'Amber · Vanilla · Benzoin',
    desc: 'A glowing amber wrapped in soft spice — warm, golden and quietly addictive from the first spray to the last trace on skin.' },
  { id: 'ocean-veil', name: 'Ocean Veil', price: 190, img: '/images/05_ocean_veil.webp', w: 194, h: 263, collection: 'signature',
    fam: 'Fresh Aquatic', top: 'Sea Salt · Grapefruit', heart: 'Sage · Water Lily', base: 'Driftwood · White Musk',
    desc: 'A clean sweep of sea air and sunlit citrus, softened by sage and a whisper of driftwood. Effortless, bright, endlessly wearable.' },
  { id: 'noir-essence', name: 'Noir Essence', price: 220, img: '/images/06_noir_essence.webp', w: 202, h: 263, collection: 'signature',
    fam: 'Oriental Woody', top: 'Black Pepper · Cardamom', heart: 'Oud · Leather', base: 'Patchouli · Tonka',
    desc: 'Smoky, dark and magnetic. Spiced oud and supple leather settle into a deep, resinous trail made for evenings.' },
  { id: 'golden-bloom', name: 'Golden Bloom', price: 350, img: '/images/07_golden_bloom.webp', w: 200, h: 263, collection: 'signature',
    fam: 'Luminous Floral', top: 'Neroli · Mandarin', heart: 'Jasmine · Tuberose', base: 'Sandalwood · Cashmere Musk',
    desc: 'A radiant bouquet of white flowers lit by neroli, resting on creamy sandalwood — our most luminous composition.' },
  { id: 'velvet-rose', name: 'Velvet Rose', price: 145, img: '/images/08_velvet_rose.webp', w: 207, h: 263, collection: 'ultimate',
    fam: 'Rose', top: 'Lychee · Pink Pepper', heart: 'Damask Rose · Peony', base: 'Cashmere Wood · Musk',
    desc: 'A velvet-soft rose, juicy with lychee and wrapped in cashmere woods. Romantic, modern and gently powdery.' },
  { id: 'noir-elixir', name: 'Noir Elixir', price: 225, img: '/images/09_noir_elixir.webp', w: 274, h: 319, collection: 'ultimate',
    fam: 'Amber Gourmand', top: 'Saffron · Plum', heart: 'Honey · Orris', base: 'Vanilla · Amberwood',
    desc: 'An opulent elixir of saffron and honeyed plum over golden vanilla. Rich, enveloping and impossible to forget.' },
  { id: 'golden-amber', name: 'Golden Amber', price: 320, img: '/images/10_golden_amber.webp', w: 180, h: 263, collection: 'ultimate',
    fam: 'Spiced Amber', top: 'Cinnamon · Blood Orange', heart: 'Amber · Cistus', base: 'Vetiver · Tonka Bean',
    desc: 'Sun-warmed amber with a sparkle of orange and cinnamon, grounded by smoky vetiver. Cosy, confident, glowing.' },
];

export const getProduct = id => PRODUCTS.find(p => p.id === id) || null;
export const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const byCollection = c => PRODUCTS.filter(p => p.collection === c);
export const FAMILIES = ['All', 'Amber', 'Floral', 'Woody', 'Fresh'];
export const matchesFamily = (p, f) => f === 'All' || p.fam.toLowerCase().includes(f.toLowerCase()) || (f === 'Floral' && /rose/i.test(p.fam));
