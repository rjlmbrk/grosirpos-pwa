import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUsers } from "@/actions/users";
import { UserTable } from "./table";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Users</h1>
        <Link href="/users/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah User
          </Button>
        </Link>
      </div>

      <UserTable users={users} />
    </div>
  );
}
