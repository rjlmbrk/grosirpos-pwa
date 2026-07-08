import type { Metadata } from "next";
import { Store, WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Offline - Toko Riswati",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-zinc-100">
            <WifiOff className="h-10 w-10 text-zinc-400" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-zinc-900 mb-2">
          Kamu Sedang Offline
        </h1>
        <p className="text-zinc-500 mb-6">
          Toko Riswati membutuhkan koneksi internet untuk mengakses halaman ini.
          Silakan periksa koneksi internet kamu dan coba lagi.
        </p>
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <Store className="h-5 w-5" />
          <span className="font-semibold">Toko Riswati</span>
        </div>
      </div>
    </div>
  );
}
