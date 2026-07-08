import { notFound } from "next/navigation";
import { getProduct } from "@/actions/products";
import { ProductForm } from "../form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(Number(id));

  if (!product) notFound();

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-6">Edit Produk</h1>
      <ProductForm
        initialData={{
          id: product.id,
          kodeBarang: product.kodeBarang,
          namaBarang: product.namaBarang,
          kategori: product.kategori,
          isActive: product.isActive,
          units: product.units.map((u) => ({
            namaSatuan: u.namaSatuan,
            hargaJual: Number(u.hargaJual),
          })),
        }}
      />
    </div>
  );
}
