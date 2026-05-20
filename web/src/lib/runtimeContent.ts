import "server-only";

import path from "path";
import { readFile, readdir } from "fs/promises";
import { unstable_noStore as noStore } from "next/cache";
import type { BlogPost, Product, SiteConfig } from "@/lib/site";

async function readJson<T>(absPath: string): Promise<T> {
  const raw = await readFile(absPath, "utf8");
  return JSON.parse(raw) as T;
}

export async function getSiteRuntime(): Promise<SiteConfig> {
  // Ensure we read from disk each request in dev/admin flows.
  noStore();
  const filePath = path.join(process.cwd(), "content", "site.json");
  return await readJson<SiteConfig>(filePath);
}

export async function getProductsRuntime(): Promise<Product[]> {
  noStore();
  const dir = path.join(process.cwd(), "content", "products");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  const products: Product[] = [];
  for (const f of files) {
    try {
      products.push(await readJson<Product>(path.join(dir, f)));
    } catch {
      // ignore
    }
  }
  return products;
}

export async function getBlogPostsRuntime(
  filter: "all" | "published" = "published"
): Promise<BlogPost[]> {
  noStore();
  const dir = path.join(process.cwd(), "content", "blog");
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return []; // directory doesn't exist yet
  }
  const posts: BlogPost[] = [];
  for (const f of files) {
    try {
      const post = await readJson<BlogPost>(path.join(dir, f));
      if (filter === "all" || post.status === "published") {
        posts.push(post);
      }
    } catch {
      // ignore malformed files
    }
  }
  // Sort by publishedAt descending (newest first)
  posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return posts;
}

export async function getBlogPostRuntime(slug: string): Promise<BlogPost | null> {
  noStore();
  const filePath = path.join(process.cwd(), "content", "blog", `${slug}.json`);
  try {
    return await readJson<BlogPost>(filePath);
  } catch {
    return null;
  }
}

