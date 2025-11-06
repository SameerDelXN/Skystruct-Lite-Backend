import dbConnect from "@/lib/dbConnect";
import Document from "@/models/Document";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const document = await Document.findById(params.id).populate("uploadedBy projectId");
  if (!document)
    return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: document });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const document = await Document.findById(params.id);
  if (!document)
    return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });

  if (!isAdmin(session.role) && document.uploadedBy.toString() !== session._id.toString())
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });

  await Document.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true, message: "Document deleted successfully" });
}
