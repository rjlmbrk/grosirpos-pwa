"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/schemas";
import { getSession } from "@/lib/auth";

function incrementLetter(str: string): string {
  let num = 0;
  for (const char of str) {
    num = num * 26 + (char.charCodeAt(0) - 64);
  }
  num++;
  let result = "";
  while (num > 0) {
    num--;
    result = String.fromCharCode((num % 26) + 65) + result;
    num = Math.floor(num / 26);
  }
  return result;
}

export async function generateKodeBarang() {
  const session = await getSession();
  if (!session) return "";

  const lastProduct = await prisma.$queryRawUnsafe<{ kode_barang: string }[]>(
    `SELECT kode_barang FROM products
     WHERE kode_barang REGEXP '^[A-Z]+-[0-9]{2}$'
     ORDER BY LENGTH(kode_barang) DESC, kode_barang DESC
     LIMIT 1`,
  );

  if (!lastProduct || lastProduct.length === 0) return "A-01";

  const match = lastProduct[0].kode_barang.match(/^([A-Z]+)-(\d{2})$/);
  if (!match) return "A-01";

  const letter = match[1];
  const num = parseInt(match[2], 10);

  if (num < 99) {
    return `${letter}-${String(num + 1).padStart(2, "0")}`;
  }

  const nextLetter = incrementLetter(letter);
  return `${nextLetter}-01`;
}

export async function getProducts(search?: string, page = 1) {
  const session = await getSession();
  if (!session) redirect("/login");

  const take = 20;
  const skip = (page - 1) * take;

  if (search) {
    const productRows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT p.*,
        JSON_ARRAYAGG(
          JSON_OBJECT('id', pu.id, 'nama_satuan', pu.nama_satuan, 'harga_jual', pu.harga_jual)
        ) as units
      FROM products p
      LEFT JOIN product_units pu ON pu.product_id = p.id
      WHERE MATCH(p.nama_barang) AGAINST(? IN BOOLEAN MODE)
        OR p.kode_barang LIKE ?
      GROUP BY p.id
      ORDER BY p.kode_barang ASC
      LIMIT ? OFFSET ?`,
      `${search}*`,
      `%${search}%`,
      take,
      skip,
    );

    const countResult = await prisma.$queryRawUnsafe<[{ total: bigint }]>(
      `SELECT COUNT(*) as total FROM products p
      WHERE MATCH(p.nama_barang) AGAINST(? IN BOOLEAN MODE)
        OR p.kode_barang LIKE ?`,
      `${search}*`,
      `%${search}%`,
    );

    return {
      products: productRows.map((p: any) => ({
        ...p,
        id: Number(p.id),
        isActive: Boolean(p.isActive),
        units: typeof p.units === "string" ? JSON.parse(p.units) : p.units.map((u: any) => ({
          id: Number(u.id),
          namaSatuan: u.nama_satuan,
          hargaJual: Number(u.harga_jual),
        })),
      })),
      total: Number(countResult[0].total),
      pages: Math.ceil(Number(countResult[0].total) / take),
    };
  }

  const [allProducts, count] = await Promise.all([
    prisma.product.findMany({
      skip,
      take,
      include: { units: true },
      orderBy: { kodeBarang: "asc" },
    }),
    prisma.product.count(),
  ]);

  return {
    products: allProducts.map((p) => ({
      ...p,
      id: Number(p.id),
      isActive: p.isActive,
      units: p.units.map((u) => ({
        id: Number(u.id),
        namaSatuan: u.namaSatuan,
        hargaJual: Number(u.hargaJual),
      })),
    })),
    total: count,
    pages: Math.ceil(count / take),
  };
}

export async function getProduct(id: number) {
  const session = await getSession();
  if (!session) redirect("/login");

  const product = await prisma.product.findUnique({
    where: { id },
    include: { units: true },
  });

  if (!product) return null;

  return {
    ...product,
    id: Number(product.id),
    isActive: product.isActive,
    units: product.units.map((u) => ({
      id: Number(u.id),
      productId: Number(u.productId),
      namaSatuan: u.namaSatuan,
      hargaJual: Number(u.hargaJual),
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })),
  };
}

export async function createProduct(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const rawUnits = [];
  let i = 0;
  while (formData.get(`units[${i}][namaSatuan]`)) {
    rawUnits.push({
      namaSatuan: formData.get(`units[${i}][namaSatuan]`) as string,
      hargaJual: formData.get(`units[${i}][hargaJual]`) as string,
    });
    i++;
  }

  const raw = {
    kodeBarang: formData.get("kodeBarang") as string,
    namaBarang: formData.get("namaBarang") as string,
    kategori: formData.get("kategori") as string,
    isActive: formData.get("isActive") === "true",
    units: rawUnits,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data produk tidak valid", errors: parsed.error.flatten() };
  }

  try {
    await prisma.product.create({
      data: {
        kodeBarang: parsed.data.kodeBarang,
        namaBarang: parsed.data.namaBarang,
        kategori: parsed.data.kategori,
        isActive: parsed.data.isActive,
        units: {
          create: parsed.data.units.map((u) => ({
            namaSatuan: u.namaSatuan,
            hargaJual: u.hargaJual,
          })),
        },
      },
    });
  } catch {
    return { error: "Gagal menyimpan produk" };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(
  id: number,
  _prevState: unknown,
  formData: FormData,
) {
  const session = await getSession();
  if (!session) redirect("/login");

  const rawUnits = [];
  let i = 0;
  while (formData.get(`units[${i}][namaSatuan]`)) {
    rawUnits.push({
      namaSatuan: formData.get(`units[${i}][namaSatuan]`) as string,
      hargaJual: formData.get(`units[${i}][hargaJual]`) as string,
    });
    i++;
  }

  const raw = {
    kodeBarang: formData.get("kodeBarang") as string,
    namaBarang: formData.get("namaBarang") as string,
    kategori: formData.get("kategori") as string,
    isActive: formData.get("isActive") === "true",
    units: rawUnits,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data produk tidak valid", errors: parsed.error.flatten() };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.productUnit.deleteMany({ where: { productId: id } });

      await tx.product.update({
        where: { id },
        data: {
          kodeBarang: parsed.data.kodeBarang,
          namaBarang: parsed.data.namaBarang,
          kategori: parsed.data.kategori,
          isActive: parsed.data.isActive,
          units: {
            create: parsed.data.units.map((u) => ({
              namaSatuan: u.namaSatuan,
              hargaJual: u.hargaJual,
            })),
          },
        },
      });
    });
  } catch {
    return { error: "Gagal memperbarui produk" };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function searchProducts(search?: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!search || search.length < 1) {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { units: true },
      take: 20,
      orderBy: { kodeBarang: "asc" },
    });
    return products.map((p) => ({
      id: Number(p.id),
      kodeBarang: p.kodeBarang,
      namaBarang: p.namaBarang,
      kategori: p.kategori,
      units: p.units.map((u) => ({
        id: Number(u.id),
        namaSatuan: u.namaSatuan,
        hargaJual: Number(u.hargaJual),
      })),
    }));
  }

  const productRows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT p.*,
      JSON_ARRAYAGG(
        JSON_OBJECT('id', pu.id, 'nama_satuan', pu.nama_satuan, 'harga_jual', pu.harga_jual)
      ) as units
    FROM products p
    LEFT JOIN product_units pu ON pu.product_id = p.id
    WHERE p.is_active = true
      AND (MATCH(p.nama_barang) AGAINST(? IN BOOLEAN MODE)
        OR p.kode_barang LIKE ?)
    GROUP BY p.id
    ORDER BY p.kode_barang ASC
    LIMIT 20`,
    `${search}*`,
    `%${search}%`,
  );

  return productRows.map((p: any) => ({
    id: Number(p.id),
    kodeBarang: p.kode_barang,
    namaBarang: p.nama_barang,
    kategori: p.kategori,
    units: typeof p.units === "string" ? JSON.parse(p.units) : p.units.map((u: any) => ({
      id: Number(u.id),
      namaSatuan: u.nama_satuan,
      hargaJual: Number(u.harga_jual),
    })),
  }));
}

export async function deleteProduct(id: number) {
  const session = await getSession();
  if (!session) redirect("/login");

  try {
    await prisma.productUnit.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
  } catch {
    return { error: "Gagal menghapus produk" };
  }

  revalidatePath("/products");
}
