import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const projects = await Project.find().populate("manager engineers").sort({ createdAt: -1 });
  return NextResponse.json({ success: true, data: projects });
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const existing = await Project.findOne({ projectCode: body.projectCode });
  if (existing)
    return NextResponse.json({ success: false, message: "Project code already exists" }, { status: 400 });

  const project = await Project.create({
    ...body,
    manager: session._id,
    status: "ongoing",
  });

  return NextResponse.json({ success: true, message: "Project created successfully", data: project }, { status: 201 });
}
