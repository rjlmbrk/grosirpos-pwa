"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/schemas";
import { getSession } from "@/lib/auth";

function pad(num: number, size: number) {
  return String(num).padStart(size, "0");
}

async function generateNomorTransaksi(): Promise<string> {
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1, 2) +
    pad(now.getDate(), 2);

  const lastTrx = await prisma.transaction.findFirst({
    where: {
      nomorTransaksi: {
        startsWith: `TRX-${dateStr}`,
      },
    },
    orderBy: { nomorTransaksi: "desc" },
  });

  let counter = 1;
  if (lastTrx) {
    const lastNum = parseInt(lastTrx.nomorTransaksi.slice(-4), 10);
    counter = lastNum + 1;
  }

  return `TRX-${dateStr}-${pad(counter, 4)}`;
}

export async function createTransaction(
  _prevState: unknown,
  formData: FormData,
) {
  const session = await getSession();
  if (!session) redirect("/login");

  const rawItems = [];
  let i = 0;
  while (formData.get(`items[${i}][productId]`)) {
    rawItems.push({
      productId: Number(formData.get(`items[${i}][productId]`)),
      productUnitId: Number(formData.get(`items[${i}][productUnitId]`)),
      qty: formData.get(`items[${i}][qty]`) as string,
      harga: formData.get(`items[${i}][harga]`) as string,
      subtotal: formData.get(`items[${i}][subtotal]`) as string,
    });
    i++;
  }

  const raw = {
    bayar: formData.get("bayar") as string,
    items: rawItems,
  };

  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data transaksi tidak valid" };
  }

  const total = parsed.data.items.reduce((sum, item) => sum + item.subtotal, 0);
  const bayar = parsed.data.bayar;
  const kembalian = bayar - total;

  if (kembalian < 0) {
    return { error: "Pembayaran kurang" };
  }

  try {
    const nomorTransaksi = await generateNomorTransaksi();
    const userId = BigInt(session.userId);

    const trx = await prisma.transaction.create({
      data: {
        nomorTransaksi,
        tanggal: new Date(),
        total,
        bayar,
        kembalian,
        userId,
        items: {
          create: parsed.data.items.map((item) => ({
            productId: item.productId,
            productUnitId: item.productUnitId,
            qty: item.qty,
            harga: item.harga,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { select: { namaBarang: true } },
            productUnit: { select: { namaSatuan: true } },
          },
        },
      },
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return {
      success: true,
      transaction: {
        id: Number(trx.id),
        nomorTransaksi: trx.nomorTransaksi,
        tanggal: trx.tanggal.toISOString(),
        total: Number(trx.total),
        bayar: Number(trx.bayar),
        kembalian: Number(trx.kembalian),
        items: trx.items.map((item) => ({
          id: Number(item.id),
          qty: Number(item.qty),
          harga: Number(item.harga),
          subtotal: Number(item.subtotal),
          product: item.product,
          productUnit: item.productUnit,
        })),
      },
    };
  } catch {
    return { error: "Gagal menyimpan transaksi" };
  }
}

export async function getTransactions(
  search?: string,
  fromDate?: string,
  toDate?: string,
  page = 1,
) {
  const session = await getSession();
  if (!session) redirect("/login");

  const take = 20;
  const skip = (page - 1) * take;

  const where: Record<string, unknown> = {};

  if (search) {
    where.nomorTransaksi = { startsWith: search };
  }

  if (fromDate || toDate) {
    const tanggal: Record<string, Date> = {};
    if (fromDate) tanggal.gte = new Date(fromDate);
    if (toDate) tanggal.lte = new Date(toDate + "T23:59:59");
    where.tanggal = tanggal;
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        user: { select: { nama: true } },
        items: {
          include: {
            product: { select: { namaBarang: true } },
            productUnit: { select: { namaSatuan: true } },
          },
        },
      },
      skip,
      take,
      orderBy: { tanggal: "desc" },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: transactions.map((t) => ({
      id: Number(t.id),
      nomorTransaksi: t.nomorTransaksi,
      tanggal: t.tanggal,
      total: Number(t.total),
      bayar: Number(t.bayar),
      kembalian: Number(t.kembalian),
      user: t.user,
      items: t.items.map((item) => ({
        id: Number(item.id),
        qty: Number(item.qty),
        harga: Number(item.harga),
        subtotal: Number(item.subtotal),
        product: item.product,
        productUnit: item.productUnit,
      })),
    })),
    total,
    pages: Math.ceil(total / take),
  };
}

export async function getTransaction(id: number) {
  const session = await getSession();
  if (!session) redirect("/login");

  const trx = await prisma.transaction.findUnique({
    where: { id },
    include: {
      user: { select: { nama: true } },
      items: {
        include: {
          product: { select: { namaBarang: true } },
          productUnit: { select: { namaSatuan: true } },
        },
      },
    },
  });

  if (!trx) return null;

  return {
    id: Number(trx.id),
    nomorTransaksi: trx.nomorTransaksi,
    tanggal: trx.tanggal,
    total: Number(trx.total),
    bayar: Number(trx.bayar),
    kembalian: Number(trx.kembalian),
    user: trx.user,
    items: trx.items.map((item) => ({
      id: Number(item.id),
      qty: Number(item.qty),
      harga: Number(item.harga),
      subtotal: Number(item.subtotal),
      product: item.product,
      productUnit: item.productUnit,
    })),
  };
}

export async function getReports(fromDate?: string, toDate?: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const conditions: Prisma.Sql[] = [];
  const from = fromDate ? new Date(fromDate) : undefined;
  const to = toDate ? new Date(toDate + "T23:59:59") : undefined;

  if (from) conditions.push(Prisma.sql`t.tanggal >= ${from}`);
  if (to) conditions.push(Prisma.sql`t.tanggal <= ${to}`);

  const whereClause = conditions.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
    : Prisma.empty;

  const [aggregate] = await prisma.$queryRaw<{
    total_transaksi: bigint;
    omzet: number;
  }[]>(
    Prisma.sql`
      SELECT COUNT(*) as total_transaksi, COALESCE(SUM(t.total), 0) as omzet
      FROM transactions t ${whereClause}
    `,
  );

  const produkTerlaris = await prisma.$queryRaw<{
    nama: string;
    qty: number;
    total: number;
  }[]>(
    Prisma.sql`
      SELECT p.nama_barang as nama, SUM(ti.qty) as qty, SUM(ti.subtotal) as total
      FROM transaction_items ti
      JOIN products p ON p.id = ti.product_id
      JOIN transactions t ON t.id = ti.transaction_id
      ${whereClause}
      GROUP BY p.id, p.nama_barang
      ORDER BY qty DESC
      LIMIT 10
    `,
  );

  return {
    totalTransaksi: Number(aggregate?.total_transaksi ?? 0),
    omzet: Number(aggregate?.omzet ?? 0),
    produkTerlaris: produkTerlaris.map((p) => ({
      nama: p.nama,
      qty: Number(p.qty),
      total: Number(p.total),
    })),
  };
}
