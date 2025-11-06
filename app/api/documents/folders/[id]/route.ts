import dbConnect from "@/lib/dbConnect";
import Folder from "@/models/Folder";
import Document from "@/models/Document";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const folder = await Folder.findById(params.id).populate("createdBy projectId parentFolderId");
  if (!folder)
    return NextResponse.json({ success: false, message: "Folder not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: folder });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const folder = await Folder.findById(params.id);
  if (!folder)
    return NextResponse.json({ success: false, message: "Folder not found" }, { status: 404 });

  const { name } = await req.json();
  folder.name = name;
  await folder.save();

  return NextResponse.json({ success: true, message: "Folder renamed successfully", data: folder });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const folder = await Folder.findById(params.id);
  if (!folder)
    return NextResponse.json({ success: false, message: "Folder not found" }, { status: 404 });

  if (!isAdmin(session.role) && folder.createdBy.toString() !== session._id.toString())
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });

  await Document.deleteMany({ folderId: folder._id });
  await Folder.findByIdAndDelete(folder._id);

  return NextResponse.json({ success: true, message: "Folder and its documents deleted successfully" });
}
