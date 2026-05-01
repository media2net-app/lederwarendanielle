"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MERKEN, getMerkById } from "@/lib/merken";
import type { Product } from "@/lib/products-shared";

function formatPrijs(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

function ProductRow({ p, merk }: { p: Product; merk: ReturnType<typeof getMerkById> }) {
  const router = useRouter();
  return (
    <tr
      onClick={() => router.push(`/dashboard/producten/${p.id}`)}
      className="cursor-pointer hover:bg-gray-100 transition-colors"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/dashboard/producten/${p.id}`);
        }
      }}
    >
      <td className="px-4 py-3">
        {p.imageUrl ? (
          <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-100">
            <Image
              src={p.imageUrl}
              alt={p.naam}
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.naam}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{p.sku}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{merk?.naam ?? p.merkId}</td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">{formatPrijs(p.prijs)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">{p.voorraad ?? "—"}</td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        {p.productUrl && (
          <a
            href={p.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-black hover:underline"
          >
            Webshop →
          </a>
        )}
      </td>
    </tr>
  );
}

export default function ProductenPage() {
  const [merkFilter, setMerkFilter] = useState<string>("");
  const [producten, setProducten] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = merkFilter ? `/api/producten?merkId=${encodeURIComponent(merkFilter)}` : "/api/producten";
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => setProducten(Array.isArray(data) ? data : []))
      .catch(() => setProducten([]))
      .finally(() => setLoading(false));
  }, [merkFilter]);

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Producten</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/producten/nieuw"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Nieuw product
            </Link>
            <Link
              href="/dashboard/producten/import"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              CSV importeren
            </Link>
            <Link
              href="/dashboard/producten/fotos"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Fotobibliotheek
            </Link>
            <label className="flex items-center gap-2 text-sm text-gray-600">
            <span>Merk:</span>
            <select
              value={merkFilter}
              onChange={(e) => setMerkFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="">Alle merken</option>
              {MERKEN.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.naam}
                </option>
              ))}
            </select>
          </label>
          </div>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Laden…</p>
        ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Afbeelding</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Naam</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Merk</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Prijs</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Voorraad</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {producten.map((p) => (
                <ProductRow key={p.id} p={p} merk={getMerkById(p.merkId)} />
              ))}
            </tbody>
          </table>
        </div>
        )}
        {!loading && producten.length === 0 && (
          <p className="mt-4 text-center text-sm text-gray-500">Geen producten gevonden.</p>
        )}
      </div>
    </main>
  );
}
