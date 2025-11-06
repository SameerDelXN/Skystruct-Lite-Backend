import dbConnect from "@/lib/dbConnect";
import Support from "@/models/Support";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess, isAdmin } from "@/utils/permissions";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const ticket = await Support.findById(params.id)
    .populate("userId assignedTo replies.userId");
  if (!ticket)
    return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });

  if (
    !canAccess(session.role, ["admin", "manager"]) &&
    ticket.userId.toString() !== session._id.toString()
  )
    return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });

  return NextResponse.json({ success: true, data: ticket });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { status, assignedTo, remarks } = await req.json();

  const ticket = await Support.findById(params.id);
  if (!ticket)
    return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });

  if (!canAccess(session.role, ["admin", "manager"]))
    return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });

  if (status) ticket.status = status;
  if (assignedTo) ticket.assignedTo = assignedTo;
  if (remarks) ticket.remarks = remarks;

  await ticket.save();

  return NextResponse.json({ success: true, message: "Ticket updated successfully", data: ticket });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Only admin can delete tickets" }, { status: 403 });

  const deleted = await Support.findByIdAndDelete(params.id);
  if (!deleted)
    return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Ticket deleted successfully" });
}
