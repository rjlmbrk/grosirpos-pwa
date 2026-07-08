import { Suspense } from "react";
import { Input } from "@/components/ui/input";
import { getReports } from "@/actions/transactions";
import { DateFilterPresets } from "@/components/date-filter-presets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function parseDateId(value: string): string {
  if (!value) return "";
  const parts = value.split("/");
  if (parts.length !== 3) return value;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function formatDateId(value: string): string {
  if (!value) return "";
  if (value.includes("-") && value.split("-").length === 3) {
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  }
  return value;
}

function isoDate(value: string): string {
  if (!value) return "";
  if (value.includes("/")) return parseDateId(value);
  return value;
}

interface Props {
  searchParams: Promise<{ fromDate?: string; toDate?: string }>;
}

export default async function ReportsPage({ searchParams }: Props) {
  const params = await searchParams;
  const fromDate = isoDate(params.fromDate || "");
  const toDate = isoDate(params.toDate || "");

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-6">Laporan</h1>

      <form className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
        <Input
          name="fromDate"
          type="date"
          defaultValue={fromDate}
          className="w-full sm:max-w-40"
        />
        <Input
          name="toDate"
          type="date"
          defaultValue={toDate}
          className="w-full sm:max-w-40"
        />
        <DateFilterPresets />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          Tampilkan
        </button>
      </form>

      {!fromDate && !toDate ? (
        <div className="text-center py-12 text-zinc-500">
          Pilih rentang tanggal untuk melihat laporan.
        </div>
      ) : (
        <Suspense fallback={<ReportsSkeleton />}>
          <ReportsContent fromDate={fromDate} toDate={toDate} />
        </Suspense>
      )}
    </div>
  );
}

async function ReportsContent({ fromDate, toDate }: { fromDate: string; toDate: string }) {
  const data = await getReports(fromDate, toDate);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-500">
              Jumlah Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalTransaksi}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-500">
              Omzet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              Rp{data.omzet.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
      </div>

      {data.produkTerlaris.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.produkTerlaris.map((p, i) => (
                <div key={p.nama} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-400 w-6">#{i + 1}</span>
                    <span className="text-sm">{p.nama}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{p.qty} terjual</p>
                    <p className="text-xs text-zinc-500">Rp{p.total.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
