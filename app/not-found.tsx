import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-bold text-zinc-900 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-zinc-500 mb-4">Halaman yang Anda cari tidak ada.</p>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Ke Dashboard
      </Link>
    </div>
  );
}
