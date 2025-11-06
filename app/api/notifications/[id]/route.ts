import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const notification = await Notification.findById(params.id)
    .populate("sender", "name role")
    .populate("recipient", "name");
  if (!notification)
    return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 });

  if (notification.recipient.toString() !== session._id.toString())
    return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });

  return NextResponse.json({ success: true, data: notification });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const deleted = await Notification.findOneAndDelete({
    _id: params.id,
    recipient: session._id,
  });

  if (!deleted)
    return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Notification deleted successfully" });
}
