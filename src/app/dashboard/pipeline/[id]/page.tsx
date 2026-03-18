import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadById, PIPELINE_STAGES } from "@/lib/mock-pipeline";
import { getMerkById } from "@/lib/merken";

function stageLabel(stageId: string) {
  return PIPELINE_STAGES.find((s) => s.id === stageId)?.label ?? stageId;
}

export default function LeadDetailPage({ params }: { params: { id?: string } }) {
  const id = params?.id;
  if (!id) notFound();
  const lead = getLeadById(id);
  if (!lead) notFound();

  const merkenLabels = lead.merkInteresse.map((m) => getMerkById(m)?.naam ?? m).join(", ");

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href="/dashboard/pipeline" className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          ← Terug naar pipeline
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-xl font-semibold text-gray-900">{lead.bedrijfsnaam}</h1>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              {stageLabel(lead.stage)}
            </span>
          </div>

          <dl className="mt-6 space-y-3">
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500">Contactpersoon</dt>
              <dd className="mt-0.5 text-gray-900">{lead.contactpersoon}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500">E-mail</dt>
              <dd className="mt-0.5">
                <a href={`mailto:${lead.email}`} className="text-black hover:underline">{lead.email}</a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500">Datum</dt>
              <dd className="mt-0.5 text-gray-900">{lead.datum}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500">Interesse (merken)</dt>
              <dd className="mt-0.5 text-gray-900">{merkenLabels || "—"}</dd>
            </div>
            {lead.notities && (
              <div>
                <dt className="text-xs font-medium uppercase text-gray-500">Notities</dt>
                <dd className="mt-0.5 text-gray-900 whitespace-pre-wrap">{lead.notities}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </main>
  );
}
