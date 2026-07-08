import { notFound } from "next/navigation";
import { getUser } from "@/actions/users";
import { UserForm } from "../form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;
  const user = await getUser(Number(id));

  if (!user) notFound();

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-6">
        Edit User
      </h1>
      <UserForm initialData={user} />
    </div>
  );
}
