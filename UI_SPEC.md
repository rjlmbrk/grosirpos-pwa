# UI_SPEC.md

# GrosirPOS PWA - User Interface Specification

## Design Principles

Goals:

* Cepat digunakan kasir
* Mobile friendly
* Minimal klik
* Mudah dipelajari

Style:

* Clean
* Modern
* Minimalist

---

# Layout Structure

Desktop:

* Sidebar
* Top Navbar
* Main Content

Mobile:

* Top Navbar
* Bottom Navigation

---

# Color Palette

Primary:
Blue

Success:
Green

Danger:
Red

Warning:
Orange

Background:
Light Gray

Cards:
White

---

# Login Page

Route:

/login

Components:

* Logo
* Username Input
* Password Input
* Login Button

Layout:

Centered Card

Fields:

Username

Password

Button:

Masuk

---

# Dashboard

Route:

/dashboard

Cards:

* Total Produk
* Transaksi Hari Ini
* Omzet Hari Ini

Quick Actions:

* Kasir
* Produk
* Laporan

---

# Product List

Route:

/products

Header:

Produk

Actions:

Tambah Produk

Components:

Search Input

Table:

| Barcode |
| Nama |
| Kategori |
| Status |
| Action |

Actions:

* Edit
* Hapus

Pagination:

Bottom Table

---

# Create Product

Route:

/products/new

Fields:

Barcode

Nama Barang

Kategori

Status Aktif

Section:

Satuan dan Harga

Example:

pcs - 3000

renceng - 28000

dus - 1050000

Buttons:

Tambah Satuan

Simpan

Batal

---

# Edit Product

Route:

/products/[id]

Same layout as Create Product.

---

# Cashier Page

Route:

/cashier

Most Important Page

Desktop Layout:

Left 40%

Product Search

Right 60%

Cart

---

# Product Search Area

Top Section

Input:

Cari Produk atau Barcode

Realtime Search

Results:

Card List

Each Card:

Nama Barang

Kategori

Available Units

Button:

Tambah

---

# Add To Cart Dialog

Fields:

Produk

Satuan

Qty

Harga

Subtotal

Buttons:

Tambah

Batal

---

# Cart Section

Display:

Nama Produk

Satuan

Qty

Harga

Subtotal

Actions:

Edit Qty

Delete Item

---

# Summary Section

Show:

Total Item

Grand Total

Layout:

Sticky Bottom

---

# Checkout Button

Large Button

Label:

Bayar

Color:

Green

---

# Payment Dialog

Fields:

Total

Bayar

Kembalian

Calculation:

Realtime

Buttons:

Proses Pembayaran

Batal

---

# Success Dialog

Display:

Transaksi Berhasil

Show:

Nomor Transaksi

Total

Kembalian

Buttons:

Transaksi Baru

Lihat Riwayat

---

# Transaction List

Route:

/transactions

Filters:

Search

Date Range

Table:

| Nomor |
| Tanggal |
| Kasir |
| Total |
| Action |

Action:

Detail

---

# Transaction Detail

Route:

/transactions/[id]

Header:

Nomor Transaksi

Tanggal

Kasir

Table:

| Produk |
| Satuan |
| Qty |
| Harga |
| Subtotal |

Summary:

Total

Bayar

Kembalian

---

# Reports Page

Route:

/reports

Filters:

Tanggal Awal

Tanggal Akhir

Cards:

Jumlah Transaksi

Omzet

Optional:

Produk Terlaris

---

# Empty States

Products:

Belum ada produk.

Transactions:

Belum ada transaksi.

Reports:

Tidak ada data.

---

# Loading States

Use:

Skeleton Components

Pages:

* products
* cashier
* transactions
* reports

---

# Responsive Rules

Desktop:

> = 1024px

Tablet:
768px - 1023px

Mobile:
<= 767px

Cashier Page Mobile:

Search
↓
Cart
↓
Checkout

Single column layout.

---

# Accessibility

Required:

* Keyboard navigation
* Form labels
* Focus states

Buttons must remain usable on mobile devices.

---

# MVP UI Pages

/login

/dashboard

/products

/products/new

/products/[id]

/cashier

/transactions

/transactions/[id]

/reports

No additional pages should be created during MVP development unless explicitly requested.
