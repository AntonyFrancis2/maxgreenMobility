import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import type { SiteConfig } from "@/lib/site";
import { provisionProductsForHomeTiles } from "@/lib/provisionHomeProducts";
import { getSiteRuntime } from "@/lib/runtimeContent";
import path from "path";
import { writeFile } from "fs/promises";
import { commitTextFile, githubEnabled, toRepoContentPath } from "@/lib/githubContent";

export async function GET() {
  if (!(await isAdminAuthed())) return new NextResponse("Unauthorized", { status: 401 });
  // Read latest from disk (avoid stale static import caching).
  const site = await getSiteRuntime();
  return NextResponse.json(site);
}

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) return new NextResponse("Unauthorized", { status: 401 });
  const site = (await req.json()) as SiteConfig;

  try {
    // Strip any accidental top-level keys like "brand.name" introduced by faulty editors.
    const cleaned = Object.fromEntries(
      Object.entries(site as unknown as Record<string, unknown>).filter(([k]) => !k.includes("."))
    ) as unknown as SiteConfig;

    const hpItems = cleaned.home?.products?.items;
    if (!Array.isArray(hpItems)) {
      cleaned.home = {
        ...cleaned.home,
        products: {
          ...cleaned.home.products,
          items: [],
        },
      };
    }

    const cwd = process.cwd();
    const { site: siteProvisioned, created } = await provisionProductsForHomeTiles(cleaned, cwd);

    const createdIds = created.map((c) => c.id);

    for (const row of created) {
      const relPath = `content/products/${row.id}.json`;
      if (githubEnabled()) {
        await commitTextFile({
          repoPath: toRepoContentPath(relPath),
          text: row.body,
          message: `Admin: add ${row.id}.json`,
        });
      } else {
        await writeFile(path.join(cwd, relPath), row.body, "utf8");
      }
    }

    const text = JSON.stringify(siteProvisioned, null, 2) + "\n";

    if (githubEnabled()) {
      const result = await commitTextFile({
        repoPath: toRepoContentPath("content/site.json"),
        text,
        message: `Admin: update site config (${new Date().toISOString()})`,
      });
      return NextResponse.json({
        ...result,
        persisted: "github",
        createdProductIds: createdIds,
        site: siteProvisioned,
      });
    }

    // Local-dev persistence: write back into the repo file.
    // Note: On Vercel, filesystem writes are not guaranteed to persist unless using GitHub persistence above.
    const filePath = path.join(cwd, "content", "site.json");
    await writeFile(filePath, text, "utf8");
    return NextResponse.json({
      ok: true,
      persisted: "fs",
      createdProductIds: createdIds,
      site: siteProvisioned,
    });
  } catch (e) {
    return new NextResponse(`Failed to save on server: ${String(e)}`, { status: 500 });
  }
}
