import { ProductForm } from "../form";

export default function CreateProductPage() {
  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-6">Tambah Produk</h1>
      <ProductForm />
    </div>
  );
}
