import { Router } from 'express';
import db from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// GET all categories
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM categories').all();
  const categories = rows.map(row => ({
    ...row,
    subcategories: JSON.parse(row.subcategories),
  }));
  res.json(categories);
});

// POST create new category
router.post('/', requireAdmin, (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const categorySlug = slug || generateSlug(name);

    // Check for duplicate slug
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(categorySlug);
    if (existing) {
      return res.status(409).json({ error: 'Category with this slug already exists' });
    }

    const insert = db.prepare('INSERT INTO categories (name, slug, subcategories) VALUES (?, ?, ?)');
    const result = insert.run(name, categorySlug, '[]');

    const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      ...created,
      subcategories: JSON.parse(created.subcategories),
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT update category
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, subcategories } = req.body;

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updates = [];
    const params = [];

    if (name) {
      const newSlug = generateSlug(name);
      // Check if slug would conflict with another category
      if (newSlug !== category.slug) {
        const existing = db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(newSlug, id);
        if (existing) {
          return res.status(409).json({ error: 'Category with this slug already exists' });
        }
      }
      updates.push('name = ?', 'slug = ?');
      params.push(name, newSlug);
    }

    if (subcategories !== undefined) {
      // Validate subcategories structure
      if (!Array.isArray(subcategories)) {
        return res.status(400).json({ error: 'Subcategories must be an array' });
      }
      for (const sub of subcategories) {
        if (!sub.name || !sub.slug) {
          return res.status(400).json({ error: 'Each subcategory must have name and slug' });
        }
      }
      updates.push('subcategories = ?');
      params.push(JSON.stringify(subcategories));
    }

    if (updates.length > 0) {
      params.push(id);
      db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.json({
      ...updated,
      subcategories: JSON.parse(updated.subcategories),
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE category
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check for products using this category
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE category = ?')
      .get(category.slug).count;

    if (productCount > 0 && force !== 'true') {
      return res.status(409).json({
        error: `Cannot delete category with ${productCount} products. Use force=true to delete anyway.`,
        productCount
      });
    }

    // Delete products if force is true
    if (force === 'true' && productCount > 0) {
      db.prepare('DELETE FROM products WHERE category = ?').run(category.slug);
    }

    // Delete the category
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    res.json({
      message: 'Category deleted successfully',
      productsDeleted: force === 'true' ? productCount : 0
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// POST add subcategory to category
router.post('/:id/subcategories', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Subcategory name is required' });
    }

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subcategories = JSON.parse(category.subcategories);
    const subcategorySlug = slug || generateSlug(name);

    // Check for duplicate slug within this category
    if (subcategories.find(s => s.slug === subcategorySlug)) {
      return res.status(409).json({ error: 'Subcategory with this slug already exists in this category' });
    }

    subcategories.push({ name, slug: subcategorySlug });
    db.prepare('UPDATE categories SET subcategories = ? WHERE id = ?').run(JSON.stringify(subcategories), id);

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.json({
      ...updated,
      subcategories: JSON.parse(updated.subcategories),
    });
  } catch (error) {
    console.error('Error adding subcategory:', error);
    res.status(500).json({ error: 'Failed to add subcategory' });
  }
});

// DELETE subcategory from category
router.delete('/:id/subcategories/:subcategorySlug', requireAdmin, (req, res) => {
  try {
    const { id, subcategorySlug } = req.params;

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subcategories = JSON.parse(category.subcategories);
    const filteredSubs = subcategories.filter(s => s.slug !== subcategorySlug);

    if (filteredSubs.length === subcategories.length) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    // Update products using this subcategory (set to empty string)
    const updateResult = db.prepare('UPDATE products SET subcategory = ? WHERE category = ? AND subcategory = ?')
      .run('', category.slug, subcategorySlug);

    // Update category
    db.prepare('UPDATE categories SET subcategories = ? WHERE id = ?').run(JSON.stringify(filteredSubs), id);

    res.json({
      message: 'Subcategory deleted successfully',
      productsAffected: updateResult.changes
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ error: 'Failed to delete subcategory' });
  }
});

export default router;
