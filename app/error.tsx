"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-bold text-red-600 mb-2">Ada yang salah</h2>
      <p className="text-zinc-500 mb-4">Silakan coba lagi.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Coba Lagi
      </button>
    </div>
  );
}
