"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createUser, updateUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  initialData?: {
    id: number;
    nama: string;
    username: string;
    role: string;
  };
}

function SubmitButton({ edit }: { edit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Menyimpan..." : edit ? "Simpan" : "Tambah User"}
    </Button>
  );
}

export function UserForm({ initialData }: Props) {
  const edit = !!initialData;
  const action = edit
    ? updateUser.bind(null, initialData!.id)
    : createUser;

  const [state, formAction] = useActionState(action, undefined);
  const router = useRouter();

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={initialData?.nama}
              placeholder="Masukkan nama"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              defaultValue={initialData?.username}
              placeholder="Masukkan username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {edit && "(kosongkan jika tidak diubah)"}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={edit ? "Biarkan kosong jika tidak diubah" : "Masukkan password"}
              required={!edit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              defaultValue={initialData?.role || "kasir"}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
              required
            >
              <option value="admin">Admin</option>
              <option value="kasir">Kasir</option>
            </select>
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
