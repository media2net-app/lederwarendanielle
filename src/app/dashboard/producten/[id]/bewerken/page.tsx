"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MERKEN } from "@/lib/merken";
import type { Product } from "@/lib/mock-producten";

type UploadFile = { name: string; url: string };

export default function BewerkProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryFiles, setLibraryFiles] = useState<UploadFile[]>([]);
  const [form, setForm] = useState({
    merkId: "",
    naam: "",
    sku: "",
    prijs: "",
    voorraad: "",
    imageUrl: "",
    productUrl: "",
    beschrijving: "",
    specificaties: "",
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/producten/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setProduct(null);
          return;
        }
        setProduct(data);
        setForm({
          merkId: data.merkId ?? "",
          naam: data.naam ?? "",
          sku: data.sku ?? "",
          prijs: String(data.prijs ?? ""),
          voorraad: data.voorraad != null ? String(data.voorraad) : "",
          imageUrl: data.imageUrl ?? "",
          productUrl: data.productUrl ?? "",
          beschrijving: data.beschrijving ?? "",
          specificaties: data.specificaties ?? "",
        });
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetch("/api/upload/producten")
      .then((r) => r.json())
      .then((data) => setLibraryFiles(data.files ?? []))
      .catch(() => setLibraryFiles([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    const prijs = parseFloat(form.prijs.replace(",", "."));
    if (isNaN(prijs) || prijs < 0) {
      setError("Voer een geldige prijs in.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/producten/${id}`, {
        method: "PATCH",
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
        setError(data.error ?? "Kon product niet bijwerken.");
        setSaving(false);
        return;
      }
      router.push(`/dashboard/producten/${id}`);
      router.refresh();
    } catch {
      setError("Kon geen verbinding maken.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1">
        <div className="w-full pl-10 pr-6 py-8">
          <p className="text-gray-500">Laden…</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex-1">
        <div className="w-full pl-10 pr-6 py-8">
          <p className="text-gray-500">Product niet gevonden.</p>
          <Link href="/dashboard/producten" className="mt-4 inline-block text-sm text-black hover:underline">
            ← Terug
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href={`/dashboard/producten/${id}`} className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          ← Terug naar product
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Product bewerken</h1>
        <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
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
              <label className="block text-sm font-medium text-gray-700">Prijs (€) *</label>
              <input
                type="text"
                value={form.prijs}
                onChange={(e) => setForm((f) => ({ ...f, prijs: e.target.value }))}
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
            {libraryFiles.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">Kies uit fotobibliotheek:</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {libraryFiles.slice(0, 12).map((f) => (
                <button
                  key={f.url}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, imageUrl: f.url }))}
                  className={`relative h-14 w-14 overflow-hidden rounded border-2 ${
                    form.imageUrl === f.url ? "border-black" : "border-gray-200"
                  }`}
                >
                  <Image src={f.url} alt={f.name} fill className="object-cover" sizes="56px" unoptimized />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product URL (webshop)</label>
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
              disabled={saving}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Opslaan…" : "Opslaan"}
            </button>
            <Link
              href={`/dashboard/producten/${id}`}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Annuleren
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
