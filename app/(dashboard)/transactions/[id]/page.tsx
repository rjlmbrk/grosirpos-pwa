import { notFound } from "next/navigation";
import { getTransaction } from "@/actions/transactions";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: Props) {
  const { id } = await params;
  const trx = await getTransaction(Number(id));
  if (!trx) notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">
        Detail Transaksi
      </h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-zinc-500">Nomor Transaksi</dt>
              <dd className="font-mono font-medium">{trx.nomorTransaksi}</dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500">Tanggal</dt>
              <dd>
                {format(new Date(trx.tanggal), "dd/MM/yyyy HH:mm")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500">Kasir</dt>
              <dd>{trx.user.nama}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Item</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trx.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.namaBarang}</TableCell>
                  <TableCell>{item.productUnit.namaSatuan}</TableCell>
                  <TableCell className="text-right">{item.qty}</TableCell>
                  <TableCell className="text-right">
                    Rp{item.harga.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right">
                    Rp{item.subtotal.toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Total</dt>
              <dd className="font-bold text-lg">
                Rp{trx.total.toLocaleString("id-ID")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Bayar</dt>
              <dd>Rp{trx.bayar.toLocaleString("id-ID")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Kembalian</dt>
              <dd className="text-blue-600 font-medium">
                Rp{trx.kembalian.toLocaleString("id-ID")}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
