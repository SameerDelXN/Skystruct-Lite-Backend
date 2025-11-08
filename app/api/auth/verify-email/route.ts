import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token)
    return NextResponse.json({ success: false, message: "Missing verification token" }, { status: 400 });

  const user = await User.findOne({ emailVerificationToken: token });

  if (!user)
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 400 });

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  await user.save();

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/verified`);
}
