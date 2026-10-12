import "server-only";

import path from "path";
import { unlink } from "fs/promises";
import type { Product, SiteConfig } from "@/lib/site";
import { deleteRepoFile, githubEnabled, toRepoContentPath } from "@/lib/githubContent";
import { resolveHomeTileToProduct } from "@/lib/homeProducts";
import { getProductFilesRuntime } from "@/lib/runtimeContent";

function nextIterativeProductNumber(catalog: Product[], fileBasenames: Set<string>): number {
  let max = 0;
  const re = /^product-(\d+)$/i;
  for (const p of catalog) {
    const m = p.id.match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  for (const base of fileBasenames) {
    const m = base.match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

export function createDefaultProductJson(id: string, name: string): Product {
  const display = name.trim() || id;
  return {
    id,
    name: display,
    tagline: "Add a short tagline in Admin → Solutions → Products.",
    media: {
      mainImage: "/media/maxgreen1.jpeg",
      demoVideo: {
        kind: "youtube",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
      views: [{ id: "v1", label: "View 1", image: "/media/products/e-loader.svg" }],
    },
    specs: [{ label: "Specification", value: "Edit in Solutions → Products" }],
    features: ["Edit key features in Admin → Solutions → Products."],
    kpis: [
      { label: "Metric", value: "—", subLabel: "Editable KPI", tone: "brand" },
    ],
    cta: {
      title: `Interested in ${display}?`,
      subtitle: "Get in touch for a demo or quote.",
      primary: "Request a Quote",
      secondary: "Schedule Demo",
    },
  };
}

/** Live catalog as filename → parsed product (unparseable files are skipped). */
export async function loadProductCatalogFiles(): Promise<{ filename: string; product: Product }[]> {
  const out: { filename: string; product: Product }[] = [];
  for (const { filename, raw } of await getProductFilesRuntime()) {
    if (raw === null) continue;
    try {
      const product = JSON.parse(raw) as Product;
      if (product?.id) out.push({ filename, product });
    } catch {
      // ignore broken files
    }
  }
  return out;
}

/** Product filenames that the given Home tiles resolve to (same matching as the public pages). */
export function productFilesUsedByTiles(
  items: { label: string; href: string }[],
  catalogFiles: { filename: string; product: Product }[]
): Set<string> {
  const catalog = catalogFiles.map((c) => c.product);
  const used = new Set<string>();
  for (const item of items) {
    const matched = resolveHomeTileToProduct(item, catalog);
    const entry = matched && catalogFiles.find((c) => c.product === matched);
    if (entry) used.add(entry.filename);
  }
  return used;
}

/** Deletes `content/products/<filename>` (a GitHub commit when configured, else from disk). */
export async function deleteProductFile(filename: string): Promise<void> {
  if (!filename.endsWith(".json") || filename.includes("/") || filename.includes("\\")) {
    throw new Error(`Invalid product filename: ${filename}`);
  }
  if (githubEnabled()) {
    await deleteRepoFile({
      repoPath: toRepoContentPath(`content/products/${filename}`),
      message: `Admin: delete product ${filename}`,
    });
    return;
  }
  await unlink(path.join(process.cwd(), "content", "products", filename)).catch(() => {});
}

/**
 * For each Home product tile that does not map to an existing JSON catalog entry,
 * creates `content/products/product-{n}.json` and rewrites the tile href.
 * Existing matches get a canonical `/solutions?product=<id>` href.
 */
export async function provisionProductsForHomeTiles(
  site: SiteConfig
): Promise<{ site: SiteConfig; created: { id: string; body: string }[] }> {
  // Must read the live catalog (GitHub when configured). Reading the deployed snapshot made
  // every save re-create products added since the last deploy, overwriting their edits.
  const productFiles = await getProductFilesRuntime();
  const fileBasenames = new Set(productFiles.map((f) => path.basename(f.filename, ".json")));

  let catalog: Product[] = [];
  for (const { raw } of productFiles) {
    if (raw === null) continue; // filename still reserved
    try {
      const p = JSON.parse(raw) as Product;
      if (p?.id) catalog.push(p);
    } catch {
      // ignore broken files for catalog, filename still reserved
    }
  }

  const created: { id: string; body: string }[] = [];
  const items = [...(site.home.products.items ?? [])];
  const newItems: { label: string; href: string }[] = [];

  let nextNum = nextIterativeProductNumber(catalog, fileBasenames);

  for (const item of items) {
    const matched = resolveHomeTileToProduct(item, catalog);
    if (matched) {
      newItems.push({
        label: item.label?.trim() || matched.name,
        href: `/solutions?product=${encodeURIComponent(matched.id)}`,
      });
      continue;
    }

    let id = `product-${nextNum}`;
    while (catalog.some((p) => p.id === id) || fileBasenames.has(id)) {
      nextNum++;
      id = `product-${nextNum}`;
    }
    nextNum++;

    const product = createDefaultProductJson(id, item.label?.trim() || id);
    catalog = [...catalog, product];
    fileBasenames.add(id);
    const body = JSON.stringify(product, null, 2) + "\n";
    created.push({ id, body });
    newItems.push({
      label: item.label?.trim() || product.name,
      href: `/solutions?product=${encodeURIComponent(id)}`,
    });
  }

  return {
    site: {
      ...site,
      home: {
        ...site.home,
        products: {
          ...site.home.products,
          items: newItems,
        },
      },
    },
    created,
  };
}
