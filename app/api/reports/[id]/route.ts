import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin, canAccess } from "@/utils/permissions";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const report = await Report.findById(params.id)
    .populate("projectId createdBy sharedWith");
  if (!report)
    return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: report });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const updates = await req.json();
  const report = await Report.findById(params.id);
  if (!report)
    return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });

  if (!canAccess(session.role, ["admin", "manager"]) && report.createdBy.toString() !== session._id.toString())
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });

  Object.assign(report, updates);
  await report.save();

  return NextResponse.json({ success: true, message: "Report updated successfully", data: report });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Only admin can delete reports" }, { status: 403 });

  const deleted = await Report.findByIdAndDelete(params.id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Report deleted successfully" });
}
