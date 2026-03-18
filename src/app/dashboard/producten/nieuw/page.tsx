"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MERKEN } from "@/lib/merken";

export default function NieuwProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    merkId: MERKEN[0]?.id ?? "",
    naam: "",
    sku: "",
    prijs: "",
    voorraad: "",
    imageUrl: "",
    productUrl: "",
    beschrijving: "",
    specificaties: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const prijs = parseFloat(form.prijs.replace(",", "."));
    if (isNaN(prijs) || prijs < 0) {
      setError("Voer een geldige prijs in.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/producten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merkId: form.merkId,
          naam: form.naam.trim(),
          sku: form.sku.trim(),
          prijs,
          voorraad: form.voorraad ? parseInt(form.voorraad, 10) : undefined,
          imageUrl: form.imageUrl.trim() || undefined,
          productUrl: form.productUrl.trim() || undefined,
          beschrijving: form.beschrijving.trim() || undefined,
          specificaties: form.specificaties.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kon product niet aanmaken.");
        setLoading(false);
        return;
      }
      router.push("/dashboard/producten/" + data.id);
      router.refresh();
    } catch {
      setError("Kon geen verbinding maken.");
      setLoading(false);
    }
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href="/dashboard/producten" className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          Terug naar producten
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Nieuw product</h1>
        <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Merk *</label>
            <select
              value={form.merkId}
              onChange={(e) => setForm((f) => ({ ...f, merkId: e.target.value }))}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              {MERKEN.map((m) => (
                <option key={m.id} value={m.id}>{m.naam}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Naam *</label>
            <input
              type="text"
              value={form.naam}
              onChange={(e) => setForm((f) => ({ ...f, naam: e.target.value }))}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU *</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Prijs (euro) *</label>
              <input
                type="text"
                value={form.prijs}
                onChange={(e) => setForm((f) => ({ ...f, prijs: e.target.value }))}
                placeholder="0.00"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Voorraad</label>
              <input
                type="number"
                min={0}
                value={form.voorraad}
                onChange={(e) => setForm((f) => ({ ...f, voorraad: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Afbeelding URL</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product URL webshop</label>
            <input
              type="url"
              value={form.productUrl}
              onChange={(e) => setForm((f) => ({ ...f, productUrl: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Beschrijving</label>
            <textarea
              value={form.beschrijving}
              onChange={(e) => setForm((f) => ({ ...f, beschrijving: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Specificaties</label>
            <textarea
              value={form.specificaties}
              onChange={(e) => setForm((f) => ({ ...f, specificaties: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Opslaan..." : "Product aanmaken"}
            </button>
            <Link href="/dashboard/producten" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
              Annuleren
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
