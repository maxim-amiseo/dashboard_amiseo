"use client";

import type { ClientRecord } from "@/lib/data";
import { LogoutButton } from "./logout-button";
import { ArrowUpRight, CheckCircle2, LayoutDashboard, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";

type ClientDashboardProps = {
  client: ClientRecord;
};

export function ClientDashboard({ client }: ClientDashboardProps) {
  const [selectedPeriodId, setSelectedPeriodId] = useState(client.kpiPeriods?.[0]?.id ?? "");
  const [selectedEcomId, setSelectedEcomId] = useState(client.ecommercePeriods?.[0]?.id ?? "");
  const [selectedAdsId, setSelectedAdsId] = useState(client.adsPeriods?.[0]?.id ?? "");

  const selectedPeriod = useMemo(
    () => client.kpiPeriods.find((period) => period.id === selectedPeriodId) ?? client.kpiPeriods[0],
    [client.kpiPeriods, selectedPeriodId]
  );

  const selectedEcommerce = useMemo(
    () => client.ecommercePeriods?.find((period) => period.id === selectedEcomId) ?? client.ecommercePeriods?.[0],
    [client.ecommercePeriods, selectedEcomId]
  );

  const selectedAds = useMemo(
    () => client.adsPeriods?.find((period) => period.id === selectedAdsId) ?? client.adsPeriods?.[0],
    [client.adsPeriods, selectedAdsId]
  );

  const normalizeList = (list?: string[]) => (list ?? []).map((item) => item.trim()).filter(Boolean);
  const highlights = normalizeList(selectedPeriod?.monthlyHighlights ?? client.monthlyHighlights);
  const deliveredActions = normalizeList(selectedPeriod?.thisMonthActions ?? client.thisMonthActions);
  const nextActions = normalizeList(selectedPeriod?.nextMonthActions ?? client.nextMonthActions);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(118,92,250,0.15),_#1A1B29)] px-4 py-8 text-white lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Espace client</p>
              <h1 className="text-3xl font-semibold">{client.name}</h1>
              <p className="text-white/60">{client.industry}</p>
            </div>
            <LogoutButton />
          </div>
          <p className="mt-4 text-lg text-white/80">{client.summary}</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">KPIs clés</p>
              <h2 className="text-xl font-semibold text-white">Performance par mois</h2>
            </div>
            {client.kpiPeriods.length ? (
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span>Période</span>
                <select
                  className="rounded-xl border border-white/20 bg-[rgba(28,29,45,0.78)] px-3 py-1.5 text-white focus:border-[var(--amiseo-accent-strong)] focus:outline-none"
                  value={selectedPeriod?.id ?? ""}
                  onChange={(event) => setSelectedPeriodId(event.target.value)}
                >
                  {client.kpiPeriods.map((period) => (
                    <option key={period.id} value={period.id} className="bg-slate-900 text-white">
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          {selectedPeriod ? (
            selectedPeriod.kpis.length ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {selectedPeriod.kpis.map((kpi) => (
                  <article
                    key={`${selectedPeriod.id}-${kpi.label}`}
                    className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">{kpi.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
                    {kpi.helper ? <p className="text-sm text-emerald-300">{kpi.helper}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-white/60">Aucun KPI saisi pour cette période.</p>
            )
          ) : (
            <p className="mt-4 text-sm text-white/60">Aucune période de KPI disponible.</p>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-5 w-5 text-[var(--amiseo-accent)]" />
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/60">Highlights</p>
                <h2 className="text-xl font-semibold text-white">
                  Ce qu&apos;il faut retenir {selectedPeriod?.label ? `(${selectedPeriod.label})` : "ce mois-ci"}
                </h2>
              </div>
            </div>
            <ul className="mt-5 space-y-3 text-white/80">
              {highlights.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                  <ArrowUpRight className="h-4 w-4 text-[var(--amiseo-accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">Focus initiative</p>
            <div className="mt-4 space-y-4">
              {client.initiatives.map((initiative) => (
                <div key={initiative.title} className="rounded-2xl border border-white/10 bg-[rgba(26,27,41,0.7)] p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{initiative.title}</p>
                    <span className="rounded-full px-3 py-1 text-xs text-white/70">{statusLabel(initiative.status)}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/70">{initiative.details}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">Livré ce mois-ci</p>
                <h3 className="text-xl font-semibold">Actions finalisées</h3>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-white/80">
              {deliveredActions.map((item, index) => (
                <li key={`${item}-${index}`} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <ArrowUpRight className="h-5 w-5 text-sky-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">Pipeline</p>
                <h3 className="text-xl font-semibold">Prêt pour le mois prochain</h3>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-white/80">
              {nextActions.map((item, index) => (
                <li key={`${item}-${index}`} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </section>

        {client.ecommerce ? (
          <section className="rounded-3xl border border-[rgba(118,92,250,0.35)] bg-[radial-gradient(circle_at_top,_rgba(118,92,250,0.18),_transparent_70%)] p-6">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-[var(--amiseo-accent)]" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--amiseo-accent-strong)]">E-commerce</p>
                <h3 className="text-2xl font-semibold text-white">
                  Radar business {selectedEcommerce?.label ? `(${selectedEcommerce.label})` : ""}
                </h3>
              </div>
            </div>
            {client.ecommercePeriods?.length ? (
              <>
                <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
                  <span>Période</span>
                  <select
                    className="rounded-xl border border-white/20 bg-[rgba(28,29,45,0.78)] px-3 py-1.5 text-white focus:border-[var(--amiseo-accent-strong)] focus:outline-none"
                    value={selectedEcommerce?.id ?? ""}
                    onChange={(event) => setSelectedEcomId(event.target.value)}
                  >
                    {client.ecommercePeriods.map((period) => (
                      <option key={period.id} value={period.id} className="bg-slate-900 text-white">
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedEcommerce ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {Object.entries(selectedEcommerce.ecommerce).map(([key, value]) => (
                      <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.4em] text-white/60">{labelForEcommerceKey(key)}</p>
                        <p className="mt-2 text-xl font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-white/60">Aucune période e-commerce sélectionnée.</p>
                )}
              </>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {Object.entries(client.ecommerce).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">{labelForEcommerceKey(key)}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {client.ads ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <ArrowUpRight className="h-5 w-5 text-[var(--amiseo-accent)]" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">Ads</p>
                <h3 className="text-2xl font-semibold text-white">
                  Radar paid {selectedAds?.label ? `(${selectedAds.label})` : ""}
                </h3>
              </div>
            </div>
            {client.adsPeriods?.length ? (
              <>
                <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
                  <span>Semaine</span>
                  <select
                    className="rounded-xl border border-white/20 bg-[rgba(28,29,45,0.78)] px-3 py-1.5 text-white focus:border-[var(--amiseo-accent-strong)] focus:outline-none"
                    value={selectedAds?.id ?? ""}
                    onChange={(event) => setSelectedAdsId(event.target.value)}
                  >
                    {client.adsPeriods.map((period) => (
                      <option key={period.id} value={period.id} className="bg-slate-900 text-white">
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedAds ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {Object.entries(selectedAds.ads).map(([key, value]) => (
                      <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.4em] text-white/60">{labelForAdsKey(key)}</p>
                        <p className="mt-2 text-xl font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-white/60">Aucune semaine ads sélectionnée.</p>
                )}
              </>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {Object.entries(client.ads).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">{labelForAdsKey(key)}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}

const statusLabel = (status: ClientRecord["initiatives"][number]["status"]) => {
  switch (status) {
    case "active":
      return "En cours";
    case "monitoring":
      return "Monitoring";
    case "planning":
      return "Prévu";
    case "paused":
      return "En pause";
  }
};

const labelForEcommerceKey = (key: string) => {
  switch (key) {
    case "revenue":
      return "Revenu";
    case "conversionRate":
      return "Conversion";
    case "returningCustomers":
      return "Clients fidèles";
    case "topProduct":
      return "Produit star";
    case "avgOrderValue":
      return "Panier moyen";
    case "cartAbandonment":
      return "Abandon panier";
    default:
      return key;
  }
};

const labelForAdsKey = (key: string) => {
  switch (key) {
    case "spend":
      return "Dépenses";
    case "roas":
      return "ROAS";
    case "cpa":
      return "CPA";
    case "impressions":
      return "Impressions";
    case "ctr":
      return "CTR";
    case "bestChannel":
      return "Canal star";
    default:
      return key;
  }
};
