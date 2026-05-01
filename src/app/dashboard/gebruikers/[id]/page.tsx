"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Medewerker } from "@/lib/users-shared";

const ROLE_OPTIONS = ["Admin", "Manager", "Medewerker"];
const RIGHTS_OPTIONS = [
  "Gebruikers beheren",
  "Bestellingen beheren",
  "Tickets beheren",
  "Taken beheren",
  "Voorraad beheren",
  "Rapportages bekijken",
  "Planning bekijken",
  "AI acties uitvoeren",
  "AI assistent gebruiken",
  "Productcontent beheren",
  "Campagnes bekijken",
];

function formatDate(iso?: string) {
  if (!iso) return "Nog niet bekend";
  return new Date(iso).toLocaleString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GebruikerDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [account, setAccount] = useState<Medewerker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [formState, setFormState] = useState<Medewerker | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    fetch(`/api/users/${id}`)
      .then(async (res) => {
        const payload = (await res.json()) as { data?: Medewerker; error?: string };
        if (!res.ok) throw new Error(payload.error ?? "Kon gebruiker niet laden.");
        if (mounted) {
          setAccount(payload.data ?? null);
          setFormState(payload.data ?? null);
        }
      })
      .catch((err: unknown) => {
        if (mounted) setError(err instanceof Error ? err.message : "Kon gebruiker niet laden.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (!id) {
    return (
      <main className="flex-1">
        <div className="w-full pl-10 pr-6 py-8">
          <p className="text-gray-500">Gebruiker niet gevonden.</p>
          <Link href="/dashboard/gebruikers" className="mt-4 inline-block text-sm text-black hover:underline">
            ← Terug naar gebruikers
          </Link>
        </div>
      </main>
    );
  }

  const toggleRight = (right: string) => {
    setFormState((current) => {
      if (!current) return current;
      const rights = current.rechten.includes(right)
        ? current.rechten.filter((item) => item !== right)
        : [...current.rechten, right];
      return { ...current, rechten: rights };
    });
  };

  const saveAccount = () => {
    if (!id || !formState) return;
    setError(null);
    fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formState),
    })
      .then(async (res) => {
        const payload = (await res.json()) as { data?: Medewerker; error?: string };
        if (!res.ok) throw new Error(payload.error ?? "Opslaan mislukt.");
        setAccount(payload.data ?? null);
        setFormState(payload.data ?? null);
        setSaveNotice(password ? "Account en wachtwoordinstelling opgeslagen." : "Account opgeslagen.");
        setPassword("");
        setTimeout(() => setSaveNotice(null), 2500);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Opslaan mislukt.");
      });
  };

  if (loading) {
    return (
      <main className="flex-1">
        <div className="w-full pl-10 pr-6 py-8">
          <p className="text-gray-500">Gebruiker laden...</p>
        </div>
      </main>
    );
  }

  if (!formState || !account) {
    return (
      <main className="flex-1">
        <div className="w-full pl-10 pr-6 py-8">
          <p className="text-gray-500">{error ?? "Gebruiker niet gevonden."}</p>
          <Link href="/dashboard/gebruikers" className="mt-4 inline-block text-sm text-black hover:underline">
            ← Terug naar gebruikers
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href="/dashboard/gebruikers" className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          ← Terug naar gebruikers
        </Link>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{formState.naam}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Beheer accountgegevens, rechten en status van deze medewerker.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
            <div>Laatst ingelogd: <span className="font-medium text-gray-900">{formatDate(formState.laatsteLogin)}</span></div>
            <div className="mt-1">Status: <span className="font-medium text-gray-900">{formState.actief ? "Actief" : "Inactief"}</span></div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Accountinstellingen</h2>
            {saveNotice && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{saveNotice}</p>}
            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Naam</label>
                <input
                  type="text"
                  value={formState.naam}
                  onChange={(e) => setFormState({ ...formState, naam: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Gebruikersnaam</label>
                <input
                  type="text"
                  value={formState.gebruikersnaam}
                  onChange={(e) => setFormState({ ...formState, gebruikersnaam: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">E-mail</label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Wachtwoord</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nieuw wachtwoord instellen"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Rol</label>
                <select
                  value={formState.rol}
                  onChange={(e) => setFormState({ ...formState, rol: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Afdeling</label>
                <input
                  type="text"
                  value={formState.afdeling}
                  onChange={(e) => setFormState({ ...formState, afdeling: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Account actief</p>
                <p className="text-xs text-gray-500">Bepaal of deze gebruiker toegang heeft tot het systeem.</p>
              </div>
              <input
                type="checkbox"
                checked={formState.actief}
                onChange={(e) => setFormState({ ...formState, actief: e.target.checked })}
              />
            </div>

            <div className="mt-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">Merkfocus</label>
              <input
                type="text"
                value={formState.merkFocus.join(", ")}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    merkFocus: e.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Bijv. Orange Fire, Leather Design"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={saveAccount}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Opslaan
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Rechten</h2>
            <p className="mt-2 text-sm text-gray-600">Selecteer welke onderdelen en acties deze gebruiker mag beheren.</p>

            <div className="mt-5 space-y-2">
              {RIGHTS_OPTIONS.map((right) => {
                const checked = formState.rechten.includes(right);
                return (
                  <label
                    key={right}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm transition-colors ${
                      checked ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50 hover:bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRight(right)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={checked ? "text-emerald-900" : "text-gray-800"}>{right}</span>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-900">Huidige samenvatting</p>
              <p className="mt-2 text-sm text-gray-600">Open taken: {formState.openTaken}</p>
              <p className="mt-1 text-sm text-gray-600">Afdeling: {formState.afdeling}</p>
              <p className="mt-1 text-sm text-gray-600">Rol: {formState.rol}</p>
              <p className="mt-1 text-sm text-gray-600">Aantal rechten: {formState.rechten.length}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
