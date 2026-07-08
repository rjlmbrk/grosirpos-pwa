"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { deleteUser } from "@/actions/users";

interface User {
  id: number;
  nama: string;
  username: string;
  role: string;
  createdAt: Date;
}

interface Props {
  users: User[];
}

export function UserTable({ users }: Props) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Hapus user ini?")) return;
    await deleteUser(id);
    router.refresh();
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        Belum ada user.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.nama}</TableCell>
              <TableCell className="font-mono text-sm">
                {user.username}
              </TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role === "admin" ? "Admin" : "Kasir"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Link href={`/users/${user.id}`}>
                    <Button variant="ghost" size="icon" className="max-sm:size-10">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="max-sm:size-10"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
