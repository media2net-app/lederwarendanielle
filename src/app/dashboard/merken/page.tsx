import { MERKEN } from "@/lib/merken";
import Link from "next/link";

export default function MerkenPage() {
  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Merken & webshops</h2>
        <p className="text-gray-600 mb-8">
          Overzicht van alle merken en koppelingen naar de webshops. Later kunt u hier API-koppelingen configureren.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MERKEN.map((merk) => (
            <div
              key={merk.id}
              className="flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900">{merk.naam}</h3>
              <p className="mt-1 text-sm text-gray-500">
                Webshop: {merk.webshopUrl ? "Gekoppeld" : "Nog niet gekoppeld"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {merk.webshopUrl && (
                  <a
                    href={merk.webshopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                  >
                    Open webshop
                  </a>
                )}
              </div>
              {/* Placeholder voor later: API-koppeling */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">API-koppeling (binnenkort)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
