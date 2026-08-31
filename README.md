# 📚 Techno World Books — E-Commerce Platform

A full-stack book e-commerce platform built for competitive exam preparation books (UPSC, SSC, Banking, Railways, etc.).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS 4 |
| **Backend** | Express.js + TypeScript (ESM) |
| **Database** | SQLite via Prisma ORM |
| **Auth** | JWT + bcrypt |
| **Icons** | Lucide React |

## Features

### 🛍️ Storefront
- **Homepage** with hero banner, flash sale, featured books, testimonials
- **Product listing** with category filters, sorting, search
- **Product detail** page with tabs (description, TOC, reviews)
- **Cart & checkout** with coupon codes, address management
- **Wishlist** with save-for-later
- **Instant search** with debounced API queries

### 🔧 Admin Panel (`/admin`)
- **Dashboard** — Real-time revenue, orders, books, users stats
- **Product Management** — Full CRUD with inline stock editing
- **Inventory Management** — Low stock alerts, batch stock updates
- **Order Management** — Status tracking (Pending → Delivered)
- **Bulk CSV Import** — Analyze → Preview → Execute workflow
- **Media Manager** — Upload, preview, delete book covers & PDFs
- **Homepage CMS** — Edit hero, flash sale, featured books, testimonials, sale banner
- **Book Preview** — Per-book cover & PDF upload modal
- **Review Moderation** — Approve/flag customer reviews

## Getting Started

```bash
# Clone
git clone https://github.com/mxsourav/techno-world-books.git
cd techno-world-books

# Backend
cd server
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev

# Frontend (new terminal)
cd app
npm install
npm run dev
```

**Admin Login:** `admin` / `admin123`

## Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

This repo includes a `render.yaml` blueprint that deploys:
- **techno-world-api** — Node.js web service (Express API)
- **techno-world-books** — Static site (React SPA)

## Project Structure

```
├── app/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # UI components (Header, Footer, BookCard, etc.)
│   │   ├── pages/        # Route pages (Home, Product, Cart, Checkout, Admin)
│   │   ├── services/     # API service layer
│   │   ├── store/        # Global state (StoreContext, AuthStore)
│   │   └── hooks/        # Custom React hooks
│   └── public/           # Static assets
├── server/               # Express backend
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # API route definitions
│   │   └── middleware/   # Auth, error handling
│   └── prisma/           # Schema + seed data
└── render.yaml           # Render deployment blueprint
```

## License

MIT
