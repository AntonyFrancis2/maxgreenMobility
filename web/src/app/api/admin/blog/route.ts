import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import path from "path";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { commitTextFile, deleteRepoFile, githubEnabled, toRepoContentPath } from "@/lib/githubContent";
import { getBlogFilesRuntime } from "@/lib/runtimeContent";
import type { BlogPost } from "@/lib/site";

// Admin must always see and act on the latest GitHub content, not the 10s fetch cache.
export const fetchCache = "force-no-store";

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

  // Same source as the public blog (GitHub when configured); the deployed files are a stale snapshot.
  const posts: { filename: string; json: BlogPost | null }[] = (await getBlogFilesRuntime()).map(
    ({ filename, raw }) => {
      try {
        return { filename, json: raw === null ? null : (JSON.parse(raw) as BlogPost) };
      } catch {
        return { filename, json: null };
      }
    }
  );

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

  if (githubEnabled()) {
    const repoPath = toRepoContentPath(`content/blog/${filename}`);
    const result = await commitTextFile({
      repoPath,
      text,
      message: `Admin: update blog post ${filename} (${new Date().toISOString()})`,
    });
    return NextResponse.json({ persisted: "github", ...result });
  }

  await ensureBlogDir();
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

  if (githubEnabled()) {
    try {
      const result = await deleteRepoFile({
        repoPath: toRepoContentPath(`content/blog/${filename}`),
        message: `Admin: delete blog post ${filename}`,
      });
      if (!result) return new NextResponse("File not found", { status: 404 });
    } catch (e) {
      return new NextResponse(`Failed to delete post: ${String(e)}`, { status: 500 });
    }
    return NextResponse.json({ ok: true, deleted: filename, persisted: "github" });
  }

  const filePath = path.join(blogDir(), filename);
  try {
    await unlink(filePath);
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }

  return NextResponse.json({ ok: true, deleted: filename });
}
