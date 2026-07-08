"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface Transaction {
  id: number;
  nomorTransaksi: string;
  tanggal: Date;
  total: number;
  user: { nama: string };
}

interface Props {
  transactions: Transaction[];
  total: number;
  pages: number;
  currentPage: number;
  search: string;
  fromDate: string;
  toDate: string;
}

export function TransactionTable({
  transactions,
  total,
  pages,
  currentPage,
  search,
  fromDate,
  toDate,
}: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        Belum ada transaksi.
      </div>
    );
  }

  function buildUrl(pageNum: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    if (pageNum > 1) params.set("page", String(pageNum));
    return `/transactions?${params.toString()}`;
  }

  return (
    <div>
      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {transactions.map((trx) => (
          <Card key={trx.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-medium">{trx.nomorTransaksi}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {format(new Date(trx.tanggal), "dd/MM/yyyy HH:mm")}
                  </p>
                  <p className="text-xs text-zinc-500">{trx.user.nama}</p>
                  <p className="text-base font-bold mt-1">
                    Rp{trx.total.toLocaleString("id-ID")}
                  </p>
                </div>
                <Link href={`/transactions/${trx.id}`}>
                  <Button variant="ghost" size="icon" className="size-10">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
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
              <TableHead>Nomor</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kasir</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((trx) => (
              <TableRow key={trx.id}>
                <TableCell className="font-mono text-sm">
                  {trx.nomorTransaksi}
                </TableCell>
                <TableCell>
                  {format(new Date(trx.tanggal), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>{trx.user.nama}</TableCell>
                <TableCell className="text-right font-medium">
                  Rp{trx.total.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/transactions/${trx.id}`}>
                    <Button variant="ghost" size="icon" className="size-9">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-zinc-500">Total {total} transaksi</p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={buildUrl(currentPage - 1)}>
                <Button variant="outline" size="sm">
                  Sebelumnya
                </Button>
              </Link>
            )}
            {currentPage < pages && (
              <Link href={buildUrl(currentPage + 1)}>
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
