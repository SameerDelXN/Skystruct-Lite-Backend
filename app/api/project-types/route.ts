import dbConnect from "@/lib/dbConnect";
import ProjectType from "@/models/ProjectType";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

// ✅ CREATE Project Type
export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
    console.log("Session in project type POST:", session);
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, description, category,image } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
    }

    const existing = await ProjectType.findOne({ name });
    if (existing) {
      return NextResponse.json({ success: false, message: "Project type already exists" }, { status: 409 });
    }

    const type = await ProjectType.create({
      name,
      description,
      category,
      image,
      createdBy: session._id,
    });

    return NextResponse.json({ success: true, message: "Project type created", data: type }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating project type:", error.message);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ✅ GET All Project Types
export async function GET() {
  await dbConnect();

  try {
    const types = await ProjectType.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: types });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to fetch project types" }, { status: 500 });
  }
}
