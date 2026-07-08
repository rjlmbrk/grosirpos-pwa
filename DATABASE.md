# DATABASE.md

# GrosirPOS PWA - Database Specification

## Database Engine

MySQL 8.x

## Local Development

Database dijalankan menggunakan XAMPP.

Default Configuration:

Host:
localhost

Port:
3306

Database:
grosirpos

Username:
root

Password:
(kosong)

Connection String:

DATABASE_URL="mysql://root:@localhost:3306/grosirpos"

---

# Database Design Principles

* Menggunakan MySQL
* Primary key menggunakan BIGINT AUTO_INCREMENT
* Soft delete tidak digunakan pada MVP
* Timestamp menggunakan DATETIME
* Semua relasi menggunakan foreign key

---

# Entity Relationship Diagram

Users
│
├── Transactions
│
Transactions
│
└── TransactionItems
│
Products
│
└── ProductUnits

Products
│
└── TransactionItems

ProductUnits
│
└── TransactionItems

---

# Table: users

Purpose:

Menyimpan data pengguna aplikasi.

Fields:

id BIGINT AUTO_INCREMENT PRIMARY KEY

nama VARCHAR(100)

username VARCHAR(50) UNIQUE

password VARCHAR(255)

role ENUM('admin','kasir')

created_at DATETIME

updated_at DATETIME

---

# Table: products

Purpose:

Menyimpan data barang.

Fields:

id BIGINT AUTO_INCREMENT PRIMARY KEY

barcode VARCHAR(100)

nama_barang VARCHAR(150)

kategori VARCHAR(100)

is_active BOOLEAN DEFAULT TRUE

created_at DATETIME

updated_at DATETIME

Indexes:

INDEX idx_product_name (nama_barang)

INDEX idx_product_barcode (barcode)

---

# Table: product_units

Purpose:

Menyimpan satuan dan harga jual produk.

Contoh:

Mie Sedaap

* pcs
* renceng
* dus

Fields:

id BIGINT AUTO_INCREMENT PRIMARY KEY

product_id BIGINT

nama_satuan VARCHAR(50)

harga_jual DECIMAL(15,2)

created_at DATETIME

updated_at DATETIME

Foreign Keys:

product_id → products.id

Relationship:

1 Product
→ Many Product Units

---

# Table: transactions

Purpose:

Header transaksi penjualan.

Fields:

id BIGINT AUTO_INCREMENT PRIMARY KEY

nomor_transaksi VARCHAR(30)

tanggal DATETIME

total DECIMAL(15,2)

bayar DECIMAL(15,2)

kembalian DECIMAL(15,2)

user_id BIGINT

created_at DATETIME

Indexes:

INDEX idx_transaction_number (nomor_transaksi)

INDEX idx_transaction_date (tanggal)

Foreign Keys:

user_id → users.id

---

# Table: transaction_items

Purpose:

Detail item yang dijual.

Fields:

id BIGINT AUTO_INCREMENT PRIMARY KEY

transaction_id BIGINT

product_id BIGINT

product_unit_id BIGINT

qty DECIMAL(10,2)

harga DECIMAL(15,2)

subtotal DECIMAL(15,2)

Foreign Keys:

transaction_id → transactions.id

product_id → products.id

product_unit_id → product_units.id

---

# Prisma Schema Rules

Use:

@db.VarChar()
@db.Decimal(15,2)

Primary Key:

@id
@default(autoincrement())

Dates:

@default(now())

Example:

createdAt DateTime @default(now())

---

# Seed Data

## Admin

Nama:
Administrator

Username:
admin

Password:
admin123

Role:
admin

Password harus di-hash menggunakan bcrypt.

---

# Sample Product 1

Barcode:
899000001

Nama:
Mie Sedaap Goreng

Kategori:
Makanan

Units:

pcs = 3000

renceng = 28000

dus = 1050000

---

# Sample Product 2

Barcode:
899000002

Nama:
Gula Pasir

Kategori:
Sembako

Units:

1/4 kg = 4500

1/2 kg = 9000

1 kg = 18000

---

# Transaction Number Format

Format:

TRX-YYYYMMDD-XXXX

Examples:

TRX-20260614-0001

TRX-20260614-0002

TRX-20260614-0003

Counter akan reset setiap hari.

---

# Query Performance Requirements

Product Search:

Target:
< 500ms

Search Fields:

* barcode
* nama_barang

Transaction List:

Default Order:

tanggal DESC

Pagination:

20 records per page

---

# Backup Strategy

Development:

Menggunakan export database melalui phpMyAdmin.

Production:

Menggunakan mysqldump harian.

Backup File Format:

.sql
