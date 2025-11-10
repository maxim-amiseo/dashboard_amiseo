import { AdminDashboard } from "@/components/admin-dashboard";
import { getAllClients } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Cockpit Admin — Amiseo"
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const session = await getSessionUser();

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const clients = await getAllClients();

  return (
    <main className="min-h-screen px-4 py-10 text-white md:px-8 brand-gradient">
      <AdminDashboard adminName={session.displayName} clients={clients} />
    </main>
  );
}
