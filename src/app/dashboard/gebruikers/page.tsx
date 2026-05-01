 "use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Medewerker } from "@/lib/users-shared";

export default function GebruikersPage() {
  const [medewerkers, setMedewerkers] = useState<Medewerker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/users")
      .then(async (res) => {
        const payload = (await res.json()) as { data?: Medewerker[]; error?: string };
        if (!res.ok) throw new Error(payload.error ?? "Kon gebruikers niet laden.");
        if (mounted) setMedewerkers(payload.data ?? []);
      })
      .catch((err: unknown) => {
        if (mounted) setError(err instanceof Error ? err.message : "Kon gebruikers niet laden.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const actiefAantal = medewerkers.filter((medewerker) => medewerker.actief).length;
  const afdelingen = useMemo(
    () => Array.from(new Set(medewerkers.map((medewerker) => medewerker.afdeling))),
    [medewerkers]
  );

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gebruikers</h1>
            <p className="mt-2 text-sm text-gray-600">
              Overzicht van alle medewerkeraccounts, inclusief rol, afdeling, status en merkfocus.
            </p>
          </div>
          <div className="flex min-w-[260px] flex-wrap items-stretch gap-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Actieve accounts</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{actiefAantal}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Afdelingen</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{afdelingen.length}</p>
            </div>
            <Link
              href="/dashboard/gebruikers/nieuw"
              className="inline-flex items-center rounded-2xl bg-black px-4 py-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
            >
              Gebruiker toevoegen
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {afdelingen.map((afdeling) => {
            const aantal = medewerkers.filter((medewerker) => medewerker.afdeling === afdeling).length;
            return (
              <div key={afdeling} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{afdeling}</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{aantal}</p>
                <p className="mt-1 text-sm text-gray-500">accounts</p>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Naam</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Gebruikersnaam</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">E-mail</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Afdeling</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Open taken</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Merkfocus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading && (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-500" colSpan={8}>
                    Gebruikers laden...
                  </td>
                </tr>
              )}
              {!loading && medewerkers.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-500" colSpan={8}>
                    Nog geen gebruikers gevonden in de database.
                  </td>
                </tr>
              )}
              {medewerkers.map((medewerker) => (
                <tr key={medewerker.id} className="cursor-pointer hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900">
                    <Link href={`/dashboard/gebruikers/${medewerker.id}`} className="hover:underline">
                      {medewerker.naam}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{medewerker.gebruikersnaam}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{medewerker.email}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{medewerker.rol}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{medewerker.afdeling}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        medewerker.actief ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {medewerker.actief ? "Actief" : "Inactief"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-gray-900">{medewerker.openTaken}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {medewerker.merkFocus.length > 0 ? medewerker.merkFocus.join(", ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
