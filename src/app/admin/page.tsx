import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return <AdminDashboard />;
}
