# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PhoneStop** — a full-stack e-commerce store for phones, accessories, and computers/tablets. React 19 + Vite frontend, Express 5 backend, SQLite database.

## Commands

```bash
# Full local development (frontend on :5173, backend on :3001)
npm run dev:all

# Frontend only (Vite)
npm run dev

# Backend only (nodemon, auto-restarts on server/ changes)
npm run server

# Production start (backend only)
npm start

# Build frontend
npm run build

# Lint
npm run lint

# Seed/reseed database
npm run seed
# Or force-reseed: FORCE_RESEED=true npm start
```

There are no automated tests in this project.

## Architecture

### Split Deployment

- **Frontend**: Deployed to Vercel (static). `vercel.json` rewrites `/api/*` to the Railway backend URL.
- **Backend**: Deployed to Railway (`railway.toml`). Starts with `node server/server.js`.
- **Local dev**: Vite proxies `/api/*` to `http://localhost:3001` (see `vite.config.js`).

### Backend (`server/`)

- `server.js` — Express entry point. Runs `runSeed()` on startup (idempotent; skips if already seeded).
- `db.js` — Initializes SQLite via `better-sqlite3` with WAL mode. Creates all tables inline (schema-as-code). Runs the `stock_quantity` migration via try/catch on startup.
- `routes/` — One file per resource: `products`, `categories`, `auth`, `orders`, `chat`, `finance`.
- `middleware/auth.js` — `requireAdmin` middleware: validates JWT Bearer token.
- `lib/contextBuilder.js` — Builds a PII-sanitized DB snapshot for the AI assistant (emails redacted via regex).
- `lib/systemPrompt.js` — Constructs the system prompt for AI chat using the DB context.
- `uploads/` — File uploads (supplier invoice attachments) stored here via multer.

### Frontend (`src/`)

- `App.jsx` — Defines all routes. Public layout wraps customer-facing pages. Admin routes are protected via `<ProtectedRoute />`.
- `context/AuthContext.jsx` — JWT stored in `localStorage` under `admin_token`. Expiry is checked client-side by decoding the JWT payload.
- `context/CartContext.jsx` — Cart state (no persistence).
- `api/` — One file per domain (mirrors server routes). All calls go to `/api/...` (intercepted by Vite proxy in dev, Vercel rewrite in production).
- `pages/admin/` — Full admin panel: Dashboard, Products (CRUD + bulk upload), Categories, Orders, Inventory, Sales Report, Finance (suppliers + transactions), and AI Chat.

### Database Schema (SQLite)

| Table | Key columns |
|---|---|
| `categories` | `slug` (unique), `subcategories` (JSON TEXT) |
| `products` | `category`/`subcategory` (slugs), `specs`/`detailedSpecs` (JSON TEXT), `stock_quantity`, `inStock`, `featured` |
| `orders` | `orderNumber` (unique), customer fields, `status`, `isRead` |
| `order_items` | Snapshot of product data at purchase time (denormalized) |
| `suppliers` | Contact info |
| `transactions` | `type` = `'invoice'` or `'payment'`, `filePath`/`fileName` for attachments |

`specs` and `detailedSpecs` on products are stored as JSON strings — always `JSON.stringify` on write and `JSON.parse` on read.

### AI Chat Feature

- Admin-only (`requireAdmin`). POST `/api/chat` streams a response via SSE (Server-Sent Events).
- Uses `claude-haiku-4-5-20251001`. Conversation limited to last 20 messages.
- Fresh store context (products, orders, inventory, financials) is injected as system prompt on every request via `contextBuilder.js`.

## Environment Variables

Required in `.env` (or Railway/Vercel environment):

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Enables admin AI chat |
| `JWT_SECRET` | Signs admin auth tokens |
| `ADMIN_PASSWORD` | Password for `/admin/login` |
| `PORT` | Server port (default `3001`) |
| `DB_PATH` | SQLite file path (default `server/phonestop.db`) |
| `FORCE_RESEED` | Set to `true` to clear and re-seed categories/products on next start |
| `ALLOWED_ORIGIN` | CORS origin (default `*`) |

## Key Conventions

- **Tailwind CSS v4** is integrated as a Vite plugin (`@tailwindcss/vite`), not via PostCSS config.
- **ESM throughout** — both server and frontend use `import`/`export` (`"type": "module"` in package.json).
- **Admin auth flow**: POST `/api/auth/login` with password → JWT returned → stored in `localStorage` → sent as `Authorization: Bearer <token>` header.
- **Bulk product upload**: JSON file upload (`/admin/products/bulk-upload`). See `samples/product-upload-template.json` for the expected format.
- **Seed data**: `server/seed.js` contains all initial categories and products. Runs automatically on server start.
