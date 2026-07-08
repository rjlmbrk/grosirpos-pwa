import { Suspense } from "react";
import { Input } from "@/components/ui/input";
import { TransactionTable } from "./table";
import { getTransactions } from "@/actions/transactions";
import { DateFilterPresets } from "@/components/date-filter-presets";
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
  searchParams: Promise<{
    search?: string;
    fromDate?: string;
    toDate?: string;
    page?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || "";
  const fromDate = isoDate(params.fromDate || "");
  const toDate = isoDate(params.toDate || "");
  const page = Number(params.page) || 1;

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-6">Transaksi</h1>

      <form className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <Input
          name="search"
          placeholder="Cari nomor transaksi..."
          defaultValue={search}
          className="w-full sm:max-w-xs"
        />
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
          Filter
        </button>
      </form>

      <Suspense fallback={<TableSkeleton />}>
        <TransactionsContent
          search={search}
          fromDate={fromDate}
          toDate={toDate}
          page={page}
        />
      </Suspense>
    </div>
  );
}

async function TransactionsContent({
  search, fromDate, toDate, page,
}: {
  search: string; fromDate: string; toDate: string; page: number;
}) {
  const data = await getTransactions(search, fromDate, toDate, page);
  return (
    <TransactionTable
      transactions={data.transactions}
      total={data.total}
      pages={data.pages}
      currentPage={page}
      search={search}
      fromDate={fromDate}
      toDate={toDate}
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
