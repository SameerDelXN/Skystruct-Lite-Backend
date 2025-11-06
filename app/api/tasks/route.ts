import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const tasks = await Task.find()
    .populate("projectId assignedTo createdBy")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: tasks });
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const project = await Project.findById(body.projectId);
  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  const task = await Task.create({
    ...body,
    createdBy: session._id,
    status: "pending",
  });

  return NextResponse.json({
    success: true,
    message: "Task created successfully",
    data: task,
  });
}
