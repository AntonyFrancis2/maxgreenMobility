import "server-only";

type GitHubWriteResult = { ok: true; committedPath: string; commitSha: string };

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} environment variable`);
  return v;
}

function githubConfig() {
  const token = requiredEnv("GITHUB_TOKEN");
  const repo = requiredEnv("GITHUB_REPO"); // "owner/name"
  const branch = process.env.GITHUB_BRANCH || "main";
  const contentRoot = process.env.GITHUB_CONTENT_ROOT ?? "web"; // repo subdir that contains `content/`
  const apiBase = process.env.GITHUB_API_BASE ?? "https://api.github.com";

  const [owner, name] = repo.split("/");
  if (!owner || !name) throw new Error(`GITHUB_REPO must be "owner/name" (got ${repo})`);

  return { token, owner, name, branch, contentRoot, apiBase };
}

async function githubRequest(path: string, init: RequestInit) {
  const { token, apiBase } = githubConfig();
  const res = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub API ${res.status} ${res.statusText}: ${text}`);
  }

  return res;
}

async function getFileSha(repoPath: string, ref: string): Promise<string | null> {
  const { owner, name } = githubConfig();
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${name}/contents/${encodeURIComponent(repoPath).replaceAll(
      "%2F",
      "/"
    )}?ref=${encodeURIComponent(ref)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubConfig().token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    }
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub API ${res.status} ${res.statusText}: ${text}`);
  }

  const json = (await res.json()) as { sha?: string };
  return json.sha ?? null;
}

export function githubEnabled() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

export function toRepoContentPath(relativeToContentRoot: string) {
  const { contentRoot } = githubConfig();
  const root = contentRoot.trim().replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
  const rel = relativeToContentRoot.trim().replaceAll("\\", "/").replace(/^\/+/, "");
  return root ? `${root}/${rel}` : rel;
}

export async function commitTextFile(opts: {
  repoPath: string; // e.g. "web/content/site.json"
  text: string;
  message: string;
}): Promise<GitHubWriteResult> {
  const { owner, name, branch } = githubConfig();
  const sha = await getFileSha(opts.repoPath, branch);

  const body = {
    message: opts.message,
    content: Buffer.from(opts.text, "utf8").toString("base64"),
    branch,
    ...(sha ? { sha } : {}),
  };

  const res = await githubRequest(`/repos/${owner}/${name}/contents/${opts.repoPath}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as { commit?: { sha?: string } };
  const commitSha = json.commit?.sha;
  if (!commitSha) throw new Error("GitHub commit succeeded but no commit SHA returned");

  return { ok: true, committedPath: opts.repoPath, commitSha };
}

export async function commitBinaryFile(opts: {
  repoPath: string; // e.g. "web/public/media/uploads/pic.png"
  buffer: Buffer;
  message: string;
}): Promise<GitHubWriteResult> {
  const { owner, name, branch } = githubConfig();
  const sha = await getFileSha(opts.repoPath, branch);

  const body = {
    message: opts.message,
    content: opts.buffer.toString("base64"),
    branch,
    ...(sha ? { sha } : {}),
  };

  const res = await githubRequest(`/repos/${owner}/${name}/contents/${opts.repoPath}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as { commit?: { sha?: string } };
  const commitSha = json.commit?.sha;
  if (!commitSha) throw new Error("GitHub commit succeeded but no commit SHA returned");

  return { ok: true, committedPath: opts.repoPath, commitSha };
}


