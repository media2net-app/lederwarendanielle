"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type UploadFile = { name: string; url: string };
type Product = { id: string; naam: string; sku: string };

export default function FotobibliotheekPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [producten, setProducten] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [linkProductId, setLinkProductId] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkAsMain, setLinkAsMain] = useState(true);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  const loadFiles = () => {
    fetch("/api/upload/producten")
      .then((r) => r.json())
      .then((data) => setFiles(data.files ?? []))
      .catch(() => setFiles([]));
  };

  const loadProducten = () => {
    fetch("/api/producten")
      .then((r) => r.json())
      .then((data) => setProducten(Array.isArray(data) ? data : []))
      .catch(() => setProducten([]));
  };

  useEffect(() => {
    loadFiles();
    loadProducten();
    setLoading(false);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected?.length) return;
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < selected.length; i++) formData.append("files", selected[i]);
    try {
      const res = await fetch("/api/upload/producten", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.urls?.length) {
        loadFiles();
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleKoppel = async () => {
    if (!linkProductId || !linkUrl) return;
    setLinkSuccess(null);
    try {
      if (linkAsMain) {
        const res = await fetch(`/api/producten/${linkProductId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: linkUrl }),
        });
        if (!res.ok) {
          const data = await res.json();
          setLinkSuccess("Fout: " + (data.error ?? "onbekend"));
          return;
        }
      } else {
        const pRes = await fetch(`/api/producten/${linkProductId}`);
        const pData = await pRes.json();
        const existing = pData.imageUrls ?? [];
        if (!existing.includes(linkUrl)) {
          const res = await fetch(`/api/producten/${linkProductId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrls: [...existing, linkUrl] }),
          });
          if (!res.ok) {
            const data = await res.json();
            setLinkSuccess("Fout: " + (data.error ?? "onbekend"));
            return;
          }
        }
      }
      setLinkSuccess("Gekoppeld.");
      setLinkUrl("");
    } catch {
      setLinkSuccess("Fout bij koppelen.");
    }
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href="/dashboard/producten" className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          Terug naar producten
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Fotobibliotheek</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload foto’s en koppel ze aan een product als hoofdfoto of galerij.
        </p>

        <div className="mt-6">
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="sr-only"
            />
            {uploading ? "Uploaden..." : "Foto’s uploaden"}
          </label>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-medium uppercase text-gray-500">Koppel aan product</h2>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-gray-500">Product</label>
              <select
                value={linkProductId}
                onChange={(e) => setLinkProductId(e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              >
                <option value="">Kies product</option>
                {producten.map((p) => (
                  <option key={p.id} value={p.id}>{p.naam} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500">Foto</label>
              <select
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              >
                <option value="">Kies foto</option>
                {files.map((f) => (
                  <option key={f.url} value={f.url}>{f.name}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={linkAsMain}
                onChange={(e) => setLinkAsMain(e.target.checked)}
              />
              Als hoofdfoto
            </label>
            <button
              type="button"
              onClick={handleKoppel}
              disabled={!linkProductId || !linkUrl}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Koppelen
            </button>
            {linkSuccess && (
              <span className="text-sm text-gray-600">{linkSuccess}</span>
            )}
          </div>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-gray-500">Laden...</p>
        ) : (
          <div className="mt-8">
            <h2 className="text-sm font-medium uppercase text-gray-500">Geüploade foto’s</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
              {files.map((f) => (
                <div
                  key={f.url}
                  className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                >
                  <Image
                    src={f.url}
                    alt={f.name}
                    fill
                    className="object-cover"
                    sizes="160px"
                    unoptimized
                  />
                  <div className="absolute bottom-0 left-0 right-0 truncate bg-black/70 px-2 py-1 text-xs text-white">
                    {f.name}
                  </div>
                </div>
              ))}
            </div>
            {files.length === 0 && (
              <p className="mt-4 text-sm text-gray-500">Nog geen foto’s geüpload.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
