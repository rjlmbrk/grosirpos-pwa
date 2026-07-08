import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
});

export const productSchema = z.object({
  kodeBarang: z.string().min(1, "Kode barang harus diisi"),
  namaBarang: z.string().min(1, "Nama barang harus diisi"),
  kategori: z.string().min(1, "Kategori harus diisi"),
  isActive: z.boolean().default(true),
  units: z
    .array(
      z.object({
        namaSatuan: z.string().min(1, "Nama satuan harus diisi"),
        hargaJual: z.coerce.number().min(0, "Harga harus lebih dari 0"),
      }),
    )
    .min(1, "Minimal satu satuan"),
});

export const userSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().optional(),
  role: z.enum(["admin", "kasir"]),
});

export const transactionSchema = z.object({
  bayar: z.coerce.number().min(0, "Pembayaran harus valid"),
  items: z
    .array(
      z.object({
        productId: z.number(),
        productUnitId: z.number(),
        qty: z.coerce.number().min(0.01, "Qty minimal 0.01"),
        harga: z.coerce.number().min(0),
        subtotal: z.coerce.number().min(0),
      }),
    )
    .min(1, "Minimal satu item"),
});
