import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingCart, BarChart3, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-6">Dashboard</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Selamat datang, {session.nama}
      </p>

      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      <div className="space-y-3 mt-8">
        <h2 className="text-lg font-semibold text-zinc-900">Aksi Cepat</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/cashier">
            <Button className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Kasir
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="gap-2">
              <Package className="h-4 w-4" />
              Produk
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Laporan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

async function DashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalProduk, aggregate] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.transaction.aggregate({
      where: { tanggal: { gte: today, lt: tomorrow } },
      _count: true,
      _sum: { total: true },
    }),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-500">Total Produk</CardTitle>
          <Package className="h-4 w-4 text-zinc-400" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalProduk}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-500">Transaksi Hari Ini</CardTitle>
          <BarChart3 className="h-4 w-4 text-zinc-400" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{aggregate._count}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-500">Omzet Hari Ini</CardTitle>
          <BarChart3 className="h-4 w-4 text-zinc-400" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            Rp{Number(aggregate._sum.total || 0).toLocaleString("id-ID")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
