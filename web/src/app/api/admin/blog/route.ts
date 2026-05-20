import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import path from "path";
import { readdir, readFile, writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { commitTextFile, githubEnabled, toRepoContentPath } from "@/lib/githubContent";
import type { BlogPost } from "@/lib/site";

function blogDir() {
  return path.join(process.cwd(), "content", "blog");
}

async function ensureBlogDir() {
  const dir = blogDir();
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

export async function GET() {
  if (!(await isAdminAuthed())) return new NextResponse("Unauthorized", { status: 401 });

  await ensureBlogDir();
  const dir = blogDir();
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  const posts: { filename: string; json: BlogPost | null }[] = [];

  for (const filename of files) {
    try {
      const raw = await readFile(path.join(dir, filename), "utf8");
      posts.push({ filename, json: JSON.parse(raw) as BlogPost });
    } catch {
      posts.push({ filename, json: null });
    }
  }

  return NextResponse.json({ files: posts });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) return new NextResponse("Unauthorized", { status: 401 });
  const body = (await req.json().catch(() => null)) as null | { filename?: string; json?: BlogPost };
  const filename = body?.filename ?? "";
  if (!filename.endsWith(".json") || filename.includes("/") || filename.includes("\\")) {
    return new NextResponse("Invalid filename", { status: 400 });
  }

  const post = body?.json;
  if (!post) {
    return new NextResponse("Missing post data", { status: 400 });
  }

  // Ensure arrays exist
  if (!Array.isArray(post.tags)) post.tags = [];
  if (!post.seo) post.seo = { title: "", description: "", keywords: [] };
  if (!Array.isArray(post.seo.keywords)) post.seo.keywords = [];

  const text = JSON.stringify(post, null, 2) + "\n";

  await ensureBlogDir();

  if (githubEnabled()) {
    const repoPath = toRepoContentPath(`content/blog/${filename}`);
    const result = await commitTextFile({
      repoPath,
      text,
      message: `Admin: update blog post ${filename} (${new Date().toISOString()})`,
    });
    return NextResponse.json({ persisted: "github", ...result });
  }

  const filePath = path.join(blogDir(), filename);
  await writeFile(filePath, text, "utf8");
  return NextResponse.json({ ok: true, persisted: "fs" });
}

export async function DELETE(req: Request) {
  if (!(await isAdminAuthed())) return new NextResponse("Unauthorized", { status: 401 });
  const body = (await req.json().catch(() => null)) as null | { filename?: string };
  const filename = body?.filename ?? "";
  if (!filename.endsWith(".json") || filename.includes("/") || filename.includes("\\")) {
    return new NextResponse("Invalid filename", { status: 400 });
  }

  const filePath = path.join(blogDir(), filename);
  try {
    await unlink(filePath);
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }

  return NextResponse.json({ ok: true, deleted: filename });
}
