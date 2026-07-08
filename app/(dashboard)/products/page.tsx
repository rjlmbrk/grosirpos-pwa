import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductTable } from "./table";
import { getProducts } from "@/actions/products";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || "";
  const page = Number(params.page) || 1;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Produk</h1>
        <Link href="/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Button>
        </Link>
      </div>

      <form className="mb-4">
        <Input
          name="search"
          placeholder="Cari kode atau nama barang..."
          defaultValue={search}
          className="w-full sm:max-w-sm"
        />
      </form>

      <Suspense fallback={<TableSkeleton />}>
        <ProductsContent search={search} page={page} />
      </Suspense>
    </div>
  );
}

async function ProductsContent({ search, page }: { search: string; page: number }) {
  const data = await getProducts(search, page);
  return (
    <ProductTable
      products={data.products}
      total={data.total}
      pages={data.pages}
      currentPage={page}
      search={search}
    />
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-md border overflow-x-auto">
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
