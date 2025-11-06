import dbConnect from "@/lib/dbConnect";
import Survey from "@/models/Survey";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const survey = await Survey.findById(params.id)
    .populate("requestedBy approvedBy projectId");
  if (!survey)
    return NextResponse.json({ success: false, message: "Survey not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: survey });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const updates = await req.json();
  const survey = await Survey.findById(params.id);
  if (!survey)
    return NextResponse.json({ success: false, message: "Survey not found" }, { status: 404 });

  if (survey.requestedBy.toString() !== session._id.toString())
    return NextResponse.json({ success: false, message: "You can only update your own survey" }, { status: 403 });

  Object.assign(survey, updates);
  await survey.save();

  return NextResponse.json({ success: true, message: "Survey updated successfully", data: survey });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Only admin can delete surveys" }, { status: 403 });

  const deleted = await Survey.findByIdAndDelete(params.id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Survey not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Survey deleted successfully" });
}
