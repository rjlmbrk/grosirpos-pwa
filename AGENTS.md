# AGENTS.md

# GrosirPOS PWA - AI Development Rules

## Project Overview

Project Name:
GrosirPOS PWA

Project Type:
Progressive Web Application (PWA)

Purpose:
Point of Sale (POS) untuk toko grosir dengan dukungan multi satuan dan multi harga.

Current Scope:
MVP Only

---

# Tech Stack

Frontend:

* Next.js 15 App Router
* TypeScript
* Tailwind CSS
* shadcn/ui

Backend:

* Next.js Server Actions
* Route Handlers

Database:

* MySQL (XAMPP)

ORM:

* Prisma ORM

Authentication:

* JWT
* HttpOnly Cookies

Validation:

* Zod
* React Hook Form

PWA:

* next-pwa

---

# Architecture Rules

Always use:

App Router

Example:

app/
dashboard/
products/
cashier/

Never use:

pages/

---

Use Server Components by default.

Only use Client Components when:

* form interaction required
* state required
* browser APIs required

---

# Database Rules

Database:

MySQL

Connection:

DATABASE_URL="mysql://root:@localhost:3306/grosirpos"

Never use:

* PostgreSQL
* SQLite
* MongoDB

Always use Prisma.

Never write raw SQL unless absolutely necessary.

---

# Prisma Rules

Use:

lib/prisma.ts

Singleton pattern.

Never instantiate PrismaClient repeatedly.

Example:

const prisma = globalThis.prisma ?? new PrismaClient()

---

# Authentication Rules

Use:

JWT

Store token in:

HttpOnly Cookie

Protect routes using:

middleware.ts

Never use:

* NextAuth
* Clerk
* Firebase Auth

---

# Form Rules

Always use:

React Hook Form

Validation:

Zod

Pattern:

zod schema
→ form
→ server action

Never use uncontrolled forms.

---

# API Rules

Prefer:

Server Actions

Use Route Handlers only when:

* API endpoint required
* external integrations needed

Never create unnecessary REST endpoints.

---

# UI Rules

Use:

shadcn/ui components

Preferred Components:

* Card
* Button
* Input
* Dialog
* Sheet
* Table
* Dropdown Menu
* Form

Avoid creating custom components if shadcn/ui already provides one.

---

# Styling Rules

Use:

Tailwind CSS

Never use:

* Bootstrap
* Material UI
* Ant Design

Prefer:

* flex
* grid
* gap

Avoid excessive custom CSS.

---

# Table Rules

For data tables:

Use:

* search
* pagination
* loading state
* empty state

Required Pages:

* products
* transactions

---

# Error Handling Rules

Every async action must:

* use try/catch
* return meaningful errors

Never expose stack traces to users.

---

# Loading State Rules

Every page must include:

* loading state
* empty state
* error state

Never leave blank screens.

---

# Security Rules

Always:

* hash passwords using bcrypt
* validate inputs using Zod
* sanitize user inputs

Never:

* store plain passwords
* trust client input

---

# PWA Rules

Required:

* manifest.json
* service worker
* install prompt

Must work on:

* Desktop Chrome
* Android Chrome

---

# Folder Structure

app/
components/
lib/
actions/
schemas/
hooks/
prisma/
public/

Never create unnecessary folders.

---

# Naming Convention

Components:

PascalCase

Example:

ProductForm.tsx

Functions:

camelCase

Example:

createTransaction()

Database Models:

PascalCase

Example:

ProductUnit

Variables:

camelCase

---

# MVP Features

Must Implement:

* Login
* Logout
* Product Management
* Product Units
* Cashier
* Checkout
* Transaction History
* Reports
* PWA

Do Not Implement:

* Inventory
* Supplier
* Purchase
* Warehouse
* Accounting
* Multi Branch

Unless explicitly requested.

---

# Coding Principles

Prefer:

* reusable components
* clean code
* type safety
* server-first architecture

Always optimize for:

* simplicity
* maintainability
* readability

Do not over-engineer.
