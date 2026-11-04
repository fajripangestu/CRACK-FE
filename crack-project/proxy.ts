import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const RULES: Record<string, string[]> = {
  "/dashboard/superadmin": ["SUPER_ADMIN"],
  "/dashboard/admin": ["ADMIN"],
  "/dashboard/sales": ["ADMIN"],
  "/dashboard/qa": ["ADMIN"],
  "/dashboard/production": ["ADMIN"],
  "/dashboard/user": ["USER"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // console.log("[proxy]", pathname, "| token ada:", !!token, "| secret ada:", !!process.env.JWT_SECRET);
  // console.log(
  //   "[proxy] panjang secret:", process.env.JWT_SECRET?.length,
  //   "| awal:", process.env.JWT_SECRET?.slice(0, 2),
  //   "| akhir:", process.env.JWT_SECRET?.slice(-2)
  // );

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    // console.log("[proxy] payload:", payload);
    // console.log("[proxy] panjang secret:", process.env.JWT_SECRET?.length);
    const role = payload.role as string;

    const area = Object.keys(RULES).find(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
    if (area && !RULES[area].includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (area === "/dashboard/sales" && payload.department !== "SALES") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (area === "/dashboard/qa" && payload.department !== "QA") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (area === "/dashboard/production" && payload.department !== "PRODUCTION") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    return NextResponse.next();
  } catch (err) {
    console.error("[proxy] verifikasi gagal:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};