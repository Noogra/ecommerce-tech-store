import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'phonestop.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subcategories TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL DEFAULT '',
    price REAL NOT NULL,
    originalPrice REAL NOT NULL,
    image TEXT NOT NULL DEFAULT '',
    specs TEXT NOT NULL DEFAULT '[]',
    detailedSpecs TEXT NOT NULL DEFAULT '{}',
    rating REAL NOT NULL DEFAULT 0,
    inStock INTEGER NOT NULL DEFAULT 1,
    featured INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
  CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderNumber TEXT NOT NULL UNIQUE,

    -- Customer Information
    customerFirstName TEXT NOT NULL,
    customerLastName TEXT NOT NULL,
    customerEmail TEXT NOT NULL,
    shippingAddress TEXT NOT NULL,
    shippingCity TEXT NOT NULL,
    shippingZip TEXT NOT NULL,

    -- Order Financials
    subtotal REAL NOT NULL,
    tax REAL NOT NULL,
    shipping REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,

    -- Payment Info (no sensitive data)
    paymentMethod TEXT NOT NULL DEFAULT 'card',

    -- Order Status & Tracking
    status TEXT NOT NULL DEFAULT 'New',
    isRead INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    completedAt TEXT,
    cancelledAt TEXT,

    -- Optional notes
    customerNote TEXT DEFAULT '',
    adminNote TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,

    -- Product snapshot at time of purchase
    productId INTEGER NOT NULL,
    productName TEXT NOT NULL,
    productBrand TEXT NOT NULL,
    productImage TEXT NOT NULL,
    productCategory TEXT NOT NULL DEFAULT '',

    -- Pricing at time of purchase
    unitPrice REAL NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal REAL NOT NULL,

    -- Product specs snapshot (JSON stored as TEXT)
    productSpecs TEXT NOT NULL DEFAULT '[]',

    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customerEmail);
  CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(createdAt DESC);
  CREATE INDEX IF NOT EXISTS idx_orders_isRead ON orders(isRead);
  CREATE INDEX IF NOT EXISTS idx_orders_orderNumber ON orders(orderNumber);
  CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items(orderId);
  CREATE INDEX IF NOT EXISTS idx_order_items_productId ON order_items(productId);
`);

// Suppliers table
db.exec(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contactName TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('invoice', 'payment')),
    supplierId INTEGER NOT NULL,
    supplierName TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    referenceNumber TEXT NOT NULL DEFAULT '',
    filePath TEXT,
    fileName TEXT,
    transactionDate TEXT NOT NULL DEFAULT (date('now')),
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (supplierId) REFERENCES suppliers(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_supplierId ON transactions(supplierId);
  CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transactionDate DESC);
`);

// Migration: Add stock_quantity column to products table if it doesn't exist
try {
  db.exec(`ALTER TABLE products ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0;`);
  console.log('✅ Added stock_quantity column to products table');
} catch (err) {
  // Column might already exist, which is fine
  if (!err.message.includes('duplicate column')) {
    throw err;
  }
}

// Create index for stock_quantity for efficient low-stock queries
db.exec(`CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);`);

export default db;
