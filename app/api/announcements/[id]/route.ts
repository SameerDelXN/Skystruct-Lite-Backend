import dbConnect from "@/lib/dbConnect";
import Announcement from "@/models/Announcement";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess, isAdmin } from "@/utils/permissions";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  const announcement = await Announcement.findById(params.id).populate("createdBy", "name email");
  if (!announcement)
    return NextResponse.json({ success: false, message: "Announcement not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: announcement });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const updates = await req.json();
  const updated = await Announcement.findByIdAndUpdate(params.id, updates, { new: true });

  return NextResponse.json({ success: true, message: "Announcement updated", data: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Only admin can delete announcements" }, { status: 403 });

  await Announcement.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true, message: "Announcement deleted successfully" });
}
