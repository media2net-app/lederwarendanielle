"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function NieuweGebruikerPage() {
  const router = useRouter();
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [formState, setFormState] = useState<Medewerker>({
    id: `m-${Date.now()}`,
    naam: "",
    gebruikersnaam: "",
    rol: "Medewerker",
    afdeling: "",
    email: "",
    actief: true,
    openTaken: 0,
    merkFocus: [],
    rechten: ["AI assistent gebruiken"],
    laatsteLogin: undefined,
  });

  const toggleRight = (right: string) => {
    setFormState((current) => ({
      ...current,
      rechten: current.rechten.includes(right)
        ? current.rechten.filter((item) => item !== right)
        : [...current.rechten, right],
    }));
  };

  const saveUser = () => {
    if (!formState.naam.trim() || !formState.email.trim() || !formState.gebruikersnaam.trim()) return;
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formState,
        laatsteLogin: formState.laatsteLogin ?? new Date().toISOString(),
      }),
    })
      .then(async (res) => {
        const payload = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(payload.error ?? "Opslaan mislukt.");
        setSaveNotice(password ? "Nieuwe gebruiker en wachtwoordinstelling opgeslagen." : "Nieuwe gebruiker opgeslagen.");
        setTimeout(() => {
          setSaveNotice(null);
          router.push("/dashboard/gebruikers");
        }, 1200);
      })
      .catch((err: unknown) => {
        setSaveNotice(err instanceof Error ? err.message : "Opslaan mislukt.");
      });
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href="/dashboard/gebruikers" className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          ← Terug naar gebruikers
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Gebruiker toevoegen</h1>
          <p className="mt-2 text-sm text-gray-600">
            Maak een nieuw medewerkeraccount aan met accountgegevens, rol en rechten.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Accountinstellingen</h2>
            {saveNotice && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{saveNotice}</p>}

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
                <p className="text-xs text-gray-500">Bepaal of deze gebruiker direct toegang krijgt.</p>
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
                onClick={saveUser}
                disabled={!formState.naam.trim() || !formState.email.trim() || !formState.gebruikersnaam.trim()}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Gebruiker opslaan
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
          </div>
        </div>
      </div>
    </main>
  );
}
