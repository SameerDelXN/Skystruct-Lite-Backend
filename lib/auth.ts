import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import dbConnect from "./dbConnect";
import User from "@/models/User";

export async function getSession(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("⚠️ No authorization header found");
      return null;
    }

    const token = authHeader.split(" ")[1];
    console.log("🪪 Token received:", token);

    const decoded = await verifyToken(token);
    console.log("🧩 Decoded payload:", decoded);
    if (!decoded) return null;

    // 🛠 Fix for ObjectId buffer-based _id
    let userId = (decoded as any)._id;

    if (userId && typeof userId === "object" && userId.buffer) {
      // ✅ Cast safely to number[]
      const byteArray = Array.from(userId.buffer as Uint8Array);
      userId = Buffer.from(byteArray).toString("hex");
    }

    await dbConnect();
    const user = await User.findById(userId).select("-password");

    console.log("👤 Authenticated User:", user);

    if (!user) return null;
    return user;
  } catch (error: any) {
    console.error("❌ Error in getSession:", error.message);
    return null;
  }
}

export async function requireAuth(req: NextRequest) {
  const user = await getSession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return user;
}
