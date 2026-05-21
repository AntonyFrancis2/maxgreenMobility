import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { commitBinaryFile, githubEnabled, toRepoContentPath } from "@/lib/githubContent";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) || "uploads";

    if (!file) {
      return new NextResponse("Missing file parameter", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename to alphanumeric, dots, and hyphens
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_");
    const sanitizedFilename = `${baseName}${ext}`;

    // Prevent directory traversal
    const cleanFolder = folder.replace(/\.\./g, "").replace(/^\/+|\/+$/g, "");
    const relativePath = `/media/${cleanFolder}/${sanitizedFilename}`;

    if (githubEnabled()) {
      const repoPath = toRepoContentPath(`public/media/${cleanFolder}/${sanitizedFilename}`);
      await commitBinaryFile({
        repoPath,
        buffer,
        message: `Admin: upload media ${sanitizedFilename} (${new Date().toISOString()})`,
      });
      return NextResponse.json({ path: relativePath, persisted: "github" });
    } else {
      // Local FS write
      const dir = path.join(process.cwd(), "public", "media", cleanFolder);
      await mkdir(dir, { recursive: true });
      const filePath = path.join(dir, sanitizedFilename);
      await writeFile(filePath, buffer);
      return NextResponse.json({ path: relativePath, persisted: "fs" });
    }
  } catch (error: any) {
    return new NextResponse(`Upload failed: ${error.message || error}`, { status: 500 });
  }
}


