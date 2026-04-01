"use client";

import { useState } from "react";
import BarcodeInput from "@/components/BarcodeInput";

interface ProductInfo {
  id: string;
  naam: string;
  sku: string;
  ean?: string;
  voorraad: number;
}

export default function VoorraadPage() {
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [delta, setDelta] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleScan = async (value: string) => {
    setMessage(null);
    try {
      const res = await fetch(`/api/producten?ean=${encodeURIComponent(value)}`);
      if (!res.ok) {
        setProduct(null);
        setMessage({ type: "error", text: "Product niet gevonden" });
        return;
      }
      const p = await res.json();
      setProduct({
        id: p.id,
        naam: p.naam,
        sku: p.sku,
        ean: p.ean,
        voorraad: p.voorraad ?? 0,
      });
      setDelta("");
    } catch {
      setProduct(null);
      setMessage({ type: "error", text: "Kon product niet ophalen" });
    }
  };

  const handleSave = async () => {
    if (!product) return;
    const d = parseInt(delta, 10);
    if (isNaN(d)) {
      setMessage({ type: "error", text: "Voer een geldig aantal in (+ of -)" });
      return;
    }
    const nieuweVoorraad = Math.max(0, product.voorraad + d);
    try {
      const res = await fetch(`/api/producten/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voorraad: nieuweVoorraad }),
      });
      if (!res.ok) throw new Error("Update mislukt");
      setProduct({ ...product, voorraad: nieuweVoorraad });
      setDelta("");
      setMessage({ type: "success", text: `Voorraad bijgewerkt naar ${nieuweVoorraad}` });
    } catch {
      setMessage({ type: "error", text: "Kon voorraad niet bijwerken" });
    }
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">Voorraad aanpassen</h2>

        <div className="max-w-lg space-y-6">
          <BarcodeInput onScan={handleScan} placeholder="Scan product (EAN/SKU)..." autoFocus />

          {message && (
            <div className={`rounded-lg px-4 py-3 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              {message.text}
            </div>
          )}

          {product && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="font-medium text-gray-900">{product.naam}</h3>
              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
              <p className="mt-2 text-lg">Huidige voorraad: <strong>{product.voorraad}</strong></p>

              <div className="mt-6 flex gap-4">
                <input
                  type="text"
                  value={delta}
                  onChange={(e) => setDelta(e.target.value)}
                  placeholder="+5 of -3"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!delta}
                  className="rounded-lg bg-amber-600 px-6 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  Opslaan
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">Voer +X of -X in om de voorraad aan te passen</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
