import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import { requireAdmin } from '../middleware/auth.js';
import db from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|png|jpg|jpeg|webp/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Only PDF and image files are allowed'));
  },
});

const router = Router();

// ─── Suppliers ────────────────────────────────────────────────────────────────

// GET /api/finance/suppliers  – list all suppliers with current balance
router.get('/suppliers', requireAdmin, (_req, res) => {
  const suppliers = db.prepare(`
    SELECT
      s.*,
      COALESCE(SUM(CASE WHEN t.type = 'invoice' THEN t.amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN t.type = 'payment' THEN t.amount ELSE 0 END), 0) AS currentBalance
    FROM suppliers s
    LEFT JOIN transactions t ON t.supplierId = s.id
    GROUP BY s.id
    ORDER BY s.name
  `).all();
  res.json(suppliers);
});

// POST /api/finance/suppliers
router.post('/suppliers', requireAdmin, (req, res) => {
  const { name, contactName = '', phone = '', email = '', address = '', notes = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Supplier name is required' });

  const result = db.prepare(`
    INSERT INTO suppliers (name, contactName, phone, email, address, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name.trim(), contactName, phone, email, address, notes);

  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(supplier);
});

// PUT /api/finance/suppliers/:id
router.put('/suppliers/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, contactName = '', phone = '', email = '', address = '', notes = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Supplier name is required' });

  const result = db.prepare(`
    UPDATE suppliers
    SET name = ?, contactName = ?, phone = ?, email = ?, address = ?, notes = ?,
        updatedAt = datetime('now')
    WHERE id = ?
  `).run(name.trim(), contactName, phone, email, address, notes, id);

  if (result.changes === 0) return res.status(404).json({ error: 'Supplier not found' });
  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
  res.json(supplier);
});

// DELETE /api/finance/suppliers/:id
router.delete('/suppliers/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'Supplier not found' });
  res.json({ success: true });
});

// ─── Transactions ─────────────────────────────────────────────────────────────

// GET /api/finance/transactions  – list all, optional ?supplierId=&type=
router.get('/transactions', requireAdmin, (req, res) => {
  const { supplierId, type } = req.query;
  let query = `
    SELECT * FROM transactions
    WHERE 1=1
  `;
  const params = [];
  if (supplierId) { query += ' AND supplierId = ?'; params.push(supplierId); }
  if (type) { query += ' AND type = ?'; params.push(type); }
  query += ' ORDER BY transactionDate DESC, createdAt DESC';
  const transactions = db.prepare(query).all(...params);
  res.json(transactions);
});

// POST /api/finance/transactions  (with optional file upload)
router.post('/transactions', requireAdmin, upload.single('file'), (req, res) => {
  const {
    type, supplierId, amount, description = '', referenceNumber = '', transactionDate,
  } = req.body;

  if (!type || !['invoice', 'payment'].includes(type))
    return res.status(400).json({ error: 'type must be "invoice" or "payment"' });
  if (!supplierId) return res.status(400).json({ error: 'supplierId is required' });
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
    return res.status(400).json({ error: 'amount must be a positive number' });

  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(supplierId);
  if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

  const filePath = req.file ? `/uploads/${req.file.filename}` : null;
  const fileName = req.file ? req.file.originalname : null;
  const date = transactionDate || new Date().toISOString().slice(0, 10);

  const result = db.prepare(`
    INSERT INTO transactions
      (type, supplierId, supplierName, amount, description, referenceNumber, filePath, fileName, transactionDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(type, supplierId, supplier.name, parseFloat(amount), description, referenceNumber, filePath, fileName, date);

  const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(transaction);
});

// DELETE /api/finance/transactions/:id
router.delete('/transactions/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const tx = db.prepare('SELECT filePath FROM transactions WHERE id = ?').get(id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  // Clean up uploaded file if it exists
  if (tx.filePath) {
    const abs = path.join(__dirname, '..', tx.filePath);
    try { fs.unlinkSync(abs); } catch { /* file may already be gone */ }
  }

  db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  res.json({ success: true });
});

// ─── Financial Summary ────────────────────────────────────────────────────────

// GET /api/finance/summary
router.get('/summary', requireAdmin, (_req, res) => {
  // Total debt across all suppliers
  const debtRow = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'invoice' THEN amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) AS totalDebt,
      COALESCE(SUM(CASE WHEN type = 'invoice' THEN amount ELSE 0 END), 0) AS totalInvoiced,
      COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) AS totalPaid
    FROM transactions
  `).get();

  // Monthly expense breakdown (last 12 months)
  const monthlyExpenses = db.prepare(`
    SELECT
      strftime('%Y-%m', transactionDate) AS month,
      COALESCE(SUM(CASE WHEN type = 'invoice' THEN amount ELSE 0 END), 0) AS invoiced,
      COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) AS paid
    FROM transactions
    WHERE transactionDate >= date('now', '-12 months')
    GROUP BY month
    ORDER BY month ASC
  `).all();

  // Sales revenue for same months (for profit margin)
  const monthlySales = db.prepare(`
    SELECT
      strftime('%Y-%m', createdAt) AS month,
      COALESCE(SUM(total), 0) AS revenue,
      COUNT(*) AS orderCount
    FROM orders
    WHERE status != 'Cancelled'
      AND createdAt >= date('now', '-12 months')
    GROUP BY month
    ORDER BY month ASC
  `).all();

  // Top suppliers by invoice amount
  const topSuppliers = db.prepare(`
    SELECT
      s.name,
      COALESCE(SUM(CASE WHEN t.type = 'invoice' THEN t.amount ELSE 0 END), 0) AS totalInvoiced,
      COALESCE(SUM(CASE WHEN t.type = 'payment' THEN t.amount ELSE 0 END), 0) AS totalPaid,
      COALESCE(SUM(CASE WHEN t.type = 'invoice' THEN t.amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN t.type = 'payment' THEN t.amount ELSE 0 END), 0) AS balance
    FROM suppliers s
    LEFT JOIN transactions t ON t.supplierId = s.id
    GROUP BY s.id
    ORDER BY totalInvoiced DESC
    LIMIT 10
  `).all();

  res.json({
    ...debtRow,
    monthlyExpenses,
    monthlySales,
    topSuppliers,
  });
});

// ─── AI Document Analysis ─────────────────────────────────────────────────────

// POST /api/finance/analyze  – upload + extract data with AI vision
router.post('/analyze', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured in .env' });
  }

  try {
    const fileBuffer = fs.readFileSync(path.join(uploadsDir, req.file.filename));
    const base64Data = fileBuffer.toString('base64');
    const ext = path.extname(req.file.originalname).toLowerCase();
    const isPDF = ext === '.pdf';

    let mediaType = 'image/jpeg';
    if (ext === '.png') mediaType = 'image/png';
    else if (ext === '.webp') mediaType = 'image/webp';
    else if (isPDF) mediaType = 'application/pdf';

    const contentBlock = isPDF
      ? { type: 'document', source: { type: 'base64', media_type: mediaType, data: base64Data } }
      : { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } };

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          contentBlock,
          {
            type: 'text',
            text: `Analyze this financial document and return ONLY a valid JSON object — no markdown, no code blocks, no explanation.

Required JSON format:
{
  "supplierName": "full company/vendor name",
  "contactName": "contact person name or null",
  "contactEmail": "email address or null",
  "contactPhone": "phone number or null",
  "contactAddress": "full address or null",
  "documentType": "invoice" or "payment",
  "amount": 1234.56,
  "date": "YYYY-MM-DD",
  "referenceNumber": "invoice or receipt number or null",
  "description": "brief description of what was purchased or paid for",
  "confidence": 0.95
}

Classification rules:
- "invoice": Tax invoice, purchase invoice, commercial invoice, bill — money OWED to supplier (increases debt)
- "payment": Payment receipt, bank transfer confirmation, remittance advice — money PAID to supplier (decreases debt)

Amount: final grand total only, as a plain number (no currency symbol).
Date: YYYY-MM-DD. Use today (${new Date().toISOString().slice(0, 10)}) if not found.
Use null for any field that cannot be determined from the document.`,
          },
        ],
      }],
    });

    const rawText = response.content[0].text.trim();
    let extracted;
    try {
      extracted = JSON.parse(rawText.replace(/^```json?\s*|\s*```$/g, '').trim());
    } catch {
      return res.status(422).json({
        error: 'AI could not structure the document data. Please ensure it is a clear financial document.',
      });
    }

    if (!extracted.supplierName || !extracted.documentType || extracted.amount == null) {
      return res.status(422).json({
        error: 'This does not appear to be a financial document. Required fields (supplier, type, amount) could not be found.',
      });
    }

    res.json({
      ...extracted,
      tempFilename: req.file.filename,
      originalName: req.file.originalname,
    });
  } catch (err) {
    // Clean up the saved file on failure
    try { fs.unlinkSync(path.join(uploadsDir, req.file.filename)); } catch { /* ignore */ }
    console.error('Finance analyze error:', err.message);
    res.status(500).json({ error: `Analysis failed: ${err.message}` });
  }
});

// POST /api/finance/confirm  – upsert supplier + commit transaction
router.post('/confirm', requireAdmin, (req, res) => {
  const {
    supplierName, contactName = '', contactEmail = '', contactPhone = '', contactAddress = '',
    documentType, amount, date, referenceNumber = '', description = '',
    tempFilename, originalName,
  } = req.body;

  if (!supplierName?.trim()) return res.status(400).json({ error: 'Supplier name is required' });
  if (!['invoice', 'payment'].includes(documentType))
    return res.status(400).json({ error: 'documentType must be "invoice" or "payment"' });
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
    return res.status(400).json({ error: 'Amount must be a positive number' });

  const commit = db.transaction(() => {
    // Upsert: find supplier by name (case-insensitive) or create
    let supplier = db.prepare(
      "SELECT * FROM suppliers WHERE lower(name) = lower(?)"
    ).get(supplierName.trim());
    const isNewSupplier = !supplier;

    if (!supplier) {
      const r = db.prepare(`
        INSERT INTO suppliers (name, contactName, phone, email, address)
        VALUES (?, ?, ?, ?, ?)
      `).run(supplierName.trim(), contactName, contactPhone, contactEmail, contactAddress);
      supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(r.lastInsertRowid);
    }

    const filePath = tempFilename ? `/uploads/${tempFilename}` : null;
    const fileName = tempFilename ? (originalName || tempFilename) : null;
    const txDate = date || new Date().toISOString().slice(0, 10);

    const r = db.prepare(`
      INSERT INTO transactions
        (type, supplierId, supplierName, amount, description, referenceNumber, filePath, fileName, transactionDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      documentType, supplier.id, supplier.name,
      parseFloat(amount), description, referenceNumber,
      filePath, fileName, txDate
    );

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(r.lastInsertRowid);
    return { supplier, transaction, isNewSupplier };
  });

  try {
    res.status(201).json(commit());
  } catch (err) {
    console.error('Finance confirm error:', err.message);
    res.status(500).json({ error: `Failed to save: ${err.message}` });
  }
});

// ─── Serve uploaded files ─────────────────────────────────────────────────────
router.get('/file/:filename', requireAdmin, (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(filePath);
});

export default router;
