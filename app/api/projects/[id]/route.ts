import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess, isAdmin, isManager } from "@/utils/permissions";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const project = await Project.findById(params.id).populate("manager engineers");
  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: project });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const updates = await req.json();
  const project = await Project.findByIdAndUpdate(params.id, updates, { new: true }).populate("manager engineers");
  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Project updated successfully", data: project });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Only admin can delete projects" }, { status: 403 });

  const deleted = await Project.findByIdAndDelete(params.id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Project deleted successfully" });
}
