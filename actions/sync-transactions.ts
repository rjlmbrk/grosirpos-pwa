"use server";

import { revalidatePath } from "next/cache";
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

interface SyncInput {
  items: {
    productId: number;
    productUnitId: number;
    qty: number;
    harga: number;
    subtotal: number;
  }[];
  bayar: number;
}

export async function syncTransaction(data: SyncInput) {
  const session = await getSession();
  if (!session) {
    return { error: "Sesi telah berakhir, silakan login ulang" };
  }

  const parsed = transactionSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Data transaksi tidak valid" };
  }

  const total = parsed.data.items.reduce((sum, item) => sum + item.subtotal, 0);
  const bayar = parsed.data.bayar;
  const kembalian = bayar - total;

  if (kembalian < 0) {
    return { error: "Jumlah bayar kurang dari total" };
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
