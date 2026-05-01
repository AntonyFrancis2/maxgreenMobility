import "server-only";

import path from "path";
import { readdir, readFile } from "fs/promises";
import type { Product, SiteConfig } from "@/lib/site";
import { resolveHomeTileToProduct } from "@/lib/homeProducts";

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

/**
 * For each Home product tile that does not map to an existing JSON catalog entry,
 * creates `content/products/product-{n}.json` and rewrites the tile href.
 * Existing matches get a canonical `/solutions?product=<id>` href.
 */
export async function provisionProductsForHomeTiles(
  site: SiteConfig,
  cwd: string
): Promise<{ site: SiteConfig; created: { id: string; body: string }[] }> {
  const dir = path.join(cwd, "content", "products");
  const jsonNames = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".json"));
  const fileBasenames = new Set(jsonNames.map((f) => path.basename(f, ".json")));

  let catalog: Product[] = [];
  for (const file of jsonNames) {
    try {
      const raw = await readFile(path.join(dir, file), "utf8");
      const p = JSON.parse(raw) as Product;
      if (p?.id) catalog.push(p);
    } catch {
      // ignore broken files for catalog, filename still reserved on disk
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
