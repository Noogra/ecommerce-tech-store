import db from './db.js';

const categories = [
  {
    name: 'Mobile Phones',
    slug: 'mobile-phones',
    subcategories: [
      { name: 'iPhone', slug: 'iphone' },
      { name: 'Samsung', slug: 'samsung' },
      { name: 'Xiaomi', slug: 'xiaomi' },
    ],
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    subcategories: [
      { name: 'Cases', slug: 'cases' },
      { name: 'Chargers', slug: 'chargers' },
      { name: 'Headphones', slug: 'headphones' },
    ],
  },
  {
    name: 'Computers & Tablets',
    slug: 'computers-tablets',
    subcategories: [],
  },
];

const products = [
  {
    name: 'iPhone 17 Pro Max',
    brand: 'Apple',
    category: 'mobile-phones',
    subcategory: 'iphone',
    price: 1199,
    originalPrice: 1299,
    image: 'https://www.apple.com/newsroom/images/2025/09/apple-unveils-iphone-17-pro-and-iphone-17-pro-max/article/Apple-iPhone-17-Pro-cosmic-orange-250909_inline.jpg.large.jpg',
    specs: ['6.9" OLED', 'A18 Pro', '256GB', 'Titanium'],
    detailedSpecs: {
      Display: '6.9" Super Retina XDR OLED, 2868x1320, 120Hz ProMotion',
      Processor: 'Apple A18 Pro (3nm)',
      Storage: '256GB',
      RAM: '8GB',
      Battery: '4685 mAh, MagSafe wireless charging',
      Camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto (5x)',
      OS: 'iOS 18',
      Build: 'Titanium frame, Ceramic Shield front',
      Connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, USB-C 3.0',
      Weight: '227g',
    },
    rating: 4.8,
    inStock: true,
    featured: true,
  },
  {
    name: 'iPhone 17',
    brand: 'Apple',
    category: 'mobile-phones',
    subcategory: 'iphone',
    price: 799,
    originalPrice: 799,
    image: 'https://www.apple.com/newsroom/images/2025/09/apple-debuts-iphone-17/article/Apple-iPhone-17-hero-250909_inline.jpg.large.jpg',
    specs: ['6.1" OLED', 'A18', '128GB', 'Aluminum'],
    detailedSpecs: {
      Display: '6.1" Super Retina XDR OLED, 2556x1179, 60Hz',
      Processor: 'Apple A18 (3nm)',
      Storage: '128GB',
      RAM: '8GB',
      Battery: '3561 mAh, MagSafe wireless charging',
      Camera: '48MP Main + 12MP Ultra Wide',
      OS: 'iOS 18',
      Build: 'Aluminum frame, Ceramic Shield front',
      Connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, USB-C 2.0',
      Weight: '170g',
    },
    rating: 4.6,
    inStock: true,
    featured: false,
  },
  {
    name: 'Samsung Galaxy S25 Ultra',
    brand: 'Samsung',
    category: 'mobile-phones',
    subcategory: 'samsung',
    price: 1299,
    originalPrice: 1399,
    image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg',
    specs: ['6.9" AMOLED', 'Snapdragon 8 Elite', '256GB', 'S Pen'],
    detailedSpecs: {
      Display: '6.9" Dynamic AMOLED 2X, 3120x1440, 120Hz LTPO',
      Processor: 'Qualcomm Snapdragon 8 Elite',
      Storage: '256GB',
      RAM: '12GB',
      Battery: '5000 mAh, 45W fast charging',
      Camera: '200MP Main + 50MP Ultra Wide + 10MP Telephoto (3x) + 50MP Periscope (5x)',
      OS: 'Android 15, One UI 7',
      Build: 'Titanium frame, Gorilla Armor 2',
      Connectivity: '5G, Wi-Fi 7, Bluetooth 5.4, USB-C 3.2',
      Weight: '218g',
    },
    rating: 4.7,
    inStock: true,
    featured: true,
  },
  {
    name: 'Samsung Galaxy Z Fold 6',
    brand: 'Samsung',
    category: 'mobile-phones',
    subcategory: 'samsung',
    price: 1799,
    originalPrice: 1899,
    image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg',
    specs: ['7.6" Foldable', 'Snapdragon 8 Gen 3', '512GB', 'Flex Mode'],
    detailedSpecs: {
      Display: '7.6" Dynamic AMOLED 2X (inner), 6.3" (cover), 120Hz LTPO',
      Processor: 'Qualcomm Snapdragon 8 Gen 3',
      Storage: '512GB',
      RAM: '12GB',
      Battery: '4400 mAh, 25W fast charging',
      Camera: '50MP Main + 12MP Ultra Wide + 10MP Telephoto (3x)',
      OS: 'Android 14, One UI 6.1',
      Build: 'Armor Aluminum frame, IPX8 water resistant',
      Connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3, USB-C 3.2',
      Weight: '239g',
    },
    rating: 4.5,
    inStock: true,
    featured: true,
  },
  {
    name: 'Xiaomi 15 Pro',
    brand: 'Xiaomi',
    category: 'mobile-phones',
    subcategory: 'xiaomi',
    price: 699,
    originalPrice: 749,
    image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-15-pro.jpg',
    specs: ['6.73" AMOLED', 'Snapdragon 8 Elite', '256GB', '50MP Leica'],
    detailedSpecs: {
      Display: '6.73" LTPO AMOLED, 3200x1440, 120Hz',
      Processor: 'Qualcomm Snapdragon 8 Elite',
      Storage: '256GB',
      RAM: '12GB',
      Battery: '6100 mAh, 90W HyperCharge',
      Camera: '50MP Leica Main + 50MP Ultra Wide + 50MP Telephoto',
      OS: 'Android 15, HyperOS 2',
      Build: 'Metal frame, Gorilla Glass Victus 2',
      Connectivity: '5G, Wi-Fi 7, Bluetooth 5.4, USB-C 3.2',
      Weight: '213g',
    },
    rating: 4.5,
    inStock: true,
    featured: false,
  },
  {
    name: 'Xiaomi Redmi Note 14',
    brand: 'Xiaomi',
    category: 'mobile-phones',
    subcategory: 'xiaomi',
    price: 249,
    originalPrice: 279,
    image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-14-5g-gl.jpg',
    specs: ['6.67" AMOLED', 'Dimensity 7300', '128GB', '108MP'],
    detailedSpecs: {
      Display: '6.67" AMOLED, 2400x1080, 120Hz',
      Processor: 'MediaTek Dimensity 7300',
      Storage: '128GB',
      RAM: '8GB',
      Battery: '5110 mAh, 33W fast charging',
      Camera: '108MP Main + 8MP Ultra Wide + 2MP Macro',
      OS: 'Android 14, HyperOS',
      Build: 'Plastic frame, Gorilla Glass 5',
      Connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, USB-C 2.0',
      Weight: '188g',
    },
    rating: 4.3,
    inStock: true,
    featured: false,
  },
  {
    name: 'Premium Leather Case',
    brand: 'PhoneStop',
    category: 'accessories',
    subcategory: 'cases',
    price: 49,
    originalPrice: 59,
    image: 'https://www.apple.com/newsroom/images/2025/09/apple-unveils-iphone-17-pro-and-iphone-17-pro-max/article/Apple-iPhone-17-Pro-TechWoven-Case-250909_inline.jpg.large.jpg',
    specs: ['Genuine Leather', 'MagSafe', 'All Models', 'Slim Profile'],
    detailedSpecs: {
      Material: 'Full-grain European leather',
      Compatibility: 'iPhone 15/16 series (MagSafe)',
      Protection: 'Drop tested up to 6ft, raised edges for camera',
      Features: 'MagSafe built-in, wireless charging compatible',
      Colors: 'Black, Saddle Brown, Midnight Green',
      Thickness: '1.2mm slim profile',
    },
    rating: 4.4,
    inStock: true,
    featured: false,
  },
  {
    name: 'MagSafe Clear Case',
    brand: 'PhoneStop',
    category: 'accessories',
    subcategory: 'cases',
    price: 39,
    originalPrice: 39,
    image: 'https://www.apple.com/newsroom/images/2025/09/apple-debuts-iphone-17/article/Apple-iPhone-17-Clear-Case-250909_inline.jpg.large.jpg',
    specs: ['Polycarbonate', 'MagSafe', 'Anti-Yellow', 'Drop Tested'],
    detailedSpecs: {
      Material: 'Polycarbonate back, TPU bumper',
      Compatibility: 'iPhone 15/16 series (MagSafe)',
      Protection: 'Military-grade drop tested (MIL-STD-810G)',
      Features: 'Anti-yellowing coating, MagSafe ring built-in',
      Colors: 'Crystal Clear',
      Thickness: '1.5mm with raised bezels',
    },
    rating: 4.2,
    inStock: true,
    featured: false,
  },
  {
    name: 'USB-C Fast Charger 65W',
    brand: 'PhoneStop',
    category: 'accessories',
    subcategory: 'chargers',
    price: 35,
    originalPrice: 45,
    image: 'https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A2667111_TD02_V4.jpg?v=1753949913',
    specs: ['65W PD', 'GaN Tech', 'USB-C', 'Universal'],
    detailedSpecs: {
      Output: '65W USB-C Power Delivery 3.0',
      Technology: 'GaN III (Gallium Nitride)',
      Ports: '1x USB-C (65W), 1x USB-A (18W)',
      Compatibility: 'iPhone, Samsung, iPad, MacBook Air, Switch',
      Safety: 'Over-voltage, over-current, short-circuit protection',
      Weight: '120g compact design',
    },
    rating: 4.6,
    inStock: true,
    featured: true,
  },
  {
    name: 'Wireless Charging Pad',
    brand: 'PhoneStop',
    category: 'accessories',
    subcategory: 'chargers',
    price: 29,
    originalPrice: 29,
    image: 'https://www.belkin.com/dw/image/v2/BGBH_PRD/on/demandware.static/-/Sites-master-product-catalog-blk/default/dw69fc41e3/images/hi-res/4/4fd5c4b4a4193dd9_WIA012_BK_BoostCharge_WirelessChargingPad_15W_NPI.GTM_HERO_WEB.jpg',
    specs: ['15W Qi2', 'MagSafe', 'LED Indicator', 'Anti-Slip'],
    detailedSpecs: {
      Output: '15W Qi2 / MagSafe, 5W for AirPods',
      Compatibility: 'Qi2 & MagSafe devices, all Qi phones (7.5W)',
      Features: 'LED charging indicator, anti-slip silicone base',
      Cable: 'USB-C to USB-C (1.5m included)',
      Safety: 'Foreign object detection, temperature control',
      Dimensions: '70mm diameter, 7mm thick',
    },
    rating: 4.3,
    inStock: true,
    featured: false,
  },
  {
    name: 'AirPods Pro 3',
    brand: 'Apple',
    category: 'accessories',
    subcategory: 'headphones',
    price: 249,
    originalPrice: 279,
    image: 'https://www.apple.com/newsroom/images/2025/09/introducing-airpods-pro-3-the-ultimate-audio-experience/article/Apple-AirPods-Pro-3-hero-250909_inline.jpg.large.jpg',
    specs: ['ANC', 'Spatial Audio', 'H3 Chip', 'USB-C'],
    detailedSpecs: {
      Driver: 'Custom Apple H3 chip, adaptive EQ',
      'Noise Cancellation': 'Active Noise Cancellation (2x improvement)',
      Audio: 'Personalized Spatial Audio with head tracking',
      Battery: '6h listening (30h with case), USB-C charging',
      Connectivity: 'Bluetooth 5.3, Apple ecosystem seamless switching',
      'Water Resistance': 'IP54 (earbuds), IPX4 (case)',
    },
    rating: 4.8,
    inStock: true,
    featured: true,
  },
  {
    name: 'Sony WH-1000XM6',
    brand: 'Sony',
    category: 'accessories',
    subcategory: 'headphones',
    price: 349,
    originalPrice: 399,
    image: 'https://fdn.gsmarena.com/imgroot/news/22/10/wh-1000xm5-review/-1220x526/gsmarena_000.jpg',
    specs: ['ANC', '40h Battery', 'LDAC', 'Multipoint'],
    detailedSpecs: {
      Driver: '40mm, HD Noise Cancelling Processor V3',
      'Noise Cancellation': 'Industry-leading ANC with Auto NC Optimizer',
      Audio: 'LDAC, DSEE Extreme, 360 Reality Audio',
      Battery: '40h (ANC on), 3min charge = 3h playback',
      Connectivity: 'Bluetooth 5.3, Multipoint (2 devices), NFC',
      Weight: '250g, ultra-comfortable ear pads',
    },
    rating: 4.9,
    inStock: true,
    featured: true,
  },
  {
    name: 'iPad Pro M4',
    brand: 'Apple',
    category: 'computers-tablets',
    subcategory: 'tablets',
    price: 1099,
    originalPrice: 1099,
    image: 'https://www.apple.com/newsroom/images/2024/05/apple-unveils-stunning-new-ipad-pro-with-m4-chip-and-apple-pencil-pro/article/Apple-iPad-Pro-hero-240507_big.jpg.large.jpg',
    specs: ['11" Liquid Retina', 'M4 Chip', '256GB', 'Apple Pencil Pro'],
    detailedSpecs: {
      Display: '11" Ultra Retina XDR, Tandem OLED, 2420x1668, 120Hz ProMotion',
      Processor: 'Apple M4 (10-core CPU, 10-core GPU)',
      Storage: '256GB',
      RAM: '8GB',
      Battery: 'Up to 10 hours browsing',
      Camera: '12MP Wide + LiDAR Scanner, 12MP TrueDepth front',
      OS: 'iPadOS 18',
      Connectivity: 'Wi-Fi 6E, Bluetooth 5.3, USB-C Thunderbolt 4',
      Accessories: 'Apple Pencil Pro, Magic Keyboard compatible',
      Weight: '444g',
    },
    rating: 4.8,
    inStock: true,
    featured: true,
  },
  {
    name: 'MacBook Air M4',
    brand: 'Apple',
    category: 'computers-tablets',
    subcategory: 'laptops',
    price: 1199,
    originalPrice: 1299,
    image: 'https://www.apple.com/newsroom/images/2025/03/apple-introduces-the-new-macbook-air-with-the-m4-chip-and-a-sky-blue-color/article/Apple-MacBook-Air-hero-250305_big.jpg.large.jpg',
    specs: ['13.6" Liquid Retina', 'M4', '16GB RAM', '512GB SSD'],
    detailedSpecs: {
      Display: '13.6" Liquid Retina, 2560x1664, 500 nits, P3 wide color',
      Processor: 'Apple M4 (10-core CPU, 10-core GPU, 16-core Neural Engine)',
      Storage: '512GB SSD',
      RAM: '16GB unified memory',
      Battery: 'Up to 18 hours, MagSafe charging',
      Camera: '1080p FaceTime HD with Center Stage',
      OS: 'macOS Sequoia',
      Connectivity: 'Wi-Fi 6E, Bluetooth 5.3, 2x Thunderbolt 4, MagSafe 3',
      Audio: '4-speaker sound system, Spatial Audio with Dolby Atmos',
      Weight: '1.24 kg',
    },
    rating: 4.9,
    inStock: true,
    featured: false,
  },
  {
    name: 'Samsung Galaxy Tab S10',
    brand: 'Samsung',
    category: 'computers-tablets',
    subcategory: 'tablets',
    price: 849,
    originalPrice: 899,
    image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-tab-s10-ultra.jpg',
    specs: ['12.4" AMOLED', 'Dimensity 9300+', '256GB', 'S Pen Included'],
    detailedSpecs: {
      Display: '12.4" Dynamic AMOLED 2X, 2800x1752, 120Hz',
      Processor: 'MediaTek Dimensity 9300+',
      Storage: '256GB (expandable via microSD)',
      RAM: '12GB',
      Battery: '10090 mAh, 45W fast charging',
      Camera: '13MP Main + 8MP Ultra Wide, 12MP front',
      OS: 'Android 14, One UI 6.1',
      Connectivity: 'Wi-Fi 6E, Bluetooth 5.3, USB-C 3.2',
      Accessories: 'S Pen included, Book Cover Keyboard sold separately',
      Weight: '571g',
    },
    rating: 4.5,
    inStock: true,
    featured: false,
  },
];

export function runSeed() {
  console.log('[seed] Checking if database needs seeding...');

  const forceReseed = process.env.FORCE_RESEED === 'true';

  if (forceReseed) {
    console.log('[seed] FORCE_RESEED=true — clearing existing products and categories...');
    db.exec('DELETE FROM products');
    db.exec('DELETE FROM categories');
  } else {
    const existingCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    if (existingCategories.count > 0) {
      console.log('[seed] Database already seeded, skipping.');
      return;
    }
  }

  console.log('[seed] Seeding database...');

  const insertCategory = db.prepare(
    'INSERT INTO categories (name, slug, subcategories) VALUES (?, ?, ?)'
  );
  const insertProduct = db.prepare(`
    INSERT INTO products (name, brand, category, subcategory, price, originalPrice, image, specs, detailedSpecs, rating, inStock, featured, stock_quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  function getStockQuantity(category, subcategory) {
    if (category === 'mobile-phones') return 15;
    if (category === 'computers-tablets' && subcategory === 'tablets') return 10;
    if (category === 'computers-tablets' && subcategory === 'laptops') return 10;
    if (category === 'accessories') return 25;
    return 10;
  }

  const seedAll = db.transaction(() => {
    for (const cat of categories) {
      insertCategory.run(cat.name, cat.slug, JSON.stringify(cat.subcategories));
    }
    for (const p of products) {
      const stockQty = getStockQuantity(p.category, p.subcategory);
      insertProduct.run(
        p.name, p.brand, p.category, p.subcategory,
        p.price, p.originalPrice, p.image,
        JSON.stringify(p.specs), JSON.stringify(p.detailedSpecs),
        p.rating, p.inStock ? 1 : 0, p.featured ? 1 : 0, stockQty
      );
    }
  });

  seedAll();
  console.log(`[seed] Done: seeded ${categories.length} categories and ${products.length} products.`);
}

// Allow running directly: node server/seed.js
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed();
}
