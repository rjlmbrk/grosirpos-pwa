"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { deleteProduct } from "@/actions/products";

interface Product {
  id: number;
  kodeBarang: string;
  namaBarang: string;
  kategori: string;
  isActive: boolean;
  units: { id: number; namaSatuan: string; hargaJual: number }[];
}

interface Props {
  products: Product[];
  total: number;
  pages: number;
  currentPage: number;
  search: string;
}

export function ProductTable({
  products,
  total,
  pages,
  currentPage,
  search,
}: Props) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Hapus produk ini?")) return;
    await deleteProduct(id);
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">Belum ada produk.</div>
    );
  }

  return (
    <div>
      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{product.namaBarang}</p>
                    <Badge variant={product.isActive ? "default" : "secondary"} className="shrink-0">
                      {product.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono">{product.kodeBarang}</p>
                  <p className="text-xs text-zinc-500">{product.kategori}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.units.map((u) => (
                      <span key={u.id} className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 text-xs text-zinc-600">
                        {u.namaSatuan}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Link href={`/products/${product.id}`}>
                    <Button variant="ghost" size="icon" className="size-10">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <div className="rounded-md border overflow-x-auto hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-sm">
                  {product.kodeBarang}
                </TableCell>
                <TableCell className="font-medium">
                  {product.namaBarang}
                </TableCell>
                <TableCell>{product.kategori}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-zinc-500">
                  {product.units.map((u) => u.namaSatuan).join(", ")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/products/${product.id}`}>
                      <Button variant="ghost" size="icon" className="size-9">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between gap-2 flex-wrap mt-4">
          <p className="text-sm text-zinc-500">
            Total {total} produk
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/products?search=${search}&page=${currentPage - 1}`}
              >
                <Button variant="outline" size="sm">
                  Sebelumnya
                </Button>
              </Link>
            )}
            {currentPage < pages && (
              <Link
                href={`/products?search=${search}&page=${currentPage + 1}`}
              >
                <Button variant="outline" size="sm">
                  Selanjutnya
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
