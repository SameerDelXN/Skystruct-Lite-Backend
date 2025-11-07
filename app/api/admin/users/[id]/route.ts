import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
const {id}= await params;
  const user = await User.findById(id).select("-password");
  if (!user)
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: user });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
const {id}= await params;
  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const updates = await req.json();
  const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");

  return NextResponse.json({ success: true, message: "User updated successfully", data: user });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
const {id}= await params;
  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Only admin can delete users" }, { status: 403 });

  await User.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: "User deleted successfully" });
}
