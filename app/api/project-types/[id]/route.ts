import dbConnect from "@/lib/dbConnect";
import ProjectType from "@/models/ProjectType";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

// ✅ GET Single Project Type
export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const type = await ProjectType.findById(params.id);
    if (!type)
      return NextResponse.json({ success: false, message: "Project type not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: type });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Invalid ID format" }, { status: 400 });
  }
}

// ✅ UPDATE Project Type
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  try {
    const updates = await req.json();
    const updated = await ProjectType.findByIdAndUpdate(params.id, updates, { new: true });

    if (!updated)
      return NextResponse.json({ success: false, message: "Project type not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Project type updated", data: updated });
  } catch (error: any) {
    console.error("Error updating project type:", error.message);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

// ✅ DELETE Project Type
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);

  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  try {
    const deleted = await ProjectType.findByIdAndDelete(params.id);
    if (!deleted)
      return NextResponse.json({ success: false, message: "Project type not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Project type deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}
