import { Router } from 'express';
import db from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Helper function to format order with items
function formatOrder(orderRow, includeItems = false) {
  const formatted = {
    ...orderRow,
    isRead: Boolean(orderRow.isRead),
  };

  if (includeItems) {
    const items = db
      .prepare('SELECT * FROM order_items WHERE orderId = ?')
      .all(orderRow.id)
      .map((item) => ({
        ...item,
        productSpecs: JSON.parse(item.productSpecs),
      }));
    formatted.items = items;
  }

  return formatted;
}

// Helper to generate unique order number
function generateOrderNumber() {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');

  // Get today's order count
  const startOfDay = date.toISOString().slice(0, 10);
  const count = db
    .prepare('SELECT COUNT(*) as count FROM orders WHERE createdAt >= ?')
    .get(startOfDay + ' 00:00:00').count;

  const sequence = String(count + 1).padStart(4, '0');
  return `ORD-${datePart}-${sequence}`;
}

// POST /api/orders — Create new order (PUBLIC - from checkout)
router.post('/', (req, res) => {
  const {
    customerFirstName,
    customerLastName,
    customerEmail,
    shippingAddress,
    shippingCity,
    shippingZip,
    paymentMethod,
    items, // Array of cart items
    subtotal,
    tax,
    shipping,
    total,
    customerNote,
  } = req.body;

  // Validation
  if (!customerFirstName || !customerLastName || !customerEmail) {
    return res.status(400).json({ error: 'Customer information is required' });
  }
  if (!shippingAddress || !shippingCity || !shippingZip) {
    return res.status(400).json({ error: 'Shipping address is required' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }
  if (subtotal == null || tax == null || total == null) {
    return res.status(400).json({ error: 'Order totals are required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // ===== STOCK VALIDATION (BEFORE TRANSACTION) =====
  try {
    // Extract all product IDs from order items
    const productIds = items.map(item => item.id);

    // Fetch current stock levels for all products
    const products = db.prepare(`
      SELECT id, name, stock_quantity
      FROM products
      WHERE id IN (${productIds.map(() => '?').join(',')})
    `).all(...productIds);

    // Build stock map for quick lookup
    const stockMap = Object.fromEntries(products.map(p => [p.id, p]));

    // Validate each item
    const insufficientStock = [];
    for (const item of items) {
      const product = stockMap[item.id];
      if (!product || product.stock_quantity < item.quantity) {
        insufficientStock.push({
          productId: item.id,
          productName: item.name,
          requested: item.quantity,
          available: product?.stock_quantity || 0
        });
      }
    }

    // If any item has insufficient stock, reject entire order
    if (insufficientStock.length > 0) {
      return res.status(400).json({
        error: 'Insufficient stock for one or more items',
        details: insufficientStock
      });
    }
  } catch (error) {
    console.error('Error validating stock:', error);
    return res.status(500).json({ error: 'Failed to validate stock', details: error.message });
  }

  try {
    // Transaction: create order + insert order items + decrement stock
    const createOrder = db.transaction((orderData, orderItems) => {
      // Insert order
      const orderNumber = generateOrderNumber();
      const orderResult = db
        .prepare(
          `
        INSERT INTO orders (
          orderNumber, customerFirstName, customerLastName, customerEmail,
          shippingAddress, shippingCity, shippingZip,
          subtotal, tax, shipping, total, paymentMethod, customerNote, status, isRead
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', 0)
      `
        )
        .run(
          orderNumber,
          orderData.customerFirstName,
          orderData.customerLastName,
          orderData.customerEmail,
          orderData.shippingAddress,
          orderData.shippingCity,
          orderData.shippingZip,
          orderData.subtotal,
          orderData.tax,
          orderData.shipping || 0,
          orderData.total,
          orderData.paymentMethod || 'card',
          orderData.customerNote || ''
        );

      const orderId = orderResult.lastInsertRowid;

      // Insert order items
      const insertItem = db.prepare(`
        INSERT INTO order_items (
          orderId, productId, productName, productBrand, productImage,
          productCategory, unitPrice, quantity, subtotal, productSpecs
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of orderItems) {
        insertItem.run(
          orderId,
          item.id, // productId
          item.name,
          item.brand,
          item.image,
          item.category || '',
          item.price,
          item.quantity,
          item.price * item.quantity,
          JSON.stringify(item.specs || [])
        );
      }

      // ===== STOCK DEDUCTION (WITHIN TRANSACTION) =====
      // For each order item, decrement stock with race condition handling
      for (const item of orderItems) {
        const updateStmt = db.prepare(`
          UPDATE products
          SET stock_quantity = stock_quantity - ?,
              inStock = CASE WHEN stock_quantity - ? <= 0 THEN 0 ELSE 1 END,
              updatedAt = datetime('now')
          WHERE id = ? AND stock_quantity >= ?
        `);

        const result = updateStmt.run(item.quantity, item.quantity, item.id, item.quantity);

        // Check affected rows to detect race conditions
        if (result.changes === 0) {
          // Another order consumed the stock between validation and update
          throw new Error(`Product "${item.name}" sold out during checkout`);
        }
      }

      return orderId;
    });

    const orderId = createOrder(req.body, items);

    // Fetch the created order with items
    const created = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

    res.status(201).json(formatOrder(created, true));
  } catch (error) {
    console.error('Error creating order:', error);

    // Handle race condition (product sold out during checkout)
    if (error.message.includes('sold out during checkout')) {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// GET /api/orders/sales/stats — Get sales statistics (ADMIN ONLY)
// IMPORTANT: Must come BEFORE /:id to avoid conflict
router.get('/sales/stats', requireAdmin, (req, res) => {
  try {
    // Total revenue and order count (exclude cancelled orders)
    const revenueStats = db.prepare(`
      SELECT
        COUNT(*) as totalOrders,
        COALESCE(SUM(total), 0) as totalRevenue
      FROM orders
      WHERE status != 'Cancelled'
    `).get();

    // Total units sold
    const unitsStats = db.prepare(`
      SELECT COALESCE(SUM(oi.quantity), 0) as totalUnitsSold
      FROM order_items oi
      JOIN orders o ON o.id = oi.orderId
      WHERE o.status != 'Cancelled'
    `).get();

    // Average order value
    const averageOrderValue = revenueStats.totalOrders > 0
      ? revenueStats.totalRevenue / revenueStats.totalOrders
      : 0;

    // Top selling products (top 5 by quantity sold)
    const topProducts = db.prepare(`
      SELECT
        oi.productId,
        oi.productName,
        oi.productImage,
        SUM(oi.quantity) as unitsSold,
        SUM(oi.subtotal) as revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.orderId
      WHERE o.status != 'Cancelled'
      GROUP BY oi.productId
      ORDER BY unitsSold DESC
      LIMIT 5
    `).all();

    res.json({
      totalRevenue: revenueStats.totalRevenue,
      totalUnitsSold: unitsStats.totalUnitsSold,
      averageOrderValue,
      topSellingProducts: topProducts,
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ error: 'Failed to fetch sales statistics', details: error.message });
  }
});

// GET /api/orders/sales/trends — Get sales trends over time (ADMIN ONLY)
// IMPORTANT: Must come BEFORE /:id to avoid conflict
router.get('/sales/trends', requireAdmin, (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days);

    if (isNaN(daysNum) || daysNum < 1 || daysNum > 30) {
      return res.status(400).json({ error: 'days must be between 1 and 30' });
    }

    // Get sales data grouped by date
    const salesData = db.prepare(`
      SELECT
        DATE(createdAt) as date,
        SUM(total) as revenue,
        COUNT(*) as orderCount
      FROM orders
      WHERE status != 'Cancelled'
        AND createdAt >= date('now', '-' || ? || ' days')
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `).all(daysNum);

    // Build map of existing data
    const salesByDate = Object.fromEntries(
      salesData.map(row => [row.date, { revenue: row.revenue, orderCount: row.orderCount }])
    );

    // Generate all dates in range and fill gaps with 0
    const today = new Date();
    const filledData = [];

    for (let i = daysNum - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      filledData.push({
        date: dateStr,
        revenue: salesByDate[dateStr]?.revenue || 0,
        orderCount: salesByDate[dateStr]?.orderCount || 0,
      });
    }

    res.json(filledData);
  } catch (error) {
    console.error('Error fetching sales trends:', error);
    res.status(500).json({ error: 'Failed to fetch sales trends', details: error.message });
  }
});

// GET /api/orders — List all orders with filters (ADMIN ONLY)
router.get('/', requireAdmin, (req, res) => {
  const { status, startDate, endDate, email, limit = 100, offset = 0 } = req.query;

  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  if (startDate) {
    sql += ' AND createdAt >= ?';
    params.push(startDate);
  }

  if (endDate) {
    sql += ' AND createdAt <= ?';
    params.push(endDate);
  }

  if (email) {
    sql += ' AND customerEmail LIKE ?';
    params.push(`%${email}%`);
  }

  sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const orders = db.prepare(sql).all(...params);

  // Include item count for each order
  const ordersWithCounts = orders.map((order) => {
    const itemCount = db
      .prepare('SELECT COUNT(*) as count FROM order_items WHERE orderId = ?')
      .get(order.id).count;
    return {
      ...formatOrder(order, false),
      itemCount,
    };
  });

  res.json(ordersWithCounts);
});

// GET /api/orders/stats — Get order statistics (ADMIN ONLY)
router.get('/stats', requireAdmin, (req, res) => {
  const stats = {
    total: db.prepare('SELECT COUNT(*) as count FROM orders').get().count,
    new: db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'New'").get().count,
    processing: db
      .prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Processing'")
      .get().count,
    completed: db
      .prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Completed'")
      .get().count,
    cancelled: db
      .prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Cancelled'")
      .get().count,
    unread: db.prepare('SELECT COUNT(*) as count FROM orders WHERE isRead = 0').get().count,
    totalRevenue: db
      .prepare("SELECT COALESCE(SUM(total), 0) as sum FROM orders WHERE status != 'Cancelled'")
      .get().sum,
  };

  res.json(stats);
});

// GET /api/orders/:id — Get single order with items (ADMIN ONLY)
router.get('/:id', requireAdmin, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(formatOrder(order, true));
});

// PUT /api/orders/:id/status — Update order status (ADMIN ONLY)
router.put('/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;

  const validStatuses = ['New', 'Processing', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ error: 'Invalid status. Must be: New, Processing, Completed, or Cancelled' });
  }

  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Status transition validation
  const currentStatus = existing.status;
  const invalidTransitions = {
    Completed: ['New', 'Processing'], // Can't revert from Completed
    Cancelled: ['New', 'Processing', 'Completed'], // Can't change from Cancelled
  };

  if (invalidTransitions[currentStatus]?.includes(status)) {
    return res.status(400).json({
      error: `Cannot change status from ${currentStatus} to ${status}`,
    });
  }

  // Update with appropriate timestamp
  let timestampField = '';
  if (status === 'Completed') timestampField = ', completedAt = datetime("now")';
  if (status === 'Cancelled') timestampField = ', cancelledAt = datetime("now")';

  db.prepare(
    `
    UPDATE orders
    SET status = ?, updatedAt = datetime('now')${timestampField}
    WHERE id = ?
  `
  ).run(status, req.params.id);

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  res.json(formatOrder(updated, false));
});

// PUT /api/orders/:id/read — Mark order as read (ADMIN ONLY)
router.put('/:id/read', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Order not found' });
  }

  db.prepare('UPDATE orders SET isRead = 1 WHERE id = ?').run(req.params.id);

  res.json({ success: true });
});

// PUT /api/orders/read-all — Mark all orders as read (ADMIN ONLY)
router.put('/read-all', requireAdmin, (req, res) => {
  db.prepare('UPDATE orders SET isRead = 1 WHERE isRead = 0').run();
  res.json({ success: true });
});

// DELETE /api/orders/:id — Cancel order (ADMIN ONLY)
router.delete('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (existing.status === 'Completed') {
    return res.status(400).json({ error: 'Cannot delete completed orders' });
  }

  if (existing.status === 'Cancelled') {
    return res.status(400).json({ error: 'Order is already cancelled' });
  }

  // Get order items before cancellation to restore stock
  const items = db.prepare('SELECT productId, quantity FROM order_items WHERE orderId = ?')
    .all(req.params.id);

  // Transaction: Restore stock + Mark as cancelled
  const cancelOrder = db.transaction(() => {
    // Restore stock for each item
    for (const item of items) {
      db.prepare(`
        UPDATE products
        SET stock_quantity = stock_quantity + ?,
            inStock = 1,
            updatedAt = datetime('now')
        WHERE id = ?
      `).run(item.quantity, item.productId);
    }

    // Mark order as cancelled (soft delete)
    db.prepare(`
      UPDATE orders
      SET status = 'Cancelled', cancelledAt = datetime('now'), updatedAt = datetime('now')
      WHERE id = ?
    `).run(req.params.id);
  });

  cancelOrder();

  res.json({ message: 'Order cancelled successfully' });
});

export default router;
