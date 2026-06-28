import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req: any) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const user = session?.user as any;

  const isPublic = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"].some(
    (r) => pathname === r || pathname.startsWith(r + "?")
  );
  const isDashboard = ["/dashboard", "/transactions", "/transfer", "/airtime", "/bills", "/beneficiaries", "/cards", "/profile", "/settings", "/notifications"].some(
    (r) => pathname.startsWith(r)
  );
  const isAdmin = pathname.startsWith("/admin");

  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!session && (isDashboard || isAdmin)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session && user?.isSuspended && isDashboard) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session && user?.isRestricted && isDashboard && pathname !== "/restricted") {
    return NextResponse.redirect(new URL("/restricted", req.url));
  }

  if (session && !user?.isRestricted && pathname === "/restricted") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isAdmin && session && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
