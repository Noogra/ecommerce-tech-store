# PhoneStop — Project Memory

> Last updated: 2026-02-28

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS v4 (Vite plugin), React Router v7 |
| Backend | Express 5, Node.js ≥20, ESM (`"type": "module"`) |
| Database | SQLite via `better-sqlite3` (WAL mode) |
| AI Chat | `@anthropic-ai/sdk` — `claude-haiku-4-5-20251001`, SSE streaming |
| Auth | JWT (`jsonwebtoken`), stored in `localStorage` as `admin_token` |
| File Uploads | `multer` → `server/uploads/` |
| Charts | `recharts` |
| Markdown | `react-markdown` + `remark-gfm` |
| Deployment | Frontend → Vercel (static) | Backend → Railway |
| i18n | `react-i18next` + `i18next` (added 2026-02-28) |

---

## Current State

- **Full working e-commerce storefront**: browse by category/subcategory, product detail, cart drawer, checkout form, order creation
- **Admin dashboard** (JWT-protected at `/admin`): Dashboard, Orders, Products (CRUD + bulk JSON upload), Inventory, Categories, Sales Report, Finance (suppliers + transactions + file attachments), AI Chat (SSE)
- **SQLite DB** seeded via `server/seed.js` (auto-runs on startup, idempotent). Force-reseed with `FORCE_RESEED=true`
- **Bilingual support (EN/HE)** with full RTL for Hebrew — see i18n section below

---

## Key File Paths

```
src/
  App.jsx                   — Routes, wraps with AuthProvider, CartProvider, LanguageProvider
  main.jsx                  — Entry: initializes i18n, renders App
  index.css                 — Global styles (Tailwind v4 @import)
  i18n/
    index.js                — i18next config (en default, he)
    locales/
      en.json               — English translations
      he.json               — Hebrew translations
  context/
    AuthContext.jsx         — JWT auth state
    CartContext.jsx         — Cart state (no persistence)
    LanguageContext.jsx     — Language/RTL state, persists to localStorage
  components/
    layout/
      Navbar.jsx            — Sticky top nav, mega-menu, mobile drawer, LanguageSwitcher
      Footer.jsx            — Footer links
      MegaMenu.jsx          — Desktop mega menu
    home/
      Hero.jsx              — Landing hero section
      CategoryBanner.jsx    — Category cards
      FeaturedProducts.jsx  — Featured products grid
    product/
      ProductCard.jsx       — Product card (used in grids)
      ProductGrid.jsx       — Filterable product grid
    admin/
      NotificationBell.jsx  — Order notification bell
    ui/
      LanguageSwitcher.jsx  — EN/HE toggle button
      Toast.jsx             — Toast notification
  pages/
    HomePage.jsx, CategoryPage.jsx, ProductDetailPage.jsx
    CheckoutPage.jsx, LoginPage.jsx
    admin/
      AdminLayout.jsx       — Sidebar nav + LanguageSwitcher
      AdminDashboard.jsx, AdminOrders.jsx, AdminProducts.jsx
      AdminProductForm.jsx, AdminCategories.jsx, AdminBulkUpload.jsx
      AdminInventory.jsx, AdminSalesReport.jsx, AdminChat.jsx, AdminFinance.jsx
  api/                      — fetch wrappers (products, categories, orders, auth, finance, chat)
  hooks/                    — useCart, useAuth
  assets/                   — logo.jsx
server/
  server.js                 — Express entry (runs seed on start)
  db.js                     — SQLite init + schema + migrations
  seed.js                   — Category + product seed data
  routes/                   — products, categories, auth, orders, chat, finance
  middleware/auth.js         — requireAdmin JWT middleware
  lib/
    contextBuilder.js        — PII-sanitized DB snapshot for AI
    systemPrompt.js          — AI system prompt builder
  uploads/                   — Supplier invoice files
```

---

## Database Schema (SQLite)

| Table | Notable columns |
|---|---|
| `categories` | `slug` (unique), `subcategories` (JSON TEXT) |
| `products` | `category`/`subcategory` (slugs), `specs`/`detailedSpecs` (JSON TEXT), `stock_quantity`, `inStock`, `featured` |
| `orders` | `orderNumber` (unique), customer fields, `status`, `isRead` |
| `order_items` | Denormalized product snapshot at purchase time |
| `suppliers` | Contact info |
| `transactions` | `type` = `'invoice'`\|`'payment'`, optional `filePath`/`fileName` |

`specs` and `detailedSpecs` are JSON strings — always `JSON.stringify` on write, `JSON.parse` on read.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Enables admin AI chat |
| `JWT_SECRET` | Signs admin auth tokens |
| `ADMIN_PASSWORD` | Password for `/admin/login` |
| `PORT` | Server port (default `3001`) |
| `DB_PATH` | SQLite file path (default `server/phonestop.db`) |
| `FORCE_RESEED` | Set `true` to clear and re-seed on next start |
| `ALLOWED_ORIGIN` | CORS origin (default `*`) |

---

## Deployment

- **Frontend → Vercel**: `vercel.json` rewrites `/api/*` to Railway backend URL
- **Backend → Railway**: `railway.toml` / `nixpacks.toml`, starts with `node server/server.js`
- **Local dev**: Vite proxies `/api/*` to `http://localhost:3001` (see `vite.config.js`)

---

## i18n & RTL Architecture (added 2026-02-28)

### Packages
- `react-i18next` + `i18next` — installed as runtime dependencies

### Setup
- `src/i18n/index.js` — initializes i18next with `en` (default) and `he` languages, `localStorage` key `phonestop_lang`
- `src/i18n/locales/en.json` — English strings
- `src/i18n/locales/he.json` — Hebrew strings

### LanguageContext (`src/context/LanguageContext.jsx`)
- Reads/writes `phonestop_lang` in `localStorage`
- On language change, sets `document.documentElement.lang` and `document.documentElement.dir` (`rtl` for Hebrew, `ltr` for English)
- Also updates the `i18next` language
- Exposes `{ lang, setLang, isRTL }` via `useLanguage()` hook

### Translation namespaces (flat JSON keys)
All strings live in `src/i18n/locales/{lang}.json` under namespace groups:
`nav`, `hero`, `categories`, `featured`, `footer`, `category`, `product`, `checkout`, `admin`, `login`, `language`

### RTL Layout
- Hebrew sets `dir="rtl"` on `<html>`
- Tailwind `rtl:` variant classes handle directional flips in Navbar (mobile drawer flips from right → left) and AdminLayout (sidebar + main content flip sides)
- Logical property classes (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`) used for inline spacing
- Heebo font (Google Fonts) loaded in `index.html` — applied via `[dir=rtl]` CSS rule in `index.css`

### Language Switcher (`src/components/ui/LanguageSwitcher.jsx`)
- Appears in: Navbar (desktop right area + mobile drawer footer) and AdminLayout sidebar footer
- Toggles between `en` and `he`, persists to localStorage, updates `<html>` dir/lang instantly

---

## Key Conventions

- **Tailwind CSS v4** — Vite plugin, NOT PostCSS. No `tailwind.config.js`.
- **ESM throughout** — both server and frontend (`"type": "module"`)
- **Admin auth**: JWT in `localStorage` as `admin_token`, sent as `Authorization: Bearer <token>`
- **Category/subcategory slugs** link products to categories
- **Bulk product upload**: JSON at `/admin/products/bulk-upload` (see `samples/product-upload-template.json`)
- **Cart**: in-memory only, no persistence

---

## Pending Tasks

- [ ] Add Hebrew font loading (Heebo) to `index.html`
- [ ] Translate admin sub-pages (Dashboard stats labels, OrdersTable, Finance forms, etc.) — currently admin nav is translated but inner page content is English
- [ ] RTL polish: number formatting (price display) for Hebrew locale
- [ ] Consider adding product-level name/description translations if needed
- [ ] No automated tests exist — add if complexity grows
