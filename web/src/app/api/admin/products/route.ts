import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import path from "path";
import { readdir, readFile, writeFile } from "fs/promises";
import { ensureProductJsonShape } from "@/lib/coerceProduct";
import { commitTextFile, githubEnabled, toRepoContentPath } from "@/lib/githubContent";

function productsDir() {
  return path.join(process.cwd(), "content", "products");
}

export async function GET() {
  if (!(await isAdminAuthed())) return new NextResponse("Unauthorized", { status: 401 });

  const dir = productsDir();
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  const products: { filename: string; json: unknown }[] = [];

  for (const filename of files) {
    try {
      const raw = await readFile(path.join(dir, filename), "utf8");
      products.push({ filename, json: ensureProductJsonShape(JSON.parse(raw)) });
    } catch {
      products.push({ filename, json: null });
    }
  }

  return NextResponse.json({ files: products });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) return new NextResponse("Unauthorized", { status: 401 });
  const body = (await req.json().catch(() => null)) as null | { filename?: string; json?: unknown };
  const filename = body?.filename ?? "";
  if (!filename.endsWith(".json") || filename.includes("/") || filename.includes("\\")) {
    return new NextResponse("Invalid filename", { status: 400 });
  }

  const normalized = ensureProductJsonShape(body?.json ?? {});
  const text = JSON.stringify(normalized, null, 2) + "\n";

  if (githubEnabled()) {
    const repoPath = toRepoContentPath(`content/products/${filename}`);
    const result = await commitTextFile({
      repoPath,
      text,
      message: `Admin: update product ${filename} (${new Date().toISOString()})`,
    });
    return NextResponse.json({ persisted: "github", ...result });
  }

  const filePath = path.join(productsDir(), filename);
  await writeFile(filePath, text, "utf8");
  return NextResponse.json({ ok: true, persisted: "fs" });
}

