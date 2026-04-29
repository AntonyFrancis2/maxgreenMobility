import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} environment variable`);
  return v;
}

function maskToken(token: string) {
  const tail = token.slice(-4);
  return `${"*".repeat(Math.max(0, token.length - 4))}${tail}`;
}

async function gh(path: string) {
  const token = requiredEnv("GITHUB_TOKEN");
  const apiBase = process.env.GITHUB_API_BASE ?? "https://api.github.com";
  const res = await fetch(`${apiBase}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  const text = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, statusText: res.statusText, body: text };
}

export async function GET() {
  if (!(await isAdminAuthed())) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const repo = requiredEnv("GITHUB_REPO"); // "owner/name"
    const branch = process.env.GITHUB_BRANCH || "main";
    const contentRoot = process.env.GITHUB_CONTENT_ROOT ?? "web";
    const apiBase = process.env.GITHUB_API_BASE ?? "https://api.github.com";
    const token = requiredEnv("GITHUB_TOKEN");

    const [owner, name] = repo.split("/");
    if (!owner || !name) throw new Error(`GITHUB_REPO must be "owner/name" (got ${repo})`);

    const repoCheck = await gh(`/repos/${owner}/${name}`);
    const contentsCheck = await gh(
      `/repos/${owner}/${name}/contents/${encodeURIComponent(`${contentRoot}/content/site.json`).replaceAll(
        "%2F",
        "/"
      )}?ref=${encodeURIComponent(branch)}`
    );

    return NextResponse.json({
      config: {
        apiBase,
        repo,
        branch,
        contentRoot,
        tokenMasked: maskToken(token),
        tokenLength: token.length,
      },
      checks: {
        repo: { ok: repoCheck.ok, status: repoCheck.status, statusText: repoCheck.statusText, body: repoCheck.body },
        contents: {
          ok: contentsCheck.ok,
          status: contentsCheck.status,
          statusText: contentsCheck.statusText,
          body: contentsCheck.body,
        },
      },
    });
  } catch (e) {
    return new NextResponse(`GitHub check failed: ${String(e)}`, { status: 500 });
  }
}

