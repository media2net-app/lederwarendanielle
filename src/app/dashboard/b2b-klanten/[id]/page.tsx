import Link from "next/link";
import { notFound } from "next/navigation";
import { getB2BKlantById, getLogTypeLabel } from "@/lib/mock-b2b-klanten";
import { getMerkById } from "@/lib/merken";

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function B2BKlantDetailPage({ params }: { params: { id?: string } }) {
  const id = params?.id;
  if (!id) notFound();
  const klant = getB2BKlantById(id);
  if (!klant) notFound();

  const merkenLabels = klant.merken.map((m) => getMerkById(m)?.naam ?? m).join(", ");
  const logsSorted = [...klant.logs].sort(
    (a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()
  );

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href="/dashboard/b2b-klanten" className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          ← Terug naar B2B klanten
        </Link>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{klant.bedrijfsnaam}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Klant sinds {klant.klantSinds}
              {merkenLabels && ` · Merken: ${merkenLabels}`}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1.5 text-sm font-medium ${
              klant.status === "actief" ? "bg-green-100 text-green-800" : klant.status === "prospect" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
            }`}
          >
            {klant.status === "actief" ? "Actief" : klant.status === "prospect" ? "Prospect" : "Inactief"}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-medium uppercase text-gray-500">Contactgegevens</h2>
              <dl className="mt-3 space-y-2">
                <div>
                  <dt className="text-xs text-gray-500">Contactpersoon</dt>
                  <dd className="font-medium text-gray-900">{klant.contactpersoon}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">E-mail</dt>
                  <dd>
                    <a href={`mailto:${klant.email}`} className="text-black hover:underline">{klant.email}</a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Telefoon</dt>
                  <dd>
                    <a href={`tel:${klant.telefoon}`} className="text-black hover:underline">{klant.telefoon}</a>
                  </dd>
                </div>
                {(klant.adres || klant.postcode || klant.plaats) && (
                  <div>
                    <dt className="text-xs text-gray-500">Adres</dt>
                    <dd className="text-gray-900">
                      {[klant.adres, klant.postcode, klant.plaats].filter(Boolean).join(", ")} · {klant.land}
                    </dd>
                  </div>
                )}
                {klant.kvk && (
                  <div>
                    <dt className="text-xs text-gray-500">KvK</dt>
                    <dd className="text-gray-900">{klant.kvk}</dd>
                  </div>
                )}
                {klant.btwNummer && (
                  <div>
                    <dt className="text-xs text-gray-500">BTW-nummer</dt>
                    <dd className="text-gray-900">{klant.btwNummer}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-medium uppercase text-gray-500">Merken</h2>
              <p className="mt-2 text-gray-900">{merkenLabels || "—"}</p>
            </div>

            {klant.notities && (
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-medium uppercase text-gray-500">Notities</h2>
                <p className="mt-2 text-gray-900 whitespace-pre-wrap">{klant.notities}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium uppercase text-gray-500">Activiteitenlog</h2>
            <p className="mt-1 text-xs text-gray-500">Alle contactmomenten en activiteiten</p>
            <ul className="mt-4 space-y-3">
              {logsSorted.length === 0 ? (
                <li className="text-sm text-gray-500">Nog geen activiteiten.</li>
              ) : (
                logsSorted.map((log) => (
                  <li key={log.id} className="border-l-2 border-gray-200 pl-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                      <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-gray-600 font-medium">
                        {getLogTypeLabel(log.type)}
                      </span>
                      <span>{formatDatum(log.datum)}</span>
                      <span>·</span>
                      <span>{log.door}</span>
                    </div>
                    <p className="mt-0.5 font-medium text-gray-900">{log.titel}</p>
                    {log.beschrijving && (
                      <p className="mt-0.5 text-sm text-gray-600">{log.beschrijving}</p>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
