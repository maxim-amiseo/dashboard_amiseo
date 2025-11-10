import { LoginForm } from "@/components/login-form";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Amiseo Dashboard — Connexion"
};

export default async function LoginPage() {
  const session = await getSessionUser();

  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white brand-gradient">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(118,92,250,0.25),_transparent_55%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-6 py-16 md:flex-row md:items-center md:px-10">
        <div className="space-y-6 md:w-1/2">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--amiseo-accent-strong)]">Amiseo</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Un cockpit client construit pour des échanges ultra-transparents.
          </h1>
          <p className="text-lg text-white/70">
            Accès admin pour mettre à jour chaque dossier. Accès client pour suivre les KPI, les actions livrées et ce qui
            arrive ensuite. Tout est synchronisé en temps réel.
          </p>
          <ul className="grid gap-3 text-sm text-white/70 sm:grid-cols-2">
            <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-white">Vue admin</p>
              <p>Gestion des comptes & mise à jour des actions.</p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-white">Vue client</p>
              <p>Résumé clair + focus business & e-commerce.</p>
            </li>
          </ul>
        </div>

        <div className="md:w-1/2">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
