"use client";

import { useState } from "react";
import { getMerkById } from "@/lib/merken";

const PLACEHOLDER_MSG =
  "Koppeling met webshop wordt binnenkort toegevoegd. Configureer API-credentials in Instellingen wanneer beschikbaar.";

export default function PushNaarWebshopButton({ merkId }: { merkId: string }) {
  const [showMessage, setShowMessage] = useState(false);
  const merk = getMerkById(merkId);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowMessage(true)}
        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
      >
        Push naar webshop{merk ? ` (${merk.naam})` : ""}
      </button>
      {showMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowMessage(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowMessage(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-800">{PLACEHOLDER_MSG}</p>
            <button
              type="button"
              onClick={() => setShowMessage(false)}
              className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </>
  );
}
