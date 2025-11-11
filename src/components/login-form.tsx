"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload.message ?? "Impossible de vous connecter.");
          return;
        }

        router.push(payload.redirectTo ?? "/dashboard");
      } catch (err) {
        console.error(err);
        setError("Connexion impossible, merci de réessayer.");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <div>
        <label className="text-sm font-medium text-white/70" htmlFor="username">
          Identifiant
        </label>
        <input
          id="username"
          className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--amiseo-accent)]"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Maxim"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-white/70" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--amiseo-accent)]"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-xl bg-[var(--amiseo-accent)] py-2 font-semibold text-slate-900 transition hover:bg-[var(--amiseo-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Connexion..." : "Se connecter"}
      </button>

      <p className="text-center text-xs text-white/50">
        Accès réservé aux clients Amiseo. Contactez support@amiseo.fr pour obtenir ou réinitialiser vos identifiants.
      </p>
    </form>
  );
}
