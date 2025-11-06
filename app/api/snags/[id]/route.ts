import dbConnect from "@/lib/dbConnect";
import Snag from "@/models/Snag";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin, canAccess } from "@/utils/permissions";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const snag = await Snag.findById(params.id).populate("projectId reportedBy resolvedBy surveyId");
  if (!snag)
    return NextResponse.json({ success: false, message: "Snag not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: snag });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const updates = await req.json();
  const snag = await Snag.findById(params.id);
  if (!snag)
    return NextResponse.json({ success: false, message: "Snag not found" }, { status: 404 });

  if (!canAccess(session.role, ["admin", "manager"]) && snag.reportedBy.toString() !== session._id.toString())
    return NextResponse.json({ success: false, message: "You cannot edit this snag" }, { status: 403 });

  Object.assign(snag, updates);
  await snag.save();

  return NextResponse.json({ success: true, message: "Snag updated successfully", data: snag });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Only admin can delete snags" }, { status: 403 });

  const deleted = await Snag.findByIdAndDelete(params.id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Snag not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Snag deleted successfully" });
}
