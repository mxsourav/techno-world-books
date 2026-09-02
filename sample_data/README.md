# 📊 Sample Catalog & Excel Import Files

This directory contains reference and import-ready Excel (`.xlsx`) and CSV (`.csv`) sample datasets for the **Techno World Books** e-commerce catalog.

---

## 📁 Files Included

| File Name | Format | Rows | Description |
| :--- | :--- | :--- | :--- |
| [`demo_1000_books.xlsx`](demo_1000_books.xlsx) | Excel (`.xlsx`) | ~1,000 | Comprehensive catalog of academic & competitive exam books (UPSC, WBJEE, Engineering, Medical, GATE, SSC). |
| [`demo_books.xlsx`](demo_books.xlsx) | Excel (`.xlsx`) | ~100 | Starter sample catalog with full taxonomy, edition metadata, and pricing. |
| [`Techno_World_Books_Import.csv`](Techno_World_Books_Import.csv) | CSV (`.csv`) | Varied | Direct CSV format import dataset for batch processing. |

---

## 📑 Required & Supported Schema Columns

When creating custom Excel / CSV import sheets, ensure the following column headers are present:

| Column Header | Type | Required? | Description & Example |
| :--- | :--- | :--- | :--- |
| `title` | Text | **Yes** | Full book title (e.g. *"Advanced Engineering Mathematics"*) |
| `authors` | Text | **Yes** | Comma-separated authors (e.g. *"Erwin Kreyszig"*) |
| `publisher` | Text | **Yes** | Publisher name (e.g. *"Techno World Publications"*, *"Wiley"*) |
| `subject` | Text | Optional | Academic subject (e.g. *"Mathematics"*, *"Physics"*, *"Civil"*) |
| `bookType` | Text | Optional | Category (e.g. *"Academic"*, *"Competitive"*, *"Textbook"*) |
| `language` | Text | Optional | Language (e.g. *"English"*, *"Bengali"*, *"Hindi"*) |
| `edition` | Text | Optional | Edition badge (e.g. *"10th Edition"*, *"2026 Edition"*) |
| `isbn` | Text | Optional | Unique 10/13-digit ISBN |
| `mrp` | Number | **Yes** | Maximum Retail Price in ₹ (e.g. `999`) |
| `sellingPrice` | Number | **Yes** | Actual Selling Price in ₹ (e.g. `799`) |
| `stock` | Number | **Yes** | Available inventory stock (e.g. `50`) |
| `description` | Text | Optional | Book description, syllabus coverage, and table of contents |
| `coverUrl` | Text / URL | Optional | Image URL for book cover |

---

## 🚀 How to Ingest via Admin Dashboard

1. Navigate to: [**http://localhost:3000/admin/dashboard?tab=products**](http://localhost:3000/admin/dashboard?tab=products)
2. Click the **"📥 Bulk Import Catalog"** button in the top right.
3. Drag & drop [`demo_1000_books.xlsx`](demo_1000_books.xlsx) or [`demo_books.xlsx`](demo_books.xlsx).
4. Review the instant analysis preview (validated rows, errors, stock counts).
5. Click **"Execute Ingestion"** — all books will be batch inserted into the database!
