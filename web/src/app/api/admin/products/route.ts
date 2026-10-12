import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import path from "path";
import { writeFile } from "fs/promises";
import { ensureProductJsonShape } from "@/lib/coerceProduct";
import { commitTextFile, githubEnabled, toRepoContentPath } from "@/lib/githubContent";
import { getProductFilesRuntime } from "@/lib/runtimeContent";

function productsDir() {
  return path.join(process.cwd(), "content", "products");
}

export async function GET() {
  if (!(await isAdminAuthed())) return new NextResponse("Unauthorized", { status: 401 });

  // Read from the same source the public site uses; on Vercel the bundled files are only a
  // snapshot from the last deploy and miss products the admin added since.
  let files: { filename: string; raw: string | null }[];
  try {
    files = await getProductFilesRuntime();
  } catch (e) {
    return new NextResponse(`Failed to load products: ${String(e)}`, { status: 502 });
  }

  const products: { filename: string; json: unknown }[] = files.map(({ filename, raw }) => {
    try {
      return { filename, json: raw === null ? null : ensureProductJsonShape(JSON.parse(raw)) };
    } catch {
      return { filename, json: null };
    }
  });

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

