import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { mapDbAgendaItem, type DbAgendaRow } from "@/lib/agenda-shared";
import { cookies } from "next/headers";

function typeLabel(type: string) {
  switch (type) {
    case "vergadering": return "Vergadering";
    case "klant": return "Klant";
    case "leverancier": return "Leverancier";
    case "intern": return "Intern";
    case "overig": return "Overig";
    default: return type;
  }
}

function formatDatum(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AfspraakDetailPage({ params }: { params: { id?: string } }) {
  const id = params?.id;
  if (!id) notFound();

  const supabase = createClient(cookies());
  const { data } = await supabase
    .from("agenda_items")
    .select("id, titel, datum, start_tijd, eind_tijd, locatie, deelnemers, type, notities")
    .eq("id", id)
    .single();
  if (!data) notFound();
  const afspraak = mapDbAgendaItem(data as DbAgendaRow);

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href="/dashboard/agenda" className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          ← Terug naar agenda
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-xl font-semibold text-gray-900">{afspraak.titel}</h1>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              {typeLabel(afspraak.type)}
            </span>
          </div>

          <dl className="mt-6 space-y-3">
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500">Datum</dt>
              <dd className="mt-0.5 text-gray-900">{formatDatum(afspraak.datum)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500">Tijd</dt>
              <dd className="mt-0.5 text-gray-900">{afspraak.startTijd} – {afspraak.eindTijd}</dd>
            </div>
            {afspraak.locatie && (
              <div>
                <dt className="text-xs font-medium uppercase text-gray-500">Locatie</dt>
                <dd className="mt-0.5 text-gray-900">{afspraak.locatie}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500">Deelnemers</dt>
              <dd className="mt-0.5 text-gray-900">{afspraak.deelnemers.join(", ")}</dd>
            </div>
            {afspraak.notities && (
              <div>
                <dt className="text-xs font-medium uppercase text-gray-500">Notities</dt>
                <dd className="mt-0.5 text-gray-900 whitespace-pre-wrap">{afspraak.notities}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </main>
  );
}
