import { ClientDashboard } from "@/components/client-dashboard";
import { getClientById } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard Client — Amiseo"
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSessionUser();

  if (!session || session.role !== "client" || !session.clientId) {
    redirect("/login");
  }

  const client = await getClientById(session.clientId);

  if (!client) {
    redirect("/login");
  }

  return <ClientDashboard client={client} />;
}
