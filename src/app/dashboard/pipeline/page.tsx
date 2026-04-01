"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getPipelineLeads, PIPELINE_STAGES, type PipelineLead, type PipelineStage } from "@/lib/mock-pipeline";
import { getPipelineStageMap, setPipelineStage } from "@/lib/demo-state";
import { getMerkById } from "@/lib/merken";

function formatBedrag(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function LeadCard({ lead }: { lead: PipelineLead }) {
  const merkenLabels = lead.merkInteresse.map((m) => getMerkById(m)?.naam ?? m).join(", ");
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", lead.id);
        e.dataTransfer.effectAllowed = "move";
        e.currentTarget.classList.add("opacity-50");
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove("opacity-50");
      }}
      className="cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:border-gray-300 active:cursor-grabbing"
    >
      <p className="font-medium text-gray-900">{lead.bedrijfsnaam}</p>
      <p className="mt-1 text-sm text-gray-600">{lead.contactpersoon}</p>
      <p className="mt-0.5 truncate text-xs text-gray-500">{lead.email}</p>
      {merkenLabels && (
        <p className="mt-2 text-xs text-gray-500">Interesse: {merkenLabels}</p>
      )}
      {lead.notities && (
        <p className="mt-1 truncate text-xs italic text-gray-400" title={lead.notities}>{lead.notities}</p>
      )}
      <p className="mt-2 text-xs font-medium text-emerald-700">Potentiële omzet: {formatBedrag(lead.potentieleOmzet)}</p>
      <p className="mt-1 text-xs text-gray-400">{lead.datum}</p>
      <Link
        href={`/dashboard/pipeline/${lead.id}`}
        onClick={(e) => e.stopPropagation()}
        className="mt-2 inline-block text-xs font-medium text-black hover:underline"
      >
        Bekijken →
      </Link>
    </div>
  );
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<PipelineLead[]>(() => {
    const map = getPipelineStageMap();
    return getPipelineLeads().map((l) => ({ ...l, stage: map[l.id] ?? l.stage }));
  });
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<PipelineStage | null>(null);

  const leadsByStage = useMemo(() => {
    const map: Record<PipelineStage, PipelineLead[]> = {
      nieuw: [],
      contact: [],
      offerte: [],
      onderhandeling: [],
      gewonnen: [],
      verloren: [],
    };
    leads.forEach((l) => map[l.stage].push(l));
    return map;
  }, [leads]);

  const omzetByStage = useMemo(() => {
    const map: Record<PipelineStage, number> = {
      nieuw: 0,
      contact: 0,
      offerte: 0,
      onderhandeling: 0,
      gewonnen: 0,
      verloren: 0,
    };
    leads.forEach((l) => {
      map[l.stage] += l.potentieleOmzet;
    });
    return map;
  }, [leads]);

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(stage);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">Pipeline</h2>
        {saveNotice && <p className="mb-3 rounded bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{saveNotice}</p>}
        <p className="mb-3 text-gray-600">
          Kanban-overzicht van nieuwe potentiële klanten. Sleep leads naar een andere fase wanneer de status wijzigt.
        </p>
        <div className="mb-6 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
          Totale potentiële omzet pipeline: <span className="font-semibold text-gray-900">{formatBedrag(leads.reduce((sum, l) => sum + l.potentieleOmzet, 0))}</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map(({ id, label }) => (
            <div
              key={id}
              onDragOver={(e) => handleDragOver(e, id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                e.preventDefault();
                const leadId = e.dataTransfer.getData("text/plain");
                if (leadId) {
                  setLeads((prev) =>
                    prev.map((l) => {
                      if (l.id !== leadId) return l;
                      setPipelineStage(l.id, id);
                      return { ...l, stage: id };
                    })
                  );
                }
                setDragOverColumn(null);
                setSaveNotice("Pipeline bijgewerkt (demo)");
                setTimeout(() => setSaveNotice(null), 1800);
              }}
              className={`flex w-72 shrink-0 flex-col rounded-lg border-2 border-dashed transition-colors min-h-[120px] ${
                dragOverColumn === id ? "border-black bg-gray-100" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 rounded-t-lg bg-white">
                <h3 className="font-medium text-gray-900">{label}</h3>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {leadsByStage[id].length}
                </span>
              </div>
              <div className="border-b border-gray-100 bg-white px-4 py-2 text-xs text-gray-600">
                Potentiële omzet: <span className="font-semibold text-gray-900">{formatBedrag(omzetByStage[id])}</span>
              </div>
              <div className="flex flex-col gap-2 p-3 min-h-[140px]">
                {leadsByStage[id].map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
