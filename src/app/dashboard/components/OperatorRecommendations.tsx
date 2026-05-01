"use client";

import { useEffect, useMemo, useState } from "react";

interface OperatorRecommendation {
  id: string;
  title: string;
  detail: string;
  tone: "attention" | "focus" | "stable";
}

interface OperatorRecommendationsProps {
  dateISO: string;
  briefing: string;
  recommendations: OperatorRecommendation[];
}

function toneClass(tone: OperatorRecommendation["tone"]) {
  switch (tone) {
    case "attention":
      return "border-zinc-300/25 bg-zinc-900/70 text-zinc-100";
    case "focus":
      return "border-slate-300/30 bg-slate-900/70 text-slate-100";
    default:
      return "border-stone-300/25 bg-stone-900/65 text-stone-100";
  }
}

export default function OperatorRecommendations({
  dateISO,
  briefing,
  recommendations,
}: OperatorRecommendationsProps) {
  const storageKey = useMemo(() => `operator_morning_briefing_seen_${dateISO}`, [dateISO]);
  const [showMorningBriefing, setShowMorningBriefing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeen = window.localStorage.getItem(storageKey);
    if (!hasSeen) {
      setShowMorningBriefing(true);
      window.localStorage.setItem(storageKey, "1");
    }
  }, [storageKey]);

  return (
    <section className="mb-8">
      {showMorningBriefing && (
        <div className="mb-4 rounded-2xl border border-white/15 bg-zinc-900/75 px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Ochtendstart briefing
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-100">{briefing}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowMorningBriefing(false)}
              className="ui-btn-secondary rounded-xl px-4 py-2 text-sm font-medium"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      <div className="ui-card rounded-2xl border p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              AI Aanbevelingen
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Vaste operator-aanbevelingen voor vandaag
            </h3>
          </div>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-medium text-slate-200">
            {dateISO}
          </span>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`rounded-xl border px-4 py-4 ${toneClass(recommendation.tone)}`}
            >
              <p className="text-sm font-semibold">{recommendation.title}</p>
              <p className="mt-2 text-sm leading-6 opacity-95">{recommendation.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

