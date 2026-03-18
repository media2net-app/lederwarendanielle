import { NextResponse } from "next/server";
import { writeFileSync, mkdirSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "producten");
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function safeFilename(original: string): string {
  const ext = original.replace(/^.*\.([a-zA-Z0-9]+)$/, "$1").toLowerCase() || "jpg";
  const base = Date.now() + "-" + Math.random().toString(36).slice(2, 9);
  return base + "." + ext;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[] | File[];
    const single = formData.get("file");
    const toProcess: File[] = single ? [single as File] : Array.isArray(files) ? files : [];

    if (toProcess.length === 0) {
      return NextResponse.json(
        { error: "Geen bestanden. Stuur 'file' of 'files'." },
        { status: 400 }
      );
    }

    if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of toProcess) {
      if (!(file instanceof File)) continue;
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(file.name + ": type niet toegestaan (jpeg, png, webp, gif)");
        continue;
      }
      if (file.size > MAX_SIZE) {
        errors.push(file.name + ": te groot (max 5 MB)");
        continue;
      }
      const filename = safeFilename(file.name);
      const path = join(UPLOAD_DIR, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      writeFileSync(path, buffer);
      urls.push("/uploads/producten/" + filename);
    }

    return NextResponse.json({ urls, errors });
  } catch (e) {
    console.error("POST /api/upload/producten", e);
    return NextResponse.json({ error: "Upload mislukt." }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ files: [] });
    }
    const names = readdirSync(UPLOAD_DIR).filter(
      (n) => /\.(jpe?g|png|webp|gif)$/i.test(n)
    );
    const files = names.map((name) => ({
      name,
      url: "/uploads/producten/" + name,
    }));
    return NextResponse.json({ files });
  } catch (e) {
    console.error("GET /api/upload/producten", e);
    return NextResponse.json({ error: "Lijst ophalen mislukt." }, { status: 500 });
  }
}
