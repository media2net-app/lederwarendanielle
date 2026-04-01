import type { MerkId } from "./merken";
import { SCRAPED_LEATHER_DESIGN_PRODUCTEN } from "./scraped-leatherdesign-producten";

export interface Product {
  id: string;
  merkId: MerkId;
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

export const MOCK_PRODUCTEN: Product[] = [...SCRAPED_LEATHER_DESIGN_PRODUCTEN];

export function getProducten(merkId?: MerkId): Product[] {
  const all = [...MOCK_PRODUCTEN];
  if (!merkId) return all;
  return all.filter((p) => p.merkId === merkId);
}

export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTEN.find((p) => p.id === id);
}
