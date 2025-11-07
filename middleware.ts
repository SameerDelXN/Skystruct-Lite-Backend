import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh-token",
  "/api/auth/password/forgot",
  "/api/auth/password/reset",
  "/api/utils/health",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes without auth
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) return NextResponse.next();

  // Get token from Authorization header or cookie
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("app_session")?.value;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : cookieToken;

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
  }

  // 🛠 Fix for old tokens with ObjectId buffer
  let userId = (decoded as any)._id;
  if (userId && typeof userId === "object" && userId.buffer) {
    const byteArray = Object.values(userId.buffer); // ✅ Convert object to array
    userId = Buffer.from(byteArray).toString("hex"); // ✅ Convert to ObjectId string
  }

  console.log("✅ Decoded userId:", userId);
  console.log("✅ Role:", (decoded as any).role);

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
