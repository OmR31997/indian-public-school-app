import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Fast, optimistic gate for the admin workspace. The API remains the source
 * of truth for every protected mutation via its JWT guard.
 */
export function proxy(request: NextRequest) {
  const session = request.cookies.get("ips_admin_session")?.value;

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/((?!login(?:/|$)).*)"],
};
