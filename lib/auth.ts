import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import dbConnect from "./dbConnect";
import User from "@/models/User";

export async function getSession(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) return null;

  await dbConnect();
  const user = await User.findById((decoded as any)._id).select("-password");
  if (!user) return null;

  return user;
}

export async function requireAuth(req: NextRequest) {
  const user = await getSession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return user;
}
