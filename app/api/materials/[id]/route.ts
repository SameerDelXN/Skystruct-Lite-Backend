import dbConnect from "@/lib/dbConnect";
import Material from "@/models/Material";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin, canAccess } from "@/utils/permissions";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const material = await Material.findById(params.id).populate("projectId addedBy approvedBy");
  if (!material)
    return NextResponse.json({ success: false, message: "Material not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: material });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const updates = await req.json();
  const material = await Material.findById(params.id);
  if (!material)
    return NextResponse.json({ success: false, message: "Material not found" }, { status: 404 });

  if (!canAccess(session.role, ["admin", "manager"]) && material.addedBy.toString() !== session._id.toString())
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });

  Object.assign(material, updates);
  await material.save();

  return NextResponse.json({ success: true, message: "Material updated successfully", data: material });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Only admin can delete materials" }, { status: 403 });

  const deleted = await Material.findByIdAndDelete(params.id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Material not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Material deleted successfully" });
}
