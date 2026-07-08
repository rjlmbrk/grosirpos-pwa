import { Sidebar, MobileNav } from "@/components/sidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar role={session.role} />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <MobileNav role={session.role} />
    </div>
  );
}
