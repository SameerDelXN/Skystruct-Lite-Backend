import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess, isAdmin } from "@/utils/permissions";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ unwrap Promise

  const project = await Project.findById(id).populate("manager engineers");
  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: project });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const { id } = await context.params; // ✅ unwrap Promise

  const updates = await req.json();
  const project = await Project.findByIdAndUpdate(id, updates, { new: true }).populate("manager engineers");

  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  return NextResponse.json({
    success: true,
    message: "Project updated successfully",
    data: project,
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json(
      { success: false, message: "Only admin can delete projects" },
      { status: 403 }
    );

  const { id } = await context.params; // ✅ unwrap Promise

  const deleted = await Project.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Project deleted successfully" });
}
