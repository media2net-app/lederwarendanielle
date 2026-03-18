import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import type { MerkId } from "./merken";
import { MOCK_PRODUCTEN } from "./mock-producten";
import type { Product } from "./mock-producten";

const DATA_DIR = join(process.cwd(), "data");
const FILE_PATH = join(DATA_DIR, "producten.json");

function loadProducten(): Product[] {
  if (!existsSync(FILE_PATH)) {
    ensureDataDir();
    writeFileSync(FILE_PATH, JSON.stringify(MOCK_PRODUCTEN, null, 2), "utf-8");
    return [...MOCK_PRODUCTEN];
  }
  const raw = readFileSync(FILE_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...MOCK_PRODUCTEN];
    if (parsed.length === 0) {
      writeFileSync(FILE_PATH, JSON.stringify(MOCK_PRODUCTEN, null, 2), "utf-8");
      return [...MOCK_PRODUCTEN];
    }
    return parsed as Product[];
  } catch {
    return [...MOCK_PRODUCTEN];
  }
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function saveProducten(producten: Product[]) {
  ensureDataDir();
  writeFileSync(FILE_PATH, JSON.stringify(producten, null, 2), "utf-8");
}

export function getProducten(merkId?: MerkId): Product[] {
  const all = loadProducten();
  if (!merkId) return all;
  return all.filter((p) => p.merkId === merkId);
}

export function getProductById(id: string): Product | undefined {
  return loadProducten().find((p) => p.id === id);
}

export function getProductBySku(sku: string): Product | undefined {
  return loadProducten().find((p) => p.sku === sku);
}

function generateId(): string {
  const list = loadProducten();
  const existing = new Set(list.map((p) => p.id));
  let candidate = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  while (existing.has(candidate)) {
    candidate = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
  return candidate;
}

export type CreateProductInput = Omit<Product, "id"> & { id?: string };

export function createProduct(input: CreateProductInput): Product {
  const producten = loadProducten();
  const id = input.id ?? generateId();
  const newProduct: Product = {
    id,
    merkId: input.merkId,
    naam: input.naam,
    sku: input.sku,
    prijs: input.prijs,
    voorraad: input.voorraad,
    imageUrl: input.imageUrl,
    imageUrls: input.imageUrls,
    productUrl: input.productUrl,
    beschrijving: input.beschrijving,
    specificaties: input.specificaties,
  };
  producten.push(newProduct);
  saveProducten(producten);
  return newProduct;
}

export type UpdateProductInput = Partial<Omit<Product, "id">>;

export function updateProduct(id: string, input: UpdateProductInput): Product | undefined {
  const producten = loadProducten();
  const index = producten.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  const updated = { ...producten[index], ...input, id };
  producten[index] = updated;
  saveProducten(producten);
  return updated;
}

export function deleteProduct(id: string): boolean {
  const producten = loadProducten();
  const filtered = producten.filter((p) => p.id !== id);
  if (filtered.length === producten.length) return false;
  saveProducten(filtered);
  return true;
}
