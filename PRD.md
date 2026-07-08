# Perubahan pada PRD.md

## Technology Stack

Ganti bagian:

Frontend:

* Next.js 15
* TypeScript
* Tailwind CSS

Backend:

* Next.js Server Actions
* Next.js Route Handlers

Database:

* MySQL (XAMPP)

ORM:

* Prisma

Authentication:

* JWT + HttpOnly Cookie

Validation:

* Zod
* React Hook Form

UI Components:

* shadcn/ui

PWA:

* next-pwa

Development Environment:

* Windows
* XAMPP
* phpMyAdmin

---

## Local Development Requirements

Developer environment:

* Node.js 22 LTS
* XAMPP 8.x
* MySQL 8.x
* phpMyAdmin
* Visual Studio Code

Database Name:

grosirpos

Database Connection:

DATABASE_URL="mysql://root:@localhost:3306/grosirpos"

---

## Architecture

Client
↓
Next.js App Router
↓
Server Actions
↓
Prisma ORM
↓
MySQL (XAMPP)

---

## MVP Constraints

Untuk versi MVP:

* Single Store
* Single Database
* Localhost Deployment
* Tidak memerlukan Docker
* Tidak memerlukan Redis
* Tidak memerlukan Message Queue
* Tidak memerlukan Cloud Services

Target deployment awal:

http://localhost:3000

---

## Authentication Strategy

Gunakan:

* JWT
* HttpOnly Cookie
* Middleware Route Protection

Jangan menggunakan:

* NextAuth
* Clerk
* Auth0

karena MVP ditujukan untuk deployment lokal dan sederhana.

---

## Reporting Requirements

Laporan hanya menggunakan query database langsung.

Tidak menggunakan:

* BI Tools
* Data Warehouse
* Analytics Service

Output:

* Jumlah transaksi
* Omzet
* Produk terlaris (opsional)
