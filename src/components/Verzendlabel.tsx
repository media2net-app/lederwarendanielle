"use client";

import { useEffect, useRef } from "react";
import type { Bestelling } from "@/lib/mock-bestellingen";

interface VerzendlabelProps {
  bestelling: Bestelling;
  onClose?: () => void;
  onPrint?: () => void;
  showActions?: boolean;
}

function getDemoAdres(ordernummer: string) {
  const adressen: Record<string, { naam: string; straat: string; postcode: string; plaats: string }> = {
    "LD-2024-042": { naam: "Maria van Berg", straat: "Kerkstraat 42", postcode: "1234 AB", plaats: "Amsterdam" },
    "OF-2024-001": { naam: "Jan de Vries", straat: "Hoofdweg 15", postcode: "5678 CD", plaats: "Rotterdam" },
    "SB-2024-027": { naam: "Tom Smit", straat: "Stationsplein 7", postcode: "9012 EF", plaats: "Utrecht" },
  };
  return adressen[ordernummer] ?? {
    naam: "Demo Klant",
    straat: "Voorbeeldstraat 1",
    postcode: "1234 AB",
    plaats: "Demo Plaats",
  };
}

function toEan13(ordernummer: string): string {
  const digits = ordernummer.replace(/\D/g, "").padStart(10, "0").slice(0, 10);
  const base = "87" + digits;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(base[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return base + check;
}

export default function Verzendlabel({ bestelling, onClose, onPrint, showActions = true }: VerzendlabelProps) {
  const adres = getDemoAdres(bestelling.ordernummer);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const ean = toEan13(bestelling.ordernummer);

  useEffect(() => {
    if (!barcodeRef.current || !ean) return;
    import("jsbarcode").then((JsBarcode) => {
      try {
        JsBarcode.default(barcodeRef.current!, ean, {
          format: "EAN13",
          width: 2,
          height: 48,
          displayValue: true,
          fontSize: 14,
          margin: 4,
        });
      } catch (e) {
        console.warn("Barcode render failed", e);
      }
    });
  }, [ean]);

  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  return (
    <div className="verzendlabel-print">
      <div
        className="overflow-hidden rounded-lg border-2 border-gray-900 bg-white shadow-lg print:border-2 print:shadow-none"
        style={{ width: "100mm", minHeight: "150mm" }}
      >
        <div className="flex h-full flex-col p-5">
          <div className="mb-4 border-b-2 border-gray-900 pb-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Afzender</div>
            <div className="mt-1 font-bold text-gray-900">Lederwaren Daniëlle</div>
            <div className="text-sm text-gray-700">Handelsweg 6</div>
            <div className="text-sm text-gray-700">7921 JR Zuidwolde</div>
          </div>

          <div className="flex-1 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Geadresseerde</div>
            <div className="mt-2 text-xl font-bold text-gray-900">{adres.naam}</div>
            <div className="mt-1 text-base text-gray-800">{adres.straat}</div>
            <div className="text-base font-medium text-gray-800">
              {adres.postcode} {adres.plaats}
            </div>
            <div className="text-sm text-gray-600">Nederland</div>
          </div>

          <div className="border-t-2 border-gray-900 pt-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Order</div>
            <div className="mt-1 font-mono text-lg font-bold">{bestelling.ordernummer}</div>
            <div className="mt-3 flex justify-center bg-white py-2">
              <svg ref={barcodeRef} className="max-w-full" />
            </div>
          </div>
        </div>
      </div>
      {showActions && (
        <div className="mt-4 flex gap-2 print:hidden">
          <button type="button" onClick={handlePrint} className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700">
            Printen
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
              Sluiten
            </button>
          )}
        </div>
      )}
    </div>
  );
}
