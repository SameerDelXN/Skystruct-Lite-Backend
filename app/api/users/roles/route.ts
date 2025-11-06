import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  await dbConnect();
  const admin = await getSession(req as any);
  if (!admin || !isAdmin(admin.role))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { userId, newRole } = await req.json();
  if (!userId || !newRole)
    return NextResponse.json({ success: false, message: "User ID and new role required" }, { status: 400 });

  const user = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true }).select("-password");
  if (!user)
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Role updated successfully", data: user });
}
