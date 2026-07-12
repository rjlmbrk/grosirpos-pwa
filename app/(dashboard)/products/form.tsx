"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { createProduct, generateKodeBarang, updateProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface UnitField {
  namaSatuan: string;
  hargaJual: string;
}

interface Props {
  initialData?: {
    id: number;
    kodeBarang: string;
    namaBarang: string;
    kategori: string;
    isActive: boolean;
    units: { namaSatuan: string; hargaJual: number }[];
  };
}

function SubmitButton({ edit }: { edit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Menyimpan..." : edit ? "Simpan" : "Tambah Produk"}
    </Button>
  );
}

export function ProductForm({ initialData }: Props) {
  const edit = !!initialData;
  const action = edit
    ? updateProduct.bind(null, initialData!.id)
    : createProduct;

  const [state, formAction] = useActionState(action, undefined);
  const router = useRouter();
  const [kodeBarang, setKodeBarang] = useState(initialData?.kodeBarang || "");
  const [units, setUnits] = useState<UnitField[]>(
    initialData?.units.map((u) => ({
      namaSatuan: u.namaSatuan,
      hargaJual: String(u.hargaJual),
    })) || [{ namaSatuan: "", hargaJual: "" }],
  );

  useEffect(() => {
    if (!edit && !kodeBarang) {
      generateKodeBarang().then(setKodeBarang);
    }
  }, [edit, kodeBarang]);

  async function handleGenerate() {
    const code = await generateKodeBarang();
    if (code) setKodeBarang(code);
  }

  function addUnit() {
    setUnits([...units, { namaSatuan: "", hargaJual: "" }]);
  }

  function removeUnit(i: number) {
    if (units.length <= 1) return;
    setUnits(units.filter((_, idx) => idx !== i));
  }

  function updateUnit(
    i: number,
    field: "namaSatuan" | "hargaJual",
    value: string,
  ) {
    const next = [...units];
    next[i] = { ...next[i], [field]: value };
    setUnits(next);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kodeBarang">Kode Barang</Label>
              <div className="flex gap-2">
                <Input
                  id="kodeBarang"
                  name="kodeBarang"
                  value={kodeBarang}
                  onChange={(e) => setKodeBarang(e.target.value)}
                  placeholder="Masukkan kode barang"
                  required
                  className="flex-1"
                />
                {!edit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGenerate}
                    title="Generate kode barang"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Input
                id="kategori"
                name="kategori"
                defaultValue={initialData?.kategori}
                placeholder="Masukkan kategori"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="namaBarang">Nama Barang</Label>
            <Input
              id="namaBarang"
              name="namaBarang"
              defaultValue={initialData?.namaBarang}
              placeholder="Masukkan nama barang"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              value="true"
              defaultChecked={initialData?.isActive ?? true}
              className="h-5 w-5 rounded border-zinc-300"
            />
            <Label htmlFor="isActive" className="mb-0">
              Produk Aktif
            </Label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Satuan dan Harga
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addUnit}
                className="gap-1 max-sm:h-10"
              >
                <Plus className="h-3 w-3" />
                Tambah Satuan
              </Button>
            </div>

            {units.map((unit, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 items-start">
                <div className="flex-1 w-full space-y-1">
                  <Label className="text-xs">Nama Satuan</Label>
                  <Input
                    name={`units[${i}][namaSatuan]`}
                    value={unit.namaSatuan}
                    onChange={(e) => updateUnit(i, "namaSatuan", e.target.value)}
                    placeholder="Contoh: pcs"
                    required
                  />
                </div>
                <div className="flex-1 w-full space-y-1">
                  <Label className="text-xs">Harga Jual</Label>
                  <Input
                    name={`units[${i}][hargaJual]`}
                    type="number"
                    value={unit.hargaJual}
                    onChange={(e) => updateUnit(i, "hargaJual", e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                {units.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="max-sm:mt-0 sm:mt-5 shrink-0 max-sm:size-10"
                    onClick={() => removeUnit(i)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <SubmitButton edit={edit} />
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.back()}
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
