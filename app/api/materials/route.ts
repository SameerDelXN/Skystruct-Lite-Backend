import dbConnect from "@/lib/dbConnect";
import Material from "@/models/Material";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const materials = await Material.find()
    .populate("projectId addedBy approvedBy")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: materials });
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const project = await Project.findById(body.projectId);
  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  const material = await Material.create({
    ...body,
    addedBy: session._id,
    status: "pending",
  });

  return NextResponse.json({
    success: true,
    message: "Material added successfully",
    data: material,
  });
}
