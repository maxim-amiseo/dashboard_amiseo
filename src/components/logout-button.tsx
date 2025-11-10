"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton({ variant = "ghost" }: { variant?: "ghost" | "solid" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className={
        variant === "solid"
          ? "rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
          : "text-sm font-medium text-white/80 underline-offset-4 hover:text-white disabled:opacity-50"
      }
    >
      {pending ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );
}
