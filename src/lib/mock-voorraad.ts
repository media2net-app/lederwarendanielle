import type { Product } from "./mock-producten";

export interface VoorraadMutatie {
  id: string;
  productId: string;
  delta: number;
  reden: string;
  datum: string;
  gebruiker?: string;
}

export interface InventarisRegel {
  productId: string;
  sku: string;
  naam: string;
  verwacht: number;
  geteld: number;
  delta: number;
}

export type InventarisStatus = "actief" | "afgerond";

export interface InventarisSessie {
  id: string;
  datum: string;
  regels: InventarisRegel[];
  status: InventarisStatus;
}

let voorraadMutaties: VoorraadMutatie[] = [];
let inventarisSessies: InventarisSessie[] = [];

export function getVoorraadMutaties(productId?: string): VoorraadMutatie[] {
  let list = [...voorraadMutaties];
  if (productId) list = list.filter((m) => m.productId === productId);
  return list.sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());
}

export function addVoorraadMutatie(input: Omit<VoorraadMutatie, "id" | "datum">): VoorraadMutatie {
  const mutatie: VoorraadMutatie = {
    ...input,
    id: `vm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    datum: new Date().toISOString(),
  };
  voorraadMutaties.push(mutatie);
  return mutatie;
}

export function getActieveInventarisSessie(): InventarisSessie | undefined {
  return inventarisSessies.find((s) => s.status === "actief");
}

export function getInventarisSessies(): InventarisSessie[] {
  return [...inventarisSessies].sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());
}

export function startInventarisSessie(producten: Pick<Product, "id" | "sku" | "naam" | "voorraad">[]): InventarisSessie {
  const bestaand = getActieveInventarisSessie();
  if (bestaand) return bestaand;
  const sessie: InventarisSessie = {
    id: `inv-${Date.now()}`,
    datum: new Date().toISOString(),
    status: "actief",
    regels: producten.map((p) => ({
      productId: p.id,
      sku: p.sku,
      naam: p.naam,
      verwacht: p.voorraad ?? 0,
      geteld: 0,
      delta: 0,
    })),
  };
  inventarisSessies.push(sessie);
  return sessie;
}

export function updateInventarisGeteld(sessieId: string, productId: string, geteld: number): InventarisSessie | undefined {
  const sessie = inventarisSessies.find((s) => s.id === sessieId && s.status === "actief");
  if (!sessie) return undefined;
  const regel = sessie.regels.find((r) => r.productId === productId);
  if (!regel) return sessie;
  regel.geteld = geteld;
  regel.delta = geteld - regel.verwacht;
  return sessie;
}

export function addOfUpdateInventarisRegel(sessieId: string, productId: string, sku: string, naam: string, verwacht: number, geteld: number): InventarisSessie | undefined {
  const sessie = inventarisSessies.find((s) => s.id === sessieId && s.status === "actief");
  if (!sessie) return undefined;
  let regel = sessie.regels.find((r) => r.productId === productId);
  if (regel) {
    regel.geteld = geteld;
    regel.delta = geteld - regel.verwacht;
  } else {
    sessie.regels.push({
      productId,
      sku,
      naam,
      verwacht,
      geteld,
      delta: geteld - verwacht,
    });
  }
  return sessie;
}

export function afrondInventarisSessie(sessieId: string): InventarisSessie | undefined {
  const sessie = inventarisSessies.find((s) => s.id === sessieId && s.status === "actief");
  if (!sessie) return undefined;
  sessie.status = "afgerond";
  return sessie;
}
