"use client";

import { useEffect, useState } from "react";

const services = [
  { id: "whatsapp", name: "WhatsApp", category: "Klantcontact", status: "Ontvangen en verzenden voorbereid", description: "Breng klantvragen en antwoorden samen in de klantenservice.", url: "https://business.facebook.com/", link: "Open Meta Business", steps: ["Beheerder en zakelijk telefoonnummer bevestigen", "Meta-app, nummer-ID en toegangstoken in de serverconfiguratie laten instellen", "Webhook laten instellen op https://app.lederwaren-danielle.nl/api/webhooks/whatsapp/meta", "Testbericht ontvangen als ticket en vanuit het portaal beantwoorden"] },
  { id: "exact", name: "Exact Online", category: "Administratie", status: "Autorisatie nog afronden", description: "Spreek af welke klanten, orders en facturen uitgewisseld moeten worden.", url: "https://apps.exactonline.com/", link: "Open Exact App Center", steps: ["Beheerder en juiste administratie bevestigen", "Kiezen welke gegevens de eerste koppeling moet synchroniseren", "App-registratie en toegang beschikbaar maken voor Chiel", "Chiel rondt autorisatie en tokenverversing af; samen een testrecord controleren"] },
  { id: "email", name: "E-mail", category: "Klantcontact", status: "Inkomend en uitgaand aansluiten", description: "Ontvang vragen in tickets en antwoord vanuit de juiste mailbox.", url: "", link: "", steps: ["Mailboxen, afzendernamen en mailprovider vaststellen", "Mailbeheerder toegang laten regelen", "Inkomende mail en SMTP-verzending door Chiel laten aansluiten", "Testmail ontvangen en beantwoorden; afzender en bezorging controleren"] },
  { id: "supabase", name: "Database & gebruikers", category: "Basis", status: "Login en rechten afronden", description: "Zorg dat gebruikers veilig kunnen inloggen en gegevens bewaard blijven.", url: "https://supabase.com/dashboard", link: "Open Supabase", steps: ["Toegang tot het juiste Supabase-project bevestigen", "Gebruikers en hun rollen afspreken", "Chiel controleert schema, opslag en toegangsrechten en bouwt echte login", "Inloggen, uitloggen en opslaan testen met twee verschillende rollen"] },
  { id: "webshops", name: "Webshops", category: "Verkoop", status: "Eerste webshop kiezen", description: "Begin met één merk en spreek de richting van de synchronisatie af.", url: "", link: "", steps: ["Eerste merk, webshop-URL en platform kiezen", "Bepalen of orders, producten en/of voorraad moeten synchroniseren", "Webshopbeheerder API-toegang laten regelen", "Chiel bouwt de sync; samen één order en voorraadwijziging controleren"] },
  { id: "hermes", name: "Hermes & AI", category: "Automatisering", status: "Server en eerste taken bevestigen", description: "Start met dagsamenvattingen en conceptantwoorden op basis van portaalgegevens.", url: "https://hpanel.hostinger.com/", link: "Open Hostinger", steps: ["Met Patrick bevestigen of de VPS is besteld", "Servertoegang voor Chiel regelen", "Eerste taken, AI-account en gebruiksbudget afspreken", "Chiel installeert en koppelt Hermes; samen een taak en herstart testen"] },
  { id: "webchat", name: "Websitechat", category: "Optioneel", status: "Scope bepalen", description: "Voeg chatvragen van de website toe als dit bij de eerste oplevering hoort.", url: "", link: "", steps: ["Besluiten of websitechat nu nodig is", "Website en chatprovider kiezen", "Beheerderstoegang en widgetplaatsing regelen", "Chiel sluit ontvangst aan; samen een chatbericht als ticket testen"] },
];

type Progress = Record<string, { owner: string; due: string; checked: boolean[] }>;
const storageKey = "ld-koppelingen-v1";

function readProgress(value: unknown): Progress {
  const result: Progress = {};
  if (!value || typeof value !== "object") return result;
  for (const service of services) {
    const entry = (value as Record<string, unknown>)[service.id];
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    result[service.id] = {
      owner: typeof row.owner === "string" ? row.owner.slice(0, 100) : "",
      due: typeof row.due === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.due) ? row.due : "",
      checked: service.steps.map((_, index) => Array.isArray(row.checked) && row.checked[index] === true),
    };
  }
  return result;
}

export default function KoppelingenPage() {
  const [progress, setProgress] = useState<Progress>({});
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState("Alles");

  useEffect(() => {
    try { setProgress(readProgress(JSON.parse(localStorage.getItem(storageKey) || "{}"))); }
    catch { setSaved(false); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); setSaved(true); }
    catch { setSaved(false); }
  }, [progress, ready]);

  const completed = services.reduce((count, service) => count + service.steps.filter((_, index) => progress[service.id]?.checked[index]).length, 0);
  const total = services.reduce((count, service) => count + service.steps.length, 0);

  function update(id: string, values: Partial<Progress[string]>) {
    setProgress(current => ({ ...current, [id]: { ...(current[id] || { owner: "", due: "", checked: [] }), ...values } }));
  }

  function download() {
    const content = ["Lederwaren Daniëlle — Koppelingen", `Calloverzicht · ${new Date().toLocaleDateString("nl-NL")}`, "Handmatig bijgehouden; geen automatische verbindingscontrole.", ...services.flatMap(service => ["", service.name, `Eigenaar: ${progress[service.id]?.owner || "Nog afspreken"} | Datum: ${progress[service.id]?.due || "Nog afspreken"}`, ...service.steps.map((step, index) => `${progress[service.id]?.checked[index] ? "[x]" : "[ ]"} ${step}`)])].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "lederwaren-danielle-koppelingen.txt"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <main className="integrations-page mx-auto w-full max-w-7xl p-5 md:p-10 text-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-800">Samen aansluiten</p><h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Koppelingen</h1><p className="mt-3 max-w-2xl text-slate-600">Loop de diensten samen na, verdeel de acties en test de verbindingen stap voor stap.</p></div>
        <button disabled={!ready} onClick={download} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Download calloverzicht ↓</button>
      </div>
      <section aria-label="Voortgang" className="my-7 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><span className="text-2xl font-semibold">{completed} <span className="text-base font-normal text-slate-500">van {total} stappen afgevinkt</span></span><p className="mt-1 text-sm text-slate-500">Afgevinkte stappen zijn jullie eigen registratie, geen automatische verbindingstest.</p></div><span role="status" className="text-sm text-slate-600">{!ready ? "Voortgang laden…" : saved ? "Opgeslagen in deze browser" : "Opslaan niet beschikbaar — download je overzicht"}</span></div>
        <div role="progressbar" aria-label="Afgevinkte stappen" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed} className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-amber-700 transition-all" style={{ width: `${completed / total * 100}%` }} /></div>
      </section>
      <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Gebruik de beheerschermen voor toegang en sleutels. Vul hier alleen een actiehouder en datum in. Dit overzicht koppelt accounts niet automatisch en wordt niet gedeeld tussen apparaten. Uitgangsstatus: inventarisatie 6 oktober 2026.</p>
      <div className="mb-6 flex flex-wrap gap-2" aria-label="Filter koppelingen">{["Alles", "Basis", "Klantcontact", "Administratie", "Verkoop", "Automatisering", "Optioneel"].map(category => <button key={category} aria-pressed={filter === category} onClick={() => setFilter(category)} className={`rounded-full border px-4 py-2 text-sm ${filter === category ? "border-slate-900 bg-slate-900 text-white" : "border-stone-200 bg-white text-slate-600"}`}>{category}</button>)}</div>
      <div className="grid gap-5 xl:grid-cols-2">{services.filter(service => filter === "Alles" || service.category === filter).map(service => {
        const state = progress[service.id];
        return <section key={service.id} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{service.category}</p><h2 className="mt-1 text-xl font-semibold">{service.name}</h2></div><span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-slate-600">{service.steps.filter((_, index) => state?.checked[index]).length} / {service.steps.length}</span></div>
          <p className="mt-3 text-sm text-slate-600">{service.description}</p><p className="mt-3 text-xs font-medium text-amber-800">Uitgangsstatus · {service.status}</p>
          <fieldset disabled={!ready} className="my-5 space-y-3"><legend className="sr-only">Stappen voor {service.name}</legend>{service.steps.map((step, index) => <label key={step} className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-100 p-3 text-sm leading-6 hover:bg-stone-50"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-amber-800" checked={state?.checked[index] || false} onChange={event => { const checked = service.steps.map((_, i) => state?.checked[i] || false); checked[index] = event.target.checked; update(service.id, { checked }); }} /><span className={state?.checked[index] ? "text-slate-500" : ""}>{step}</span></label>)}</fieldset>
          <div className="mt-auto grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-slate-600">Actiehouder<input type="text" disabled={!ready} maxLength={100} value={state?.owner || ""} onChange={event => update(service.id, { owner: event.target.value })} placeholder="Samen afspreken" className="mt-1 block w-full rounded-lg border border-stone-300 bg-white p-2.5 text-sm text-slate-900" /></label><label className="text-xs font-medium text-slate-600">Afgesproken datum<input disabled={!ready} type="date" value={state?.due || ""} onChange={event => update(service.id, { due: event.target.value })} className="mt-1 block w-full rounded-lg border border-stone-300 bg-white p-2.5 text-sm text-slate-900" /></label></div>
          {service.url && <a href={service.url} target="_blank" rel="noopener noreferrer" className="mt-4 text-sm font-semibold text-amber-900 underline underline-offset-4">{service.link} ↗</a>}
        </section>;
      })}</div>
    </main>
  );
}
