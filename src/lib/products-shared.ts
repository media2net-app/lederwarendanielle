export interface Product {
  id: string;
  merkId: string;
  naam: string;
  sku: string;
  ean?: string;
  prijs: number;
  voorraad?: number;
  imageUrl?: string;
  imageUrls?: string[];
  productUrl?: string;
  beschrijving?: string;
  specificaties?: string;
}

export interface DbProductRow {
  id: string;
  merk_id: string;
  naam: string;
  sku: string;
  ean: string | null;
  prijs: number | string;
  voorraad: number | null;
  image_url: string | null;
  image_urls: unknown;
  product_url: string | null;
  beschrijving: string | null;
  specificaties: string | null;
}

export function mapDbProduct(row: DbProductRow): Product {
  return {
    id: row.id,
    merkId: row.merk_id,
    naam: row.naam,
    sku: row.sku,
    ean: row.ean ?? undefined,
    prijs: Number(row.prijs),
    voorraad: row.voorraad ?? undefined,
    imageUrl: row.image_url ?? undefined,
    imageUrls: Array.isArray(row.image_urls) ? row.image_urls.map((value) => String(value)) : undefined,
    productUrl: row.product_url ?? undefined,
    beschrijving: row.beschrijving ?? undefined,
    specificaties: row.specificaties ?? undefined,
  };
}
