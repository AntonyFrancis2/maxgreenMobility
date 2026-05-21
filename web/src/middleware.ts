import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin/edit")) return NextResponse.next();

  const authed = req.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";
  if (authed) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/edit", "/admin/edit/:path*"],
};

