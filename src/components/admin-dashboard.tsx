"use client";

import type { ClientRecord, Initiative, KPI, KPIPeriod } from "@/lib/data";
import clsx from "clsx";
import { CheckCircle2, Loader2, Plus, RefreshCw } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { LogoutButton } from "./logout-button";

type AdminDashboardProps = {
  clients: ClientRecord[];
  adminName: string;
};

type DraftClient = ClientRecord & { ecommerceEnabled: boolean; adsEnabled: boolean };

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);

const createKpiPeriod = (label = "Nouveau mois"): KPIPeriod => ({
  id: `periode-${makeId()}`,
  label,
  kpis: [],
  monthlyHighlights: [""],
  thisMonthActions: [""],
  nextMonthActions: [""]
});

const defaultEcommerce = () => ({
  revenue: "",
  conversionRate: "",
  returningCustomers: "",
  topProduct: "",
  avgOrderValue: "",
  cartAbandonment: ""
});

const defaultAds = () => ({
  spend: "",
  roas: "",
  cpa: "",
  impressions: "",
  ctr: "",
  bestChannel: ""
});

const normalizeKpiPeriods = (client: ClientRecord): KPIPeriod[] => {
  if (client.kpiPeriods?.length) {
    return structuredClone(client.kpiPeriods);
  }

  const legacyKpis = client.kpis?.length ? structuredClone(client.kpis) : [];
  const legacyHighlights = client.monthlyHighlights?.length ? structuredClone(client.monthlyHighlights) : [""];
  const legacyThisMonth = client.thisMonthActions?.length ? structuredClone(client.thisMonthActions) : [""];
  const legacyNextMonth = client.nextMonthActions?.length ? structuredClone(client.nextMonthActions) : [""];

  return [
    {
      id: `periode-${client.id || makeId()}`,
      label: "Période en cours",
      kpis: legacyKpis,
      monthlyHighlights: legacyHighlights,
      thisMonthActions: legacyThisMonth,
      nextMonthActions: legacyNextMonth
    }
  ];
};

const cloneClient = (client: ClientRecord): DraftClient => ({
  ...structuredClone(client),
  kpiPeriods: normalizeKpiPeriods(client),
  monthlyHighlights: client.monthlyHighlights?.length ? structuredClone(client.monthlyHighlights) : [""],
  thisMonthActions: client.thisMonthActions?.length ? structuredClone(client.thisMonthActions) : [""],
  nextMonthActions: client.nextMonthActions?.length ? structuredClone(client.nextMonthActions) : [""],
  initiatives: client.initiatives?.length
    ? structuredClone(client.initiatives)
    : [{ title: "", status: "planning", details: "" }],
  ecommerce: client.ecommerce ?? defaultEcommerce(),
  ecommerceEnabled: Boolean(client.ecommerce),
  ads: client.ads ?? defaultAds(),
  adsEnabled: Boolean(client.ads)
});

const fallbackClient: ClientRecord = {
  id: "nouveau-client",
  name: "Nouveau client",
  industry: "",
  summary: "",
  kpiPeriods: [
    {
      id: "periode-1",
      label: "Période en cours",
      kpis: []
    }
  ],
  monthlyHighlights: [""],
  thisMonthActions: [""],
  nextMonthActions: [""],
  initiatives: [{ title: "", status: "planning", details: "" }],
  ads: undefined,
  ecommerce: undefined
};

const sanitizeDraft = (draft: DraftClient, fallbackId: string): ClientRecord => {
  const safeString = (value?: string | null) => value?.trim() ?? "";
  const safeList = (values?: string[]) => (values ?? []).map((item) => safeString(item)).filter(Boolean);

  const kpiPeriods = (draft.kpiPeriods ?? [])
    .map((period, index) => {
      const monthlyHighlights = safeList(period?.monthlyHighlights);
      const thisMonthActions = safeList(period?.thisMonthActions);
      const nextMonthActions = safeList(period?.nextMonthActions);
      const kpis = (period?.kpis ?? [])
        .map((kpi) => ({
          label: safeString(kpi?.label),
          value: safeString(kpi?.value),
          helper: safeString(kpi?.helper)
        }))
        .filter((kpi) => kpi.label && kpi.value);

      const label = safeString(period?.label) || `Période ${index + 1}`;
      const id = safeString(period?.id) || `periode-${index + 1}`;

      return {
        id,
        label,
        kpis,
        monthlyHighlights: monthlyHighlights.length ? monthlyHighlights : [""],
        thisMonthActions: thisMonthActions.length ? thisMonthActions : [""],
        nextMonthActions: nextMonthActions.length ? nextMonthActions : [""]
      };
    })
    .filter((period) => period.label || period.kpis.length);

  if (!kpiPeriods.length) {
    kpiPeriods.push({
      id: safeString(fallbackId) || "periode-1",
      label: "Période en cours",
      kpis: [],
      monthlyHighlights: [""],
      thisMonthActions: [""],
      nextMonthActions: [""]
    });
  }

  const [firstPeriod] = kpiPeriods;

  const initiatives = (draft.initiatives ?? [])
    .map((initiative) => ({
      title: safeString(initiative?.title),
      status: initiative?.status ?? "planning",
      details: safeString(initiative?.details)
    }))
    .filter((initiative) => initiative.title && initiative.details);

  const ecommerce = draft.ecommerceEnabled
    ? {
        revenue: safeString(draft.ecommerce?.revenue),
        conversionRate: safeString(draft.ecommerce?.conversionRate),
        returningCustomers: safeString(draft.ecommerce?.returningCustomers),
        topProduct: safeString(draft.ecommerce?.topProduct),
        avgOrderValue: safeString(draft.ecommerce?.avgOrderValue),
        cartAbandonment: safeString(draft.ecommerce?.cartAbandonment)
      }
    : undefined;

  const ads = draft.adsEnabled
    ? {
        spend: safeString(draft.ads?.spend),
        roas: safeString(draft.ads?.roas),
        cpa: safeString(draft.ads?.cpa),
        impressions: safeString(draft.ads?.impressions),
        ctr: safeString(draft.ads?.ctr),
        bestChannel: safeString(draft.ads?.bestChannel)
      }
    : undefined;

  return {
    id: safeString(draft.id) || safeString(fallbackId),
    name: safeString(draft.name),
    industry: safeString(draft.industry),
    summary: safeString(draft.summary),
    kpiPeriods,
    monthlyHighlights: safeList(firstPeriod?.monthlyHighlights) ?? [],
    thisMonthActions: safeList(firstPeriod?.thisMonthActions) ?? [],
    nextMonthActions: safeList(firstPeriod?.nextMonthActions) ?? [],
    initiatives,
    ecommerce,
    ads
  };
};

export function AdminDashboard({ clients, adminName }: AdminDashboardProps) {
  const [clientData, setClientData] = useState(clients);
  const baseClient = clientData[0] ?? fallbackClient;
  const [selectedId, setSelectedId] = useState(baseClient.id);
  const [draft, setDraft] = useState(() => cloneClient(baseClient));
  const [selectedPeriodId, setSelectedPeriodId] = useState(draft.kpiPeriods[0]?.id ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const selectedClient = useMemo(
    () => clientData.find((client) => client.id === selectedId) ?? clientData[0] ?? fallbackClient,
    [clientData, selectedId]
  );

  const selectedPeriod = useMemo(
    () => draft.kpiPeriods.find((period) => period.id === selectedPeriodId) ?? draft.kpiPeriods[0],
    [draft.kpiPeriods, selectedPeriodId]
  );

  const selectClient = (id: string) => {
    const nextClient = clientData.find((client) => client.id === id);
    if (nextClient) {
      setSelectedId(id);
      const nextDraft = cloneClient(nextClient);
      setDraft(nextDraft);
      setSelectedPeriodId(nextDraft.kpiPeriods[0]?.id ?? "");
      setStatus("idle");
    }
  };

  const updateField = <K extends keyof DraftClient>(key: K, value: DraftClient[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const updatePeriodListItem = (
    periodId: string,
    key: "monthlyHighlights" | "thisMonthActions" | "nextMonthActions",
    index: number,
    value: string
  ) => {
    setDraft((prev) => ({
      ...prev,
      kpiPeriods: prev.kpiPeriods.map((period) => {
        if (period.id !== periodId) return period;
        const nextList = [...(period[key] ?? [""])];
        nextList[index] = value;
        return { ...period, [key]: nextList };
      })
    }));
  };

  const addPeriodListItem = (periodId: string, key: "monthlyHighlights" | "thisMonthActions" | "nextMonthActions") => {
    setDraft((prev) => ({
      ...prev,
      kpiPeriods: prev.kpiPeriods.map((period) =>
        period.id === periodId ? { ...period, [key]: [...(period[key] ?? []), ""] } : period
      )
    }));
  };

  const updatePeriodLabel = (periodId: string, label: string) => {
    setDraft((prev) => ({
      ...prev,
      kpiPeriods: prev.kpiPeriods.map((period) => (period.id === periodId ? { ...period, label } : period))
    }));
  };

  const updateKpi = (periodId: string, index: number, field: keyof KPI, value: string) => {
    setDraft((prev) => ({
      ...prev,
      kpiPeriods: prev.kpiPeriods.map((period) =>
        period.id === periodId
          ? {
              ...period,
              kpis: period.kpis.map((kpi, kpiIndex) =>
                kpiIndex === index ? { ...kpi, [field]: value } : kpi
              )
            }
          : period
      )
    }));
  };

  const addKpi = () => {
    if (!selectedPeriod?.id && !draft.kpiPeriods.length) {
      const newPeriod = createKpiPeriod("Période en cours");
      setDraft((prev) => ({
        ...prev,
        kpiPeriods: [{ ...newPeriod, kpis: [{ label: "", value: "", helper: "" }] }]
      }));
      setSelectedPeriodId(newPeriod.id);
      return;
    }

    const targetPeriodId = selectedPeriod?.id ?? draft.kpiPeriods[0]?.id;
    if (!targetPeriodId) return;

    setDraft((prev) => ({
      ...prev,
      kpiPeriods: prev.kpiPeriods.map((period) =>
        period.id === targetPeriodId
          ? { ...period, kpis: [...period.kpis, { label: "", value: "", helper: "" }] }
          : period
      )
    }));
  };

  const addKpiPeriod = () => {
    const newPeriod = createKpiPeriod("Nouveau mois");
    setDraft((prev) => ({
      ...prev,
      kpiPeriods: [...prev.kpiPeriods, newPeriod]
    }));
    setSelectedPeriodId(newPeriod.id);
  };

  const updateInitiative = (index: number, field: keyof Initiative, value: string) => {
    setDraft((prev) => {
      const next = [...prev.initiatives];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, initiatives: next };
    });
  };

  const addInitiative = () => {
    setDraft((prev) => ({
      ...prev,
      initiatives: [...prev.initiatives, { title: "", status: "planning", details: "" }]
    }));
  };

  const toggleEcommerce = (enabled: boolean) => {
    setDraft((prev) => ({
      ...prev,
      ecommerceEnabled: enabled,
      ecommerce: enabled ? prev.ecommerce ?? defaultEcommerce() : undefined
    }));
  };

  const toggleAds = (enabled: boolean) => {
    setDraft((prev) => ({
      ...prev,
      adsEnabled: enabled,
      ads: enabled ? prev.ads ?? defaultAds() : undefined
    }));
  };

  const handleReset = () => {
    const nextDraft = cloneClient(selectedClient);
    setDraft(nextDraft);
    setSelectedPeriodId(nextDraft.kpiPeriods[0]?.id ?? "");
    setStatus("idle");
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        setStatus("saving");
        setErrorMessage("");
        const targetId = selectedClient?.id;
        if (!targetId || targetId === fallbackClient.id) {
          setErrorMessage("Sélectionnez un client existant avant d'enregistrer.");
          setStatus("error");
          return;
        }

        const payload = sanitizeDraft(draft, targetId);

        const normalizedPayload: ClientRecord = { ...payload, id: targetId };

        const response = await fetch(`/api/clients/${targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalizedPayload)
        });

        if (!response.ok) {
          let reason = "";
          try {
            const data = await response.json();
            reason = data?.message ?? "";
          } catch {
            // noop
          }
          setErrorMessage(reason);
          setStatus("error");
          return;
        }

        setClientData((prev) => {
          const next = [...prev];
          const index = next.findIndex((client) => client.id === targetId);
          if (index === -1) {
            next.push(normalizedPayload);
          } else {
            next[index] = normalizedPayload;
          }
          return next;
        });
        const nextDraft = cloneClient(normalizedPayload);
        setDraft(nextDraft);
        setSelectedPeriodId(nextDraft.kpiPeriods[0]?.id ?? "");
        setStatus("saved");
      } catch (error) {
        console.error(error);
        setErrorMessage(error instanceof Error ? error.message : "Erreur inconnue");
        setStatus("error");
      }
    });
  };

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-white backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">Admin cockpit</p>
            <h1 className="text-2xl font-semibold">Bonjour {adminName}</h1>
            <p className="text-white/60">Sélectionnez un compte client et mettez à jour les données visibles sur son dashboard.</p>
          </div>
          <LogoutButton variant="solid" />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <aside className="space-y-3 rounded-3xl border border-white/10 bg-[rgba(16,17,33,0.85)] p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Clients</p>
          <div className="space-y-3">
            {clientData.map((client, index) => (
              <button
                key={client.id || `client-${index}`}
                onClick={() => selectClient(client.id)}
                className={clsx(
                  "w-full rounded-2xl border px-4 py-3 text-left transition",
                  selectedId === client.id
                    ? "border-[var(--amiseo-accent-strong)] bg-[var(--amiseo-accent-soft)] text-white"
                    : "border-white/10 bg-white/5 text-white/80 hover:border-white/30"
                )}
              >
                <p className="font-semibold">{client.name}</p>
                <p className="text-xs text-white/60">{client.industry}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-xs text-white/70">
            Vous pouvez ajouter un nouveau client en dupliquant un objet dans <code>data/clients.json</code> puis en reliant un
            accès dans <code>data/users.json</code>.
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-white">Résumé</p>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-white/80 hover:border-white/40"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Revenir aux données sauvegardées
                </button>
                <button
                  onClick={handleSave}
                  disabled={pending}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--amiseo-accent)] px-4 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-[var(--amiseo-accent-strong)] disabled:opacity-50"
                >
                  {status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {status === "saving" ? "Enregistrement..." : status === "saved" ? "Enregistré" : "Enregistrer les modifs"}
                </button>
                {status === "error" ? (
                  <span className="text-red-300">
                    Erreur, merci de réessayer.
                    {errorMessage ? ` (${errorMessage})` : null}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-white/80">
                Nom du compte
                <input
                  className="w-full rounded-2xl border border-white/20 bg-[rgba(28,29,45,0.78)] px-3 py-2 text-white focus:border-[var(--amiseo-accent-strong)] focus:outline-none"
                  value={draft.name}
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm text-white/80">
                Secteur / modèle
                <input
                  className="w-full rounded-2xl border border-white/20 bg-[rgba(28,29,45,0.78)] px-3 py-2 text-white focus:border-[var(--amiseo-accent-strong)] focus:outline-none"
                  value={draft.industry}
                  onChange={(event) => updateField("industry", event.target.value)}
                />
              </label>
            </div>

            <label className="mt-4 block text-sm text-white/80">
              Pitch rapide
              <textarea
                className="mt-2 w-full rounded-2xl border border-white/20 bg-[rgba(28,29,45,0.78)] px-3 py-2 text-white focus:border-[var(--amiseo-accent-strong)] focus:outline-none"
                rows={3}
                value={draft.summary}
                onChange={(event) => updateField("summary", event.target.value)}
              />
            </label>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">KPIs clés</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={addKpiPeriod}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:border-white/40"
                >
                  <Plus className="h-3.5 w-3.5" /> Ajouter un mois
                </button>
                <button
                  onClick={addKpi}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:border-white/40"
                >
                  <Plus className="h-3.5 w-3.5" /> Ajouter un KPI
                </button>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {draft.kpiPeriods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriodId(period.id)}
                  className={clsx(
                    "rounded-full border px-3 py-1 text-sm transition",
                    selectedPeriod?.id === period.id
                      ? "border-[var(--amiseo-accent-strong)] bg-[var(--amiseo-accent-soft)] text-white"
                      : "border-white/15 bg-white/5 text-white/70 hover:border-white/40"
                  )}
                >
                  {period.label || "Sans titre"}
                </button>
              ))}
            </div>

            {selectedPeriod ? (
              <div className="space-y-4">
                <label className="block text-sm text-white/80">
                  Nom du mois / période
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/20 bg-[rgba(28,29,45,0.78)] px-3 py-2 text-white focus:border-[var(--amiseo-accent-strong)] focus:outline-none"
                    value={selectedPeriod.label}
                    onChange={(event) => updatePeriodLabel(selectedPeriod.id, event.target.value)}
                  />
                </label>

                {selectedPeriod.kpis.length ? (
                  <div className="grid gap-4">
                    {selectedPeriod.kpis.map((kpi, index) => (
                      <div
                        key={`${selectedPeriod.id}-${index}`}
                        className="grid gap-3 rounded-2xl border border-white/10 bg-[rgba(26,27,41,0.7)] p-4 md:grid-cols-3"
                      >
                        <input
                          className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
                          placeholder="Label"
                          value={kpi.label}
                          onChange={(event) => updateKpi(selectedPeriod.id, index, "label", event.target.value)}
                        />
                        <input
                          className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
                          placeholder="Valeur"
                          value={kpi.value}
                          onChange={(event) => updateKpi(selectedPeriod.id, index, "value", event.target.value)}
                        />
                        <input
                          className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
                          placeholder="Commentaire"
                          value={kpi.helper ?? ""}
                          onChange={(event) => updateKpi(selectedPeriod.id, index, "helper", event.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-center text-sm text-white/60">
                    Aucun KPI pour cette période. Ajoutez un KPI pour commencer.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/60">Ajoutez au moins un mois pour saisir des KPIs.</p>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {selectedPeriod ? (
              (["monthlyHighlights", "thisMonthActions", "nextMonthActions"] as const).map((key) => (
                <div key={key} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-3 flex items-center justify-between text-sm font-semibold text-white">
                    <p>
                      {key === "monthlyHighlights"
                        ? "Ce qu'il faut retenir"
                        : key === "thisMonthActions"
                        ? "Actions livrées"
                        : "À lancer"}
                    </p>
                    <button
                      onClick={() => addPeriodListItem(selectedPeriod.id, key)}
                      className="text-xs text-white/70 hover:text-white"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(selectedPeriod[key] ?? [""]).map((item, index) => (
                      <textarea
                        key={index}
                        className="w-full rounded-2xl border border-white/10 bg-[rgba(26,27,41,0.7)] px-3 py-2 text-sm text-white focus:border-[var(--amiseo-accent-strong)] focus:outline-none"
                        rows={3}
                        placeholder="Bullet point"
                        value={item}
                        onChange={(event) => updatePeriodListItem(selectedPeriod.id, key, index, event.target.value)}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">Ajoutez une période pour saisir les highlights et actions.</p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Initiatives suivies</p>
              <button
                onClick={addInitiative}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:border-white/40"
              >
                <Plus className="h-3.5 w-3.5" /> Ajouter un bloc
              </button>
            </div>
            <div className="space-y-4">
              {draft.initiatives.map((initiative, index) => (
                <div key={index} className="grid gap-3 rounded-2xl border border-white/10 bg-[rgba(26,27,41,0.7)] p-4 md:grid-cols-[1fr,150px]">
                  <input
                    className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
                    placeholder="Canal / focus"
                    value={initiative.title}
                    onChange={(event) => updateInitiative(index, "title", event.target.value)}
                  />
                  <select
                    className="rounded-xl border border-white/30 bg-white/90 px-3 py-2 text-sm font-medium text-slate-900 focus:border-[var(--amiseo-accent-strong)] focus:outline-none"
                    value={initiative.status}
                    onChange={(event) => updateInitiative(index, "status", event.target.value as Initiative["status"])}
                  >
                    <option value="active">Actif</option>
                    <option value="monitoring">Surveillance</option>
                    <option value="planning">Planifié</option>
                    <option value="paused">En pause</option>
                  </select>
                  <textarea
                    className="md:col-span-2 rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
                    placeholder="Détails"
                    rows={2}
                    value={initiative.details}
                    onChange={(event) => updateInitiative(index, "details", event.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Bloc e-commerce</p>
              <label className="inline-flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={draft.ecommerceEnabled}
                  onChange={(event) => toggleEcommerce(event.target.checked)}
                  className="h-4 w-4 rounded border-white/30 bg-transparent text-[var(--amiseo-accent)] focus:ring-[var(--amiseo-accent-strong)]"
                />
                Afficher pour ce client
              </label>
            </div>

            {draft.ecommerceEnabled && draft.ecommerce ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(draft.ecommerce).map(([key, value]) => (
                  <label key={key} className="text-xs uppercase tracking-[0.3em] text-white/60">
                    {labelForEcommerceKey(key)}
                    <input
                      className="mt-2 w-full rounded-2xl border border-white/20 bg-[rgba(26,27,41,0.7)] px-3 py-2 text-sm text-white focus:border-[var(--amiseo-accent-strong)] focus:outline-none"
                      value={value}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          ecommerce: {
                            ...prev.ecommerce!,
                            [key]: event.target.value
                          }
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/50">Activez la bascule pour afficher les KPIs e-commerce.</p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Bloc Ads</p>
              <label className="inline-flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={draft.adsEnabled}
                  onChange={(event) => toggleAds(event.target.checked)}
                  className="h-4 w-4 rounded border-white/30 bg-transparent text-[var(--amiseo-accent)] focus:ring-[var(--amiseo-accent-strong)]"
                />
                Afficher pour ce client
              </label>
            </div>

            {draft.adsEnabled && draft.ads ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(draft.ads).map(([key, value]) => (
                  <label key={key} className="text-xs uppercase tracking-[0.3em] text-white/60">
                    {labelForAdsKey(key)}
                    <input
                      className="mt-2 w-full rounded-2xl border border-white/20 bg-[rgba(26,27,41,0.7)] px-3 py-2 text-sm text-white focus:border-[var(--amiseo-accent-strong)] focus:outline-none"
                      value={value}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          ads: {
                            ...prev.ads!,
                            [key]: event.target.value
                          }
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/50">Activez la bascule pour suivre vos indicateurs médias payants.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const labelForEcommerceKey = (key: string) => {
  switch (key) {
    case "revenue":
      return "Revenu";
    case "conversionRate":
      return "Taux de conversion";
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
