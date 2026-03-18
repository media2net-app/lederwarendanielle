import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/producten-store";
import { getMerkById } from "@/lib/merken";
import PushNaarWebshopButton from "../components/PushNaarWebshopButton";

function formatPrijs(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

export default function ProductDetailPage({ params }: { params: { id?: string } }) {
  const id = params?.id;
  if (!id) notFound();
  const product = getProductById(id);
  if (!product) notFound();

  const merk = getMerkById(product.merkId);

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link
          href="/dashboard/producten"
          className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900"
        >
          ← Terug naar producten
        </Link>
        <div className="flex flex-col gap-8 sm:flex-row">
          {product.imageUrl && (
            <div className="relative h-80 w-80 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-96 sm:w-96">
              <Image
                src={product.imageUrl}
                alt={product.naam}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 320px, 384px"
                priority
                unoptimized
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">{product.naam}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {merk?.naam ?? product.merkId} · {product.sku}
            </p>
            <p className="mt-4 text-xl font-medium text-gray-900">{formatPrijs(product.prijs)}</p>
            {product.voorraad != null && (
              <p className="mt-1 text-sm text-gray-600">Voorraad: {product.voorraad}</p>
            )}
            {product.beschrijving && (
              <div className="mt-6">
                <h2 className="text-sm font-medium uppercase text-gray-500">Beschrijving</h2>
                <p className="mt-2 text-gray-700">{product.beschrijving}</p>
              </div>
            )}
            {product.specificaties && (
              <div className="mt-6">
                <h2 className="text-sm font-medium uppercase text-gray-500">Specificaties</h2>
                <p className="mt-2 text-sm text-gray-600">{product.specificaties}</p>
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/dashboard/producten/${product.id}/bewerken`}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                Bewerken
              </Link>
              <PushNaarWebshopButton merkId={product.merkId} />
              {product.productUrl && (
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Bekijk op webshop →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
