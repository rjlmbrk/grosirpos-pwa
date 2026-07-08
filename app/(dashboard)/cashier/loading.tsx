import { Skeleton } from "@/components/ui/skeleton";

export default function CashierLoading() {
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-0px)]">
      <div className="flex-1 p-4 pb-28 lg:pb-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
