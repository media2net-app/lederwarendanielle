"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const RONDLEIDING_STAPPEN = [
  { path: "/dashboard", title: "Dashboard", body: "Hier zie je een overzicht van je belangrijkste cijfers: bestellingen, open tickets, taken en omzet. Handig om de dag te starten." },
  { path: "/dashboard/bestellingen", title: "Bestellingen", body: "Beheer en volg alle bestellingen. Bekijk status, klantgegevens en leverdata op één plek." },
  { path: "/dashboard/b2b-klanten", title: "B2B klanten", body: "Overzicht van zakelijke klanten, contacten en ordergeschiedenis. Ideaal voor groothandel en wederverkopers." },
  { path: "/dashboard/pipeline", title: "Pipeline", body: "Verkooppipeline en deals in verschillende fases. Houd verkoopkansen bij en stuur ze naar afronding." },
  { path: "/dashboard/klantenservice", title: "Klantenservice", body: "Tickets en klantvragen. Met AI-ondersteuning voor snelle antwoordsuggesties die je kunt goedkeuren of aanpassen." },
  { path: "/dashboard/producten", title: "Producten", body: "Productcatalogus, voorraad en fotobibliotheek. Beheer artikelen en push naar je webshop." },
  { path: "/dashboard/taken", title: "Taken", body: "Taken en planning. Zie wat er moet gebeuren en door wie." },
  { path: "/dashboard/agenda", title: "Agenda", body: "Agenda en afspraken. Komende afspraken en een kalenderweergave van de maand." },
  { path: "/dashboard/rapportage", title: "Rapportage", body: "Rapporten en analyses over omzet, merken en prestaties." },
  { path: "/dashboard/ai-studio", title: "AI Studio", body: "AI Studio voor automatisering en slimme workflows in je bedrijfsvoering." },
  { path: "/dashboard/merken", title: "Merken & webshops", body: "Beheer merken en koppelingen met webshops." },
  { path: "/dashboard/klantkaart", title: "Klantkaart", body: "Klantkaart met geolocatie. Zie waar je klanten zitten." },
  { path: "/dashboard/instellingen", title: "Instellingen", body: "Algemene instellingen van het platform." },
];

export default function Rondleiding() {
  const router = useRouter();
  const pathname = usePathname();
  const [welkomOpen, setWelkomOpen] = useState(false);
  const [tourActief, setTourActief] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tonen = window.sessionStorage.getItem("rondleiding_tonen");
    if (tonen === "1") {
      setWelkomOpen(true);
      window.sessionStorage.removeItem("rondleiding_tonen");
    }
  }, []);

  useEffect(() => {
    if (!tourActief) return;
    const step = RONDLEIDING_STAPPEN[tourStep];
    if (step && pathname !== step.path) router.replace(step.path);
  }, [tourActief, tourStep, pathname, router]);

  const sluitRondleiding = () => {
    setWelkomOpen(false);
    setTourActief(false);
  };

  const startRondleiding = () => {
    setWelkomOpen(false);
    setTourActief(true);
    setTourStep(0);
    router.replace(RONDLEIDING_STAPPEN[0].path);
  };

  const vorige = () => {
    if (tourStep > 0) setTourStep((s) => s - 1);
  };

  const volgende = () => {
    if (tourStep < RONDLEIDING_STAPPEN.length - 1) setTourStep((s) => s + 1);
    else sluitRondleiding();
  };

  const step = RONDLEIDING_STAPPEN[tourStep];
  const toonOverlay = welkomOpen || tourActief;

  if (!toonOverlay) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[1100] bg-black/60 transition-opacity"
        aria-hidden
      />
      <div className="fixed inset-0 z-[1101] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md rounded-xl bg-white shadow-xl p-6">
          {welkomOpen && (
            <>
              <h2 className="text-xl font-semibold text-gray-900">
                Welkom bij het platform
              </h2>
              <p className="mt-2 text-gray-600">
                Wil je een korte rondleiding? We laten je pagina voor pagina zien wat het systeem kan.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={startRondleiding}
                  className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Start rondleiding
                </button>
                <button
                  type="button"
                  onClick={sluitRondleiding}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sluit rondleiding
                </button>
              </div>
            </>
          )}
          {tourActief && step && (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-500">
                  Stap {tourStep + 1} van {RONDLEIDING_STAPPEN.length}
                </span>
                <button
                  type="button"
                  onClick={sluitRondleiding}
                  className="text-gray-400 hover:text-gray-600 rounded p-1"
                  aria-label="Rondleiding sluiten"
                >
                  ✕
                </button>
              </div>
              <h2 className="mt-1 text-xl font-semibold text-gray-900">
                {step.title}
              </h2>
              <p className="mt-2 text-gray-600">
                {step.body}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={vorige}
                    disabled={tourStep === 0}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Vorige
                  </button>
                  <button
                    type="button"
                    onClick={volgende}
                    className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    {tourStep === RONDLEIDING_STAPPEN.length - 1 ? "Afronden" : "Volgende"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={sluitRondleiding}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Sluit rondleiding
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
