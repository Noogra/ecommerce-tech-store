import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import chatRoutes from './routes/chat.js';
import financeRoutes from './routes/finance.js';
import { runSeed } from './seed.js';

dotenv.config();

console.log('[startup] PORT:', process.env.PORT || 3001);
console.log('[startup] DB_PATH:', process.env.DB_PATH || '(not set, using default)');

try {
  runSeed();
} catch (err) {
  console.error('[startup] Seeding failed (non-fatal):', err.message);
}

// Safety net: prevent unhandled promise rejections from crashing the server
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason?.message || reason);
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
}));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/finance', financeRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
