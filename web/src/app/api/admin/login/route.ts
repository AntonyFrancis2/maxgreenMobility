import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, ADMIN_PASS, ADMIN_USER } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | { user?: string; pass?: string };
  const user = body?.user ?? "";
  const pass = body?.pass ?? "";

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return new NextResponse("Invalid credentials", { status: 401 });
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ ok: true });  
  //test
}

