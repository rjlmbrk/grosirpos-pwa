import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "@/lib/jwt";

const publicRoutes = ["/login"];

const roleRoutes: Record<string, string[]> = {
  admin: ["/dashboard", "/products", "/cashier", "/transactions", "/reports", "/users"],
  kasir: ["/dashboard", "/cashier"],
};

const allProtectedRoutes = Array.from(
  new Set(Object.values(roleRoutes).flat()),
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  if (publicRoutes.includes(pathname)) {
    if (token) {
      const payload = await verifyTokenEdge(token);
      if (payload) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  const isProtected = allProtectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyTokenEdge(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }

    const allowedRoutes = roleRoutes[payload.role] || [];
    const hasAccess = allowedRoutes.some((route) =>
      pathname.startsWith(route),
    );

    if (!hasAccess) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
