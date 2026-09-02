# 📚 Techno World Books — Enterprise E-Commerce Platform

> **A modern, full-stack, enterprise-grade book e-commerce and logistics management platform built for academic, university, and competitive examination publications (UPSC, SSC, Banking, Railways, Engineering, Medical, & State Boards).**

---

## 📑 Table of Contents
- [1. System Architecture & Data Flow](#1-system-architecture--data-flow)
- [2. Tech Stack](#2-tech-stack)
- [3. Core Features & What Works](#3-core-features--what-works)
- [4. Database Architecture & Schema](#4-database-architecture--schema)
- [5. Migrating to Supabase / Cloud PostgreSQL](#5-migrating-to-supabase--cloud-postgresql)
- [6. Developer Quickstart](#6-developer-quickstart)
- [7. Default Test Credentials](#7-default-test-credentials)
- [8. API Endpoints & Swagger Docs](#8-api-endpoints--swagger-docs)
- [9. Directory Map & Codebase Guide](#9-directory-map--codebase-guide)

---

## 1. System Architecture & Data Flow

```
                                 [ BROWSER CLIENTS ]
                                   │            ▲
                 (Customer Portal) │            │ (Admin Management Hub)
                                   ▼            │
                ┌──────────────────────────────────────────────┐
                │        React 19 + Vite Frontend SPA          │
                │        (Tailwind CSS 4 + Lucide Icons)       │
                │             http://localhost:3000            │
                └──────────────────────┬───────────────────────┘
                                       │
                        (RESTful JSON API via Axios)
                                       ▼
                ┌──────────────────────────────────────────────┐
                │          Node.js Express Backend API         │
                │         (TypeScript ESM, Port 5000)          │
                ├──────────────────────────────────────────────┤
                │  🛡️ Auth Middleware (JWT Dual-Token Cookies)  │
                │  🔒 Argon2 Password Hashing & Zod Validator  │
                │  🚚 India Post Speed Post Dynamic Pricing   │
                │  🎁 Techno Coins (1% Loyalty Points Ledger)  │
                │  📬 Resilient Email Dispatcher & Outbox Log  │
                └──────────────────────┬───────────────────────┘
                                       │
                       (Prisma ORM Database Client)
                                       ▼
                ┌──────────────────────────────────────────────┐
                │         SQL Database (server/prisma/)        │
                │   • Local Dev: SQLite (server/prisma/dev.db) │
                │   • Cloud Prod: Supabase / PostgreSQL        │
                └──────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, Zustand, Sonner, Lucide React |
| **Backend** | Node.js, Express.js (ESM), TypeScript, tsx, Swagger UI / OpenAPI 3.0 |
| **Database & ORM** | Prisma ORM, SQLite (`server/prisma/dev.db`) / PostgreSQL (Supabase-ready) |
| **Security & Auth**| Argon2, Dual-Token JWT (`httpOnly` Access & Refresh cookies), CSRF/CORS Protection |
| **Logistics & Post** | India Post CEPT Speed Post Integration (Zone & Weight rate matrix, Daily 4 PM batch timetable) |
| **Email & Outbox** | Nodemailer SMTP + Database-backed Outbox Mailbox (`EmailLog`) + Live HTML Renderer |

---

## 3. Core Features & What Works

### 🛍️ Storefront & Customer Experience
- **Dynamic Catalog & Filtering**: Instant search by Title, Author, ISBN, Subject, Publisher (*"Techno World Publications"*), Language, Edition, and Price Range.
- **Interactive Book Details**: Complete metadata, author info, MRP vs Selling Price savings, and **India Post 4:00 PM Daily Batch Dispatch countdown timer**.
- **Pincode-Driven Speed Post Calculation**: Delivery charge is dynamically computed only when the user inputs a valid 6-digit PIN:
  - **Local Kolkata (`700001`–`700160`)**: ₹30
  - **West Bengal (`71xxxx`–`74xxxx`)**: ₹45
  - **Rest of India (National)**: ₹65
  - **Orders $\ge$ ₹999**: **FREE Delivery**
- **Address Deduplication**: Enforces strict user address deduplication to prevent duplicate records.
- **My Orders & History (`/profile?tab=orders`)**: Complete purchase history with order tracking, status badges, and India Post consignment tracking badges.
- **Customer In-App Notifications (`/profile?tab=notifications`)**: Real-time notices for Order Confirmation, Publisher Delay Notices, and Delivery updates.
- **Techno Points Loyalty Engine**:
  - **1 Point = ₹1.00** on future purchases.
  - Automatically awards 1 point per ₹100 spent inside an atomic Prisma `$transaction`.
  - Points have a 1-year expiry from credit date and automatically roll back if an order is cancelled.

---

### 🛡️ Admin Management Portal (`/admin/dashboard`)
- **Action Required Decision Center**: Urgent alerts for pending orders with exact timestamps.
- **Order Decision Hub**:
  - **Accept Order**: Automatically confirms order and sends an in-app confirmation notification to the customer.
  - **Slight Delay Notice**: Dispatches a custom delay explanation to the customer email & in-app alerts if stock is pending from the publisher.
  - **Reject / Cancel Order**: Cancels the order with a recorded audit reason, revokes loyalty points, and dispatches refund alerts.
  - **India Post Dispatch**: Assigns Speed Post tracking numbers to orders.
- **📬 Sent Emails & Live Outbox Center (`/admin/dashboard?tab=settings`)**:
  - Automatically logs every outbound email into the database (`EmailLog`).
  - **1-Click "👁️ View HTML" Modal**: View the exact branded customer email rendered in the browser.
  - Gracefully handles local ISP port 587/465 blocks so testing never fails.
- **Dynamic SMTP & Admin Profile Settings**: Full UI configuration of outbound sender credentials saved in `SystemSetting`.
- **Bulk CSV / Excel Book Import**: Validate, preview, and ingest large book catalogs in batch.
- **Inventory Workspace**: Low stock monitoring and quick inline stock editing.

---

## 4. Database Architecture & Schema

The database is managed by **Prisma ORM** with the schema located at [`server/prisma/schema.prisma`](server/prisma/schema.prisma).

### Database Model Reference

| Model / Table | Purpose & Description |
| :--- | :--- |
| `User` | Customer and Admin accounts, roles (`ADMIN`, `CUSTOMER`), Argon2 hash, Techno Coins balance. |
| `Book` | Book catalog: title, authors, publisher, ISBN, MRP, selling price, stock, edition, cover URL. |
| `Category` / `BookCategory` | Hierarchical book classification (Engineering, Medical, Competitive Exams). |
| `Order` | Customer orders, payment status, subtotal, shipping charge, total, India Post tracking ID, notes. |
| `OrderItem` | Line items for each order with quantity and historical purchase price. |
| `Address` | Deduplicated delivery addresses with recipient name, phone, full address, and PIN code. |
| `Notification` | In-app alerts for customers (Order Confirmed, Slight Delay Notice, Dispatched, Cancelled). |
| `EmailLog` | Outbox table storing all dispatched HTML emails, recipients, subjects, and statuses. |
| `PointTransaction` | Credit/Debit audit ledger for Techno Coins with 1-year expiry date. |
| `SystemSetting` | Dynamic key-value store for Admin Settings (e.g. `SMTP_CONFIG`). |
| `Promotion`, `Review`, `AuditLog` | Discount coupons, customer ratings/reviews, and security audit logs. |

### Visual Database GUI (Prisma Studio)
To inspect or edit database tables visually, run:
```bash
cd server
npx prisma studio
```
Opens interactive GUI at **http://localhost:5555**.

---

## 5. Migrating to Supabase / Cloud PostgreSQL

To connect to **Supabase** or any cloud PostgreSQL instance:

1. In [`server/prisma/schema.prisma`](server/prisma/schema.prisma), change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `DATABASE_URL` in `server/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```
3. Push schema to Supabase:
   ```bash
   cd server
   npx prisma db push
   ```

---

## 6. Developer Quickstart

### Prerequisites
- **Node.js**: v18+ or v20+
- **npm**: v9+

### Installation & Launch

#### Terminal 1 — Backend API
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```
> Server running on: **http://localhost:5000**  
> Swagger Documentation: **http://localhost:5000/docs**

#### Terminal 2 — Frontend App
```bash
cd app
npm install
npm run dev -- --host
```
> App running on: **http://localhost:3000**

---

## 7. Default Test Credentials

| Account | Email / Identifier | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@technoworld.com` | `admin123` | Full Admin Dashboard (`/admin/dashboard`) |
| **Customer** | Sign in with **"Continue with Google (Dev Bypass)"** or register any email | Any standard password | Customer Storefront & Profile (`/profile`) |

---

## 8. API Endpoints & Swagger Docs

Interactive Swagger UI available at: [**http://localhost:5000/docs**](http://localhost:5000/docs)

### Primary API Groups
- **Auth**: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `POST /api/v1/auth/google/dev-bypass`, `POST /api/v1/auth/logout`
- **Books**: `GET /api/v1/books`, `GET /api/v1/books/:id`, `POST /api/v1/books`, `PUT /api/v1/books/:id`, `DELETE /api/v1/books/:id`
- **Orders**: `POST /api/v1/orders`, `GET /api/v1/orders/my-orders`, `GET /api/v1/orders/admin/all`, `PATCH /api/v1/orders/admin/:id/status`, `POST /api/v1/orders/admin/:id/email`
- **Pricing & Shipping**: `POST /api/v1/pricing/calculate` (Accepts `items`, `pincode`, `addressId`)
- **Customer Profile**: `GET /api/v1/profile`, `PATCH /api/v1/profile`, `GET /api/v1/profile/orders`, `GET /api/v1/profile/notifications`, `PATCH /api/v1/profile/notifications/:id/read`
- **Admin Settings & Outbox**: `GET /api/v1/admin/settings`, `PUT /api/v1/admin/settings`, `POST /api/v1/admin/smtp/test`, `GET /api/v1/admin/emails`

---

## 9. Directory Map & Codebase Guide

```
techno-world-books/
├── app/                              # Frontend Application (React 19 + Vite)
│   ├── src/
│   │   ├── components/               # Header, Footer, BookCard, AdminLayout, etc.
│   │   ├── pages/                    # Home, Product, Catalog, Checkout, Profile
│   │   │   └── admin/Dashboard.tsx   # Admin Hub (Orders, Outbox, CMS, Catalog)
│   │   ├── services/api.ts           # Centralized Axios API service layer
│   │   ├── store/                    # AuthStore and Global Store Context
│   │   └── types/                    # TypeScript data definitions
│   └── package.json
│
├── server/                           # Backend Application (Node.js Express + TypeScript)
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema (Models, relations, indexes)
│   │   ├── dev.db                    # Local SQLite Database
│   │   └── seed.ts                   # Initial database seeder
│   ├── src/
│   │   ├── controllers/              # admin, auth, book, order, pricing, profile
│   │   ├── services/                 # email.service, pricing.service, admin.service
│   │   ├── middlewares/              # auth.middleware, validate.middleware
│   │   ├── routes/v1/                # Route definitions (/auth, /books, /orders, /admin)
│   │   ├── schemas/                  # Zod request validation schemas
│   │   └── server.ts                 # Express app initialization
│   └── package.json
│
└── README.md                         # Project documentation
```

---

## 📄 License

Proprietary — Developed for **Techno World Books Kolkata**. All rights reserved.
