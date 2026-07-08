import {
  getPendingTransactions,
  removePendingTransaction,
  updateTransactionStatus,
  countPendingTransactions,
} from "./offline-db";
import { syncTransaction } from "@/actions/sync-transactions";

export interface SyncResult {
  success: number;
  failed: number;
  errors: string[];
}

export async function processPendingTransactions(): Promise<SyncResult> {
  const result: SyncResult = { success: 0, failed: 0, errors: [] };
  const pending = await getPendingTransactions();

  for (const trx of pending) {
    try {
      await updateTransactionStatus(trx.id!, "syncing");

      const res = await syncTransaction({
        items: trx.items,
        bayar: trx.bayar,
      });

      if (res.success) {
        await removePendingTransaction(trx.id!);
        result.success++;
      } else {
        await updateTransactionStatus(trx.id!, "failed", res.error);
        result.failed++;
        if (res.error) result.errors.push(res.error);
      }
    } catch {
      await updateTransactionStatus(trx.id!, "failed", "Gagal terhubung ke server");
      result.failed++;
      result.errors.push("Gagal terhubung ke server");
    }
  }

  return result;
}

export async function getPendingCount(): Promise<number> {
  return countPendingTransactions();
}
