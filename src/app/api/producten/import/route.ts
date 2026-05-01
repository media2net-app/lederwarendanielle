import { NextResponse } from "next/server";
import Papa from "papaparse";
import { MERKEN } from "@/lib/merken";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const VALID_MERK_IDS = new Set(MERKEN.map((m) => m.id));

function parsePrijs(val: unknown): number | null {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const cleaned = val.trim().replace(",", ".");
    const n = parseFloat(cleaned);
    if (!isNaN(n)) return n;
  }
  return null;
}

function parseVoorraad(val: unknown): number | undefined {
  if (val === "" || val == null) return undefined;
  if (typeof val === "number" && !isNaN(val) && val >= 0) return val;
  if (typeof val === "string") {
    const n = parseInt(val.trim(), 10);
    if (!isNaN(n) && n >= 0) return n;
  }
  return undefined;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(cookies());
    let csvText: string;
    let mapping: Record<string, string> = {};
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("csv") ?? formData.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { error: "Geen CSV-bestand. Stuur een bestand met key 'csv'." },
          { status: 400 }
        );
      }
      csvText = await file.text();
      const mappingStr = formData.get("mapping");
      if (typeof mappingStr === "string") {
        try {
          mapping = JSON.parse(mappingStr) as Record<string, string>;
        } catch {
          // ignore
        }
      }
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      csvText = body.csv ?? body.data ?? body.content ?? "";
      if (typeof csvText !== "string") {
        return NextResponse.json(
          { error: "JSON body moet 'csv' (string) bevatten." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Stuur multipart/form-data met een CSV-bestand of JSON met 'csv'." },
        { status: 400 }
      );
    }

    const parseResult = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: "CSV parsefout: " + parseResult.errors[0].message },
        { status: 400 }
      );
    }

    const rows = parseResult.data;
    const columnNames = rows.length > 0 ? Object.keys(rows[0]) : [];

    const normalizedRows = rows.map((row) => {
      const get = (targetKey: string, fallbackKeys: string[]) => {
        const mapped = mapping[targetKey];
        if (mapped && row[mapped] !== undefined && row[mapped] !== null && String(row[mapped]).trim() !== "") {
          return String(row[mapped]).trim();
        }
        for (const k of fallbackKeys) {
          const v = row[k];
          if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
        }
        return "";
      };
      return {
        naam: get("naam", ["naam", "name", "Naam", "productnaam", "Productnaam"]),
        sku: get("sku", ["sku", "SKU", "artikelnummer", "Artikelcode"]),
        ean: get("ean", ["ean", "EAN", "barcode", "gtin"]) || undefined,
        merkId: get("merkId", ["merkId", "merk_id", "merk", "brand", "Merk"]).toLowerCase().replace(/\s+/g, "-") || undefined,
        prijs: get("prijs", ["prijs", "price", "Prijs", "Prijs excl"]),
        voorraad: get("voorraad", ["voorraad", "stock", "Voorraad"]),
        beschrijving: get("beschrijving", ["beschrijving", "description", "Beschrijving", "Omschrijving"]),
        specificaties: get("specificaties", ["specificaties", "specs", "Specificaties"]),
        imageFileName: get("imageFileName", ["imageFileName", "image_file", "foto", "afbeelding", "Afbeelding"]),
      };
    });

    let upserted = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < normalizedRows.length; i++) {
      const r = normalizedRows[i];
      const rowNum = i + 2;

      if (!r.naam || !r.sku) {
        errors.push({ row: rowNum, message: "Naam en SKU zijn verplicht." });
        continue;
      }

      const merkId = r.merkId && VALID_MERK_IDS.has(r.merkId) ? r.merkId : MERKEN[0].id;
      const prijs = parsePrijs(r.prijs);
      if (prijs === null || prijs < 0) {
        errors.push({ row: rowNum, message: "Ongeldige prijs: " + (r.prijs || "(leeg)") });
        continue;
      }

      const voorraad = parseVoorraad(r.voorraad);
      const imageUrl = r.imageFileName
        ? (r.imageFileName.startsWith("http") ? r.imageFileName : "/uploads/producten/" + r.imageFileName)
        : undefined;

      const id = `p-${Date.now()}-${i}`;
      const { error } = await supabase.from("products").upsert(
        {
          id,
          merk_id: merkId,
          naam: r.naam,
          sku: r.sku,
          ean: r.ean || null,
          prijs,
          voorraad: voorraad ?? null,
          beschrijving: r.beschrijving || null,
          specificaties: r.specificaties || null,
          image_url: imageUrl ?? null,
        },
        { onConflict: "sku" }
      );
      if (error) {
        errors.push({ row: rowNum, message: error.message });
        continue;
      }
      upserted++;
    }

    return NextResponse.json({
      success: true,
      upserted,
      total: rows.length,
      errors: errors.slice(0, 50),
    });
  } catch (e) {
    console.error("POST /api/producten/import", e);
    return NextResponse.json(
      { error: "Import mislukt." },
      { status: 500 }
    );
  }
}
