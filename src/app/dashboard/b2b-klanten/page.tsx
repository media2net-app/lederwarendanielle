"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { B2BKlant } from "@/lib/b2b-shared";
import { getMerkById } from "@/lib/merken";

export default function B2BKlantenPage() {
  const router = useRouter();
  const [klanten, setKlanten] = useState<B2BKlant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/b2b-klanten")
      .then(async (res) => {
        const payload = (await res.json()) as { data?: B2BKlant[]; error?: string };
        if (!res.ok) throw new Error(payload.error ?? "Kon B2B klanten niet laden.");
        setKlanten(payload.data ?? []);
      })
      .catch(() => setKlanten([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">B2B klanten</h2>
        <p className="mb-8 text-gray-600">
          Zakelijke klanten die producten wederverkopen. Beheer contactgegevens en welke merken zij afnemen.
        </p>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Bedrijf</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Plaats / Land</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Merken</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Klant sinds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {klanten.map((k) => (
                <tr
                  key={k.id}
                  onClick={() => router.push(`/dashboard/b2b-klanten/${k.id}`)}
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/dashboard/b2b-klanten/${k.id}`);
                    }
                  }}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{k.bedrijfsnaam}</td>
                  <td className="px-4 py-3 text-sm text-gray-600" onClick={(e) => e.stopPropagation()}>
                    {k.contactpersoon}
                    <br />
                    <a href={`mailto:${k.email}`} className="text-black hover:underline">{k.email}</a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{k.plaats}, {k.land}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {k.merken.map((m) => getMerkById(m)?.naam ?? m).join(", ")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        k.status === "actief" ? "bg-green-100 text-green-800" : k.status === "prospect" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {k.status === "actief" ? "Actief" : k.status === "prospect" ? "Prospect" : "Inactief"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{k.klantSinds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {klanten.length === 0 && (
          <p className="mt-4 text-center text-sm text-gray-500">
            {loading ? "B2B klanten laden..." : "Geen B2B klanten."}
          </p>
        )}
      </div>
    </main>
  );
}
