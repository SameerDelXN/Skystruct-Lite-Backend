import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";

// ✅ Get all transactions
export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const transactions = await Transaction.find()
    .populate("projectId createdBy approvedBy materialId")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: transactions });
}

// ✅ Create new transaction
export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Validate project existence
  const project = await Project.findById(body.projectId);
  if (!project)
    return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

  // Create transaction
  const transaction = await Transaction.create({
    ...body,
    createdBy: session._id,
    status: "pending",
  });

  return NextResponse.json({
    success: true,
    message: "Transaction created successfully",
    data: transaction,
  });
}
