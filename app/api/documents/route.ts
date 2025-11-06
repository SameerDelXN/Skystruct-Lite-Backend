import dbConnect from "@/lib/dbConnect";
import Document from "@/models/Document";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const filter: any = {};
  if (projectId) filter.projectId = projectId;

  const documents = await Document.find(filter)
    .populate("uploadedBy projectId")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: documents });
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { name, url, type, projectId } = await req.json();

  const project = await Project.findById(projectId);
  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  const document = await Document.create({
    name,
    url,
    type,
    projectId,
    uploadedBy: session._id,
  });

  return NextResponse.json({ success: true, message: "Document uploaded successfully", data: document });
}
