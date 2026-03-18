export type MerkId = string;

export interface Merk {
  id: MerkId;
  naam: string;
  slug: string;
  webshopUrl: string;
  apiType?: "shopify" | "woocommerce" | null;
}

export const MERKEN: Merk[] = [
  { id: "orange-fire", naam: "Orange Fire", slug: "orange-fire", webshopUrl: "https://www.lederwaren-danielle.nl/collectie/orange-fire", apiType: null },
  { id: "shelby-brothers", naam: "Shelby Brothers", slug: "shelby-brothers", webshopUrl: "https://www.lederwaren-danielle.nl/collectie/shelby-brothers", apiType: null },
  { id: "ratpack", naam: "Ratpack", slug: "ratpack", webshopUrl: "https://www.lederwaren-danielle.nl/collectie/ratpack", apiType: null },
  { id: "leather-design", naam: "Leather Design", slug: "leather-design", webshopUrl: "https://www.lederwaren-danielle.nl/collectie/leather-design", apiType: null },
  { id: "gaz", naam: "GAZ", slug: "gaz", webshopUrl: "https://www.lederwaren-danielle.nl/collectie/gaz", apiType: null },
];

export function getMerkById(id: MerkId): Merk | undefined {
  return MERKEN.find((m) => m.id === id);
}

export function getMerkBySlug(slug: string): Merk | undefined {
  return MERKEN.find((m) => m.slug === slug);
}
