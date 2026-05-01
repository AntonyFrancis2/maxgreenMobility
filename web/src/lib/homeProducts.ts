import type { Product } from "@/lib/site";

/** Lowercase ascii-ish slug for matching labels to catalog ids/names */
function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Map query param ids, product ids, names, and slugs → Product (first wins per key). */
function buildCatalogAliasMap(catalog: Product[]): Map<string, Product> {
  const m = new Map<string, Product>();
  for (const p of catalog) {
    const keys = new Set([
      p.id,
      p.id.toLowerCase(),
      slugify(p.id),
      p.name.trim(),
      p.name.trim().toLowerCase(),
      slugify(p.name),
    ]);
    for (const k of keys) {
      const key = k.trim();
      if (key && !m.has(key)) m.set(key, p);
      const slug = slugify(k);
      if (slug && !m.has(slug)) m.set(slug, p);
    }
  }
  return m;
}

function resolveItemToProduct(
  item: { label: string; href: string },
  catalog: Product[],
  byId: Map<string, Product>,
  aliases: Map<string, Product>
): Product | null {
  const label = item.label?.trim() ?? "";
  const href = item.href?.trim() ?? "";
  let id: string | null = null;

  try {
    if (href) {
      const u = new URL(href, "https://preview.local");
      const raw = u.searchParams.get("product")?.trim();
      if (raw) {
        try {
          id = decodeURIComponent(raw);
        } catch {
          id = raw;
        }
      }
    }
    if (!id && href.includes("?")) {
      const qs = href.slice(href.indexOf("?") + 1).split("#")[0];
      id = new URLSearchParams(qs).get("product")?.trim() ?? null;
      if (id) {
        try {
          id = decodeURIComponent(id);
        } catch {
          /* keep */
        }
      }
    }
  } catch {
    id = null;
  }

  if (id) {
    const p = byId.get(id) ?? aliases.get(id) ?? aliases.get(id.toLowerCase()) ?? aliases.get(slugify(id));
    if (p) return p;
  }

  const hrefLc = href.toLowerCase();
  if (hrefLc.includes("/solutions")) {
    for (const p of catalog) {
      if (hrefLc.includes(p.id.toLowerCase())) return p;
      if (hrefLc.includes(slugify(p.id))) return p;
    }
  }

  const labelSlug = slugify(label);
  if (labelSlug) {
    const fromSlug =
      aliases.get(labelSlug) ?? aliases.get(label.toLowerCase()) ?? aliases.get(label.trim().toLowerCase());
    if (fromSlug) return fromSlug;
  }

  const labelLower = label.toLowerCase();
  for (const p of catalog) {
    if (p.name.trim().toLowerCase() === labelLower) return p;
    if (slugify(p.name) === labelSlug && labelSlug) return p;
  }

  return null;
}

/** Resolve a homepage product tile to an on-disk catalog entry (or null if none match). */
export function resolveHomeTileToProduct(
  item: { label: string; href: string },
  catalog: Product[]
): Product | null {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const aliases = buildCatalogAliasMap(catalog);
  return resolveItemToProduct(item, catalog, byId, aliases);
}

/**
 * Solutions page listing: **only** products that appear as tiles on Home, in tile order.
 * No fallback to full catalog (empty homepage → empty list).
 */
export function orderedProductsFromHomeItems(
  items: { label: string; href: string }[],
  catalog: Product[]
): Product[] {
  if (!items.length) return [];

  const byId = new Map(catalog.map((p) => [p.id, p]));
  const aliases = buildCatalogAliasMap(catalog);

  const seen = new Set<string>();
  const out: Product[] = [];

  for (const item of items) {
    const p = resolveItemToProduct(item, catalog, byId, aliases);
    if (p && !seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
  }

  return out;
}
