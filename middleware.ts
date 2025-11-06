import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh-token",
  "/api/auth/password/forgot",
  "/api/auth/password/reset",
  "/api/utils/health"
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) return NextResponse.next();

  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("app_session")?.value;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : cookieToken;

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
