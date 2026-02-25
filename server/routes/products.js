import { Router } from 'express';
import db from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

function formatProduct(row) {
  return {
    ...row,
    specs: JSON.parse(row.specs),
    detailedSpecs: JSON.parse(row.detailedSpecs),
    inStock: Boolean(row.inStock),
    featured: Boolean(row.featured),
    stock_quantity: row.stock_quantity || 0,
  };
}

// GET /api/products — list with optional filters
router.get('/', (req, res) => {
  const { category, subcategory, featured } = req.query;

  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (subcategory) {
    sql += ' AND subcategory = ?';
    params.push(subcategory);
  }
  if (featured === 'true') {
    sql += ' AND featured = 1';
  }

  sql += ' ORDER BY id ASC';

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(formatProduct));
});

// GET /api/products/inventory — get inventory list sorted by stock (admin only)
// IMPORTANT: This must come BEFORE /:id to avoid conflict
router.get('/inventory', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY stock_quantity ASC, name ASC').all();
  const formattedProducts = rows.map(row => {
    const product = formatProduct(row);

    // Add lowStockLevel indicator
    if (product.stock_quantity === 0) {
      product.lowStockLevel = 'outOfStock';
    } else if (product.stock_quantity < 3) {
      product.lowStockLevel = 'critical';
    } else if (product.stock_quantity <= 5) {
      product.lowStockLevel = 'low';
    } else {
      product.lowStockLevel = 'normal';
    }

    return product;
  });

  res.json(formattedProducts);
});

// GET /api/products/:id — single product
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  res.json(formatProduct(row));
});

// POST /api/products — create (admin only)
router.post('/', requireAdmin, (req, res) => {
  const { name, brand, category, subcategory, price, originalPrice, image, specs, detailedSpecs, rating, inStock, featured, stock_quantity } = req.body;

  if (!name || !brand || !category || price == null) {
    return res.status(400).json({ error: 'name, brand, category, and price are required' });
  }

  const stockQty = stock_quantity != null ? stock_quantity : 0;

  const result = db.prepare(`
    INSERT INTO products (name, brand, category, subcategory, price, originalPrice, image, specs, detailedSpecs, rating, inStock, featured, stock_quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, brand, category, subcategory || '',
    price, originalPrice || price,
    image || '',
    JSON.stringify(specs || []),
    JSON.stringify(detailedSpecs || {}),
    rating || 0,
    stockQty > 0 ? 1 : 0,  // Sync inStock with stock_quantity
    featured ? 1 : 0,
    stockQty
  );

  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(formatProduct(created));
});

// PUT /api/products/:id — update (admin only)
router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const { name, brand, category, subcategory, price, originalPrice, image, specs, detailedSpecs, rating, inStock, featured, stock_quantity } = req.body;

  const newStockQty = stock_quantity !== undefined ? stock_quantity : existing.stock_quantity;

  db.prepare(`
    UPDATE products SET
      name = ?, brand = ?, category = ?, subcategory = ?,
      price = ?, originalPrice = ?, image = ?,
      specs = ?, detailedSpecs = ?,
      rating = ?, inStock = ?, featured = ?,
      stock_quantity = ?,
      updatedAt = datetime('now')
    WHERE id = ?
  `).run(
    name ?? existing.name,
    brand ?? existing.brand,
    category ?? existing.category,
    subcategory ?? existing.subcategory,
    price ?? existing.price,
    originalPrice ?? existing.originalPrice,
    image ?? existing.image,
    specs ? JSON.stringify(specs) : existing.specs,
    detailedSpecs ? JSON.stringify(detailedSpecs) : existing.detailedSpecs,
    rating ?? existing.rating,
    newStockQty > 0 ? 1 : 0,  // Sync inStock with stock_quantity
    featured !== undefined ? (featured ? 1 : 0) : existing.featured,
    newStockQty,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(formatProduct(updated));
});

// DELETE /api/products/:id — delete (admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product deleted' });
});

// PATCH /api/products/:id/stock — update stock quantity (admin only)
router.patch('/:id/stock', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const { stock_quantity } = req.body;

  // Validation
  if (stock_quantity == null) {
    return res.status(400).json({ error: 'stock_quantity is required' });
  }

  if (!Number.isInteger(stock_quantity) || stock_quantity < 0) {
    return res.status(400).json({ error: 'stock_quantity must be a non-negative integer' });
  }

  if (stock_quantity > 10000) {
    return res.status(400).json({ error: 'stock_quantity cannot exceed 10000' });
  }

  // Update stock and sync inStock
  db.prepare(`
    UPDATE products SET
      stock_quantity = ?,
      inStock = CASE WHEN ? > 0 THEN 1 ELSE 0 END,
      updatedAt = datetime('now')
    WHERE id = ?
  `).run(stock_quantity, stock_quantity, req.params.id);

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(formatProduct(updated));
});

// POST /api/products/bulk — bulk upload (admin only)
router.post('/bulk', requireAdmin, (req, res) => {
  try {
    const { products } = req.body;

    // Validate request structure
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Request must contain a "products" array' });
    }

    // Check batch limit
    const MAX_PRODUCTS_PER_BATCH = 1000;
    if (products.length > MAX_PRODUCTS_PER_BATCH) {
      return res.status(400).json({
        error: `Too many products. Maximum ${MAX_PRODUCTS_PER_BATCH} per upload. You provided ${products.length}.`
      });
    }

    if (products.length === 0) {
      return res.status(400).json({ error: 'Products array cannot be empty' });
    }

    // Pre-fetch all categories for validation
    const categories = db.prepare('SELECT slug, subcategories FROM categories').all();
    const categoryMap = new Map(categories.map(c => [c.slug, JSON.parse(c.subcategories)]));

    // Validate all products before inserting
    const errors = [];
    const validProducts = [];

    products.forEach((product, index) => {
      const productErrors = [];

      // Required fields
      if (!product.name) productErrors.push('name is required');
      if (!product.brand) productErrors.push('brand is required');
      if (!product.category) productErrors.push('category is required');
      if (product.price == null) productErrors.push('price is required');

      // Category exists
      if (product.category && !categoryMap.has(product.category)) {
        productErrors.push(`category "${product.category}" does not exist`);
      }

      // Subcategory exists in category
      if (product.subcategory && product.category) {
        const subs = categoryMap.get(product.category) || [];
        if (!subs.find(s => s.slug === product.subcategory)) {
          productErrors.push(`subcategory "${product.subcategory}" does not exist in category "${product.category}"`);
        }
      }

      // Price validation
      if (product.price != null && (isNaN(product.price) || product.price <= 0)) {
        productErrors.push('price must be a positive number');
      }

      // Rating validation
      if (product.rating != null && (isNaN(product.rating) || product.rating < 0 || product.rating > 5)) {
        productErrors.push('rating must be between 0 and 5');
      }

      if (productErrors.length > 0) {
        errors.push({
          index,
          product: { name: product.name, brand: product.brand },
          errors: productErrors.join(', ')
        });
      } else {
        validProducts.push(product);
      }
    });

    // If any validation errors, return them without inserting
    if (errors.length > 0) {
      return res.json({
        success: 0,
        failed: errors.length,
        errors
      });
    }

    // Insert all valid products in a transaction
    const insert = db.prepare(`
      INSERT INTO products (name, brand, category, subcategory, price, originalPrice, image, specs, detailedSpecs, rating, inStock, featured, stock_quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((products) => {
      for (const p of products) {
        const stockQty = p.stock_quantity != null ? p.stock_quantity : 0;
        insert.run(
          p.name,
          p.brand,
          p.category,
          p.subcategory || '',
          p.price,
          p.originalPrice || p.price,
          p.image || '',
          JSON.stringify(p.specs || []),
          JSON.stringify(p.detailedSpecs || {}),
          p.rating || 0,
          stockQty > 0 ? 1 : 0,  // Sync inStock with stock_quantity
          p.featured ? 1 : 0,
          stockQty
        );
      }
    });

    insertMany(validProducts);

    res.json({
      success: validProducts.length,
      failed: 0,
      errors: []
    });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    res.status(500).json({ error: 'Failed to upload products', details: error.message });
  }
});

export default router;
