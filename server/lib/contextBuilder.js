/**
 * Builds a structured store context from the database for the AI assistant.
 * PII Prevention: SQL queries explicitly SELECT only non-PII columns.
 * Defense-in-depth: regex strips email patterns from final output.
 */

function sanitizeContext(text) {
  return text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED]');
}

export function buildStoreContext(db) {
  // 1. Product catalog (NO customer data)
  const productCatalog = db.prepare(`
    SELECT id, name, brand, category, subcategory, price, originalPrice,
           rating, stock_quantity, inStock, featured, createdAt
    FROM products
    ORDER BY category, name
  `).all();

  // 2. Category breakdown with stock health
  const categoryBreakdown = db.prepare(`
    SELECT
      category,
      COUNT(*) as productCount,
      ROUND(AVG(price), 2) as avgPrice,
      MIN(price) as minPrice,
      MAX(price) as maxPrice,
      SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as outOfStockCount,
      SUM(CASE WHEN stock_quantity > 0 AND stock_quantity < 5 THEN 1 ELSE 0 END) as lowStockCount
    FROM products
    GROUP BY category
  `).all();

  // 3. Inventory alerts (low stock items)
  const inventoryAlerts = db.prepare(`
    SELECT name, brand, category, price, stock_quantity
    FROM products
    WHERE stock_quantity < 5
    ORDER BY stock_quantity ASC
  `).all();

  // 4. Sales overview (aggregates only, no PII)
  const salesOverview = db.prepare(`
    SELECT
      COUNT(*) as totalOrders,
      COALESCE(SUM(total), 0) as totalRevenue,
      COALESCE(AVG(total), 0) as avgOrderValue,
      COALESCE(MIN(total), 0) as minOrderValue,
      COALESCE(MAX(total), 0) as maxOrderValue
    FROM orders
    WHERE status != 'Cancelled'
  `).get();

  // 5. Order status distribution
  const orderStatusDistribution = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM orders
    GROUP BY status
  `).all();

  // 6. Top selling products (from order_items, NO customer columns)
  const topSellingProducts = db.prepare(`
    SELECT
      oi.productName, oi.productBrand, oi.productCategory,
      SUM(oi.quantity) as totalUnitsSold,
      SUM(oi.subtotal) as totalRevenue,
      COUNT(DISTINCT oi.orderId) as orderCount
    FROM order_items oi
    JOIN orders o ON o.id = oi.orderId
    WHERE o.status != 'Cancelled'
    GROUP BY oi.productId
    ORDER BY totalUnitsSold DESC
    LIMIT 10
  `).all();

  // 7. Sales trends (last 30 days, daily)
  const salesTrends = db.prepare(`
    SELECT
      DATE(createdAt) as date,
      COUNT(*) as orderCount,
      SUM(total) as revenue
    FROM orders
    WHERE status != 'Cancelled'
      AND createdAt >= date('now', '-30 days')
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  `).all();

  // 8. Sales by category
  const salesByCategory = db.prepare(`
    SELECT
      oi.productCategory as category,
      SUM(oi.quantity) as unitsSold,
      SUM(oi.subtotal) as revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.orderId
    WHERE o.status != 'Cancelled'
    GROUP BY oi.productCategory
    ORDER BY revenue DESC
  `).all();

  // 9. Recent orders (ANONYMIZED - no customer names, emails, addresses)
  const recentOrders = db.prepare(`
    SELECT orderNumber, subtotal, tax, shipping, total,
           paymentMethod, status, createdAt
    FROM orders
    ORDER BY createdAt DESC
    LIMIT 20
  `).all();

  // 10. Suppliers with current balance (invoiced - paid)
  const suppliers = db.prepare(`
    SELECT
      s.id, s.name, s.contactName, s.notes,
      COALESCE(SUM(CASE WHEN t.type = 'invoice' THEN t.amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN t.type = 'payment' THEN t.amount ELSE 0 END), 0) AS currentBalance,
      COALESCE(SUM(CASE WHEN t.type = 'invoice' THEN t.amount ELSE 0 END), 0) AS totalInvoiced,
      COALESCE(SUM(CASE WHEN t.type = 'payment' THEN t.amount ELSE 0 END), 0) AS totalPaid
    FROM suppliers s
    LEFT JOIN transactions t ON t.supplierId = s.id
    GROUP BY s.id
    ORDER BY currentBalance DESC
  `).all();

  // 11. Financial summary aggregates
  const financialSummary = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'invoice' THEN amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) AS totalDebt,
      COALESCE(SUM(CASE WHEN type = 'invoice' THEN amount ELSE 0 END), 0) AS totalInvoiced,
      COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) AS totalPaid
    FROM transactions
  `).get();

  // 12. Monthly expenses (last 6 months)
  const monthlyExpenses = db.prepare(`
    SELECT
      strftime('%Y-%m', transactionDate) AS month,
      COALESCE(SUM(CASE WHEN type = 'invoice' THEN amount ELSE 0 END), 0) AS invoiced,
      COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) AS paid
    FROM transactions
    WHERE transactionDate >= date('now', '-6 months')
    GROUP BY month
    ORDER BY month ASC
  `).all();

  // 13. Recent transactions (last 20, no PII)
  const recentTransactions = db.prepare(`
    SELECT type, supplierName, amount, description, referenceNumber, transactionDate
    FROM transactions
    ORDER BY transactionDate DESC, createdAt DESC
    LIMIT 20
  `).all();

  const context = {
    productCatalog,
    categoryBreakdown,
    inventoryAlerts,
    salesOverview,
    orderStatusDistribution,
    topSellingProducts,
    salesTrends,
    salesByCategory,
    recentOrders,
    suppliers,
    financialSummary,
    monthlyExpenses,
    recentTransactions,
    metadata: {
      totalProducts: productCatalog.length,
      totalCategories: categoryBreakdown.length,
      totalSuppliers: suppliers.length,
      generatedAt: new Date().toISOString(),
    },
  };

  // Defense-in-depth: sanitize the entire context as a string
  const raw = JSON.stringify(context);
  const sanitized = sanitizeContext(raw);

  return JSON.parse(sanitized);
}
