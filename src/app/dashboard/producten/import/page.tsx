"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { MERKEN } from "@/lib/merken";

const TARGET_FIELDS: { key: string; label: string; required?: boolean }[] = [
  { key: "naam", label: "Productnaam", required: true },
  { key: "sku", label: "SKU / artikelcode", required: true },
  { key: "ean", label: "EAN / barcode", required: false },
  { key: "merkId", label: "Merk", required: false },
  { key: "prijs", label: "Prijs", required: true },
  { key: "voorraad", label: "Voorraad", required: false },
  { key: "beschrijving", label: "Beschrijving", required: false },
  { key: "specificaties", label: "Specificaties", required: false },
  { key: "imageFileName", label: "Afbeelding (bestandsnaam)", required: false },
];

const TEMPLATE_HEADERS = [
  "naam",
  "sku",
  "ean",
  "merkId",
  "prijs",
  "voorraad",
  "beschrijving",
  "specificaties",
  "imageFileName",
];

function downloadTemplate() {
  const header = TEMPLATE_HEADERS.join(";");
  const example =
    "Voorbeeld product;SKU-001;8712345001001;leather-design;29.95;10;Korte beschrijving;Materiaal: Leer;foto1.jpg";
  const csv = [header, example].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "producten-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function suggestMapping(csvHeaders: string[]): Record<string, string> {
  const lower = (s: string) => s.toLowerCase().trim();
  const mapping: Record<string, string> = {};
  const aliases: Record<string, string[]> = {
    naam: ["naam", "name", "productnaam", "product naam", "titel", "title"],
    sku: ["sku", "artikelcode", "artikel", "code"],
    ean: ["ean", "barcode", "EAN", "gtin"],
    merkId: ["merkid", "merk_id", "merk", "brand"],
    prijs: ["prijs", "price", "prijs excl", "prijs_excl"],
    voorraad: ["voorraad", "stock", "quantity"],
    beschrijving: ["beschrijving", "description", "omschrijving"],
    specificaties: ["specificaties", "specs", "specificatie"],
    imageFileName: ["imagefilename", "image_file", "foto", "afbeelding", "image"],
  };
  for (const { key } of TARGET_FIELDS) {
    const options = aliases[key] ?? [key];
    const found = csvHeaders.find((h) => options.some((o) => lower(h).includes(o) || lower(o).includes(lower(h))));
    if (found) mapping[key] = found;
  }
  return mapping;
}

export default function ImportProductenPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][] | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    added: number;
    updated: number;
    total: number;
    errors: { row: number; message: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const csvHeaders = useMemo(() => (preview && preview.length > 0 ? preview[0] : []), [preview]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setResult(null);
    setError(null);
    if (!f) {
      setPreview(null);
      setMapping({});
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const rows = lines.slice(0, 6).map((line) => {
        const parts: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') inQuotes = !inQuotes;
          else if ((c === ";" || c === ",") && !inQuotes) {
            parts.push(current.trim());
            current = "";
          } else current += c;
        }
        parts.push(current.trim());
        return parts;
      });
      setPreview(rows);
      const headers = rows[0] ?? [];
      setMapping(suggestMapping(headers));
    };
    reader.readAsText(f, "UTF-8");
  }, []);

  const setMappingField = (targetKey: string, csvColumn: string) => {
    setMapping((prev) =>
      csvColumn ? { ...prev, [targetKey]: csvColumn } : (() => { const n = { ...prev }; delete n[targetKey]; return n; })()
    );
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("csv", file);
      formData.append("mapping", JSON.stringify(mapping));
      const res = await fetch("/api/producten/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import mislukt.");
        setLoading(false);
        return;
      }
      setResult({
        added: data.added ?? 0,
        updated: data.updated ?? 0,
        total: data.total ?? 0,
        errors: data.errors ?? [],
      });
      setFile(null);
      setPreview(null);
      setMapping({});
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) input.value = "";
    } catch {
      setError("Kon geen verbinding maken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href="/dashboard/producten" className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          Terug naar producten
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">CSV importeren</h1>
        <p className="mt-2 text-sm text-gray-600">
          Upload een CSV met productgegevens. Heeft uw bestand andere kolomnamen? Stel hieronder het veld-mapping in zodat de import correct verloopt. Scheidingsteken: komma of puntkomma. Bestaande producten met dezelfde SKU worden bijgewerkt.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={downloadTemplate}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Download template (standaard kolommen)
          </button>
          <a
            href="/voorbeeld-producten-import.csv"
            download="voorbeeld-producten-import.csv"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Download voorbeeldbestand (andere kolomnamen)
          </a>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Het voorbeeldbestand gebruikt kolommen zoals Productnaam, Artikelcode, Merk, Prijs excl, enz. Upload dat bestand en koppel de velden hieronder om de import te testen.
        </p>

        <div className="mt-6 max-w-3xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">CSV-bestand</label>
            <input
              type="file"
              accept=".csv,.txt,text/csv"
              onChange={onFileChange}
              className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-white file:hover:bg-gray-800"
            />
          </div>

          {preview && preview.length > 0 && (
            <>
              <div>
                <h2 className="text-sm font-medium text-gray-700">Preview (eerste regels)</h2>
                <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full text-left text-sm">
                    <tbody className="divide-y divide-gray-200">
                      {preview.map((row, i) => (
                        <tr key={i} className="bg-white">
                          {row.map((cell, j) => (
                            <td key={j} className="max-w-[200px] truncate px-3 py-2 text-gray-900">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="text-sm font-medium text-gray-700">Velden mappen</h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Kies per systeemveld welke kolom uit uw CSV gebruikt wordt. Zo werkt de import ook bij andere kolomnamen.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {TARGET_FIELDS.map(({ key, label, required }) => (
                    <div key={key} className="flex items-center gap-2">
                      <label className="w-36 shrink-0 text-sm text-gray-700">
                        {label}
                        {required && <span className="text-red-500"> *</span>}
                      </label>
                      <select
                        value={mapping[key] ?? ""}
                        onChange={(e) => setMappingField(key, e.target.value)}
                        className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
                      >
                        <option value="">— niet mappen</option>
                        {csvHeaders.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {result && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
              <p>Import voltooid: {result.added} toegevoegd, {result.updated} bijgewerkt (totaal {result.total} rijen).</p>
              {result.errors.length > 0 && (
                <p className="mt-2 text-amber-700">
                  {result.errors.length} foutmelding(en), o.a. rij {result.errors[0].row}: {result.errors[0].message}
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleImport}
            disabled={!file || loading}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Importeren..." : "Importeer"}
          </button>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
          <h3 className="font-medium text-gray-900">Geldige merkId-waarden</h3>
          <ul className="mt-2 list-inside list-disc">
            {MERKEN.map((m) => (
              <li key={m.id}>{m.id}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
