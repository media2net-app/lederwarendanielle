import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function addOrder(formData: FormData) {
  "use server";

  const klantNaam = String(formData.get("klant_naam") ?? "").trim();
  const klantEmail = String(formData.get("klant_email") ?? "").trim();
  const totaal = Number(formData.get("totaal"));

  if (!klantNaam || !klantEmail || Number.isNaN(totaal)) return;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const ordernummer = `WEB-${Date.now()}`;

  await supabase.from("orders").insert({
    ordernummer,
    merk_id: "leather-design",
    klant_naam: klantNaam,
    klant_email: klantEmail,
    totaal,
    status: "open",
    regels: [],
  });

  revalidatePath("/supabase-orders");
}

export default async function SupabaseOrdersPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, ordernummer, klant_naam, klant_email, totaal, status, datum")
    .order("datum", { ascending: false })
    .limit(25);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Supabase Orders test</h1>

      <form action={addOrder} className="mb-6 grid gap-2 rounded border border-gray-200 bg-white p-4 md:grid-cols-4">
        <input
          name="klant_naam"
          type="text"
          required
          placeholder="Klantnaam"
          className="rounded border border-gray-300 px-3 py-2"
        />
        <input
          name="klant_email"
          type="email"
          required
          placeholder="Klant e-mail"
          className="rounded border border-gray-300 px-3 py-2"
        />
        <input
          name="totaal"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="Totaal"
          className="rounded border border-gray-300 px-3 py-2"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 font-medium text-white">
          Order toevoegen
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Supabase fout: {error.message}
        </p>
      )}

      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Ordernr</th>
              <th className="px-3 py-2">Klant</th>
              <th className="px-3 py-2">E-mail</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Totaal</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium">{order.ordernummer}</td>
                <td className="px-3 py-2">{order.klant_naam}</td>
                <td className="px-3 py-2">{order.klant_email}</td>
                <td className="px-3 py-2">{order.status}</td>
                <td className="px-3 py-2">EUR {Number(order.totaal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
