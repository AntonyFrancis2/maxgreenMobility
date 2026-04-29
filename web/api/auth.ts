import type { IncomingMessage, ServerResponse } from "http";
import { AuthorizationCode } from "simple-oauth2";
import { randomBytes } from "crypto";
//check
function randomString() {
  return randomBytes(12).toString("hex");
}

function config() {
  const id = process.env.OAUTH_GITHUB_CLIENT_ID;
  const secret = process.env.OAUTH_GITHUB_CLIENT_SECRET;

  if (!id || !secret) {
    throw new Error("Missing OAUTH_GITHUB_CLIENT_ID / OAUTH_GITHUB_CLIENT_SECRET");
  }

  return {
    client: { id, secret },
    auth: {
      tokenHost: "https://github.com",
      tokenPath: "/login/oauth/access_token",
      authorizePath: "/login/oauth/authorize",
    },
  };
}

const handler = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const host = req.headers.host ?? "";
    const url = new URL(`https://${host}${req.url ?? "/api/auth"}`);
    const provider = (url.searchParams.get("provider") ?? "github") === "github" ? "github" : "github";

    const client = new AuthorizationCode(config());

    const authorizationUri = client.authorizeURL({
      redirect_uri: `https://${host}/api/callback?provider=${provider}`,
      scope: "repo,user",
      state: randomString(),
    });

    res.writeHead(302, { Location: authorizationUri });
    res.end();
  } catch (e) {
    res.statusCode = 500;
    res.end(String(e));
  }
};

export default handler;

