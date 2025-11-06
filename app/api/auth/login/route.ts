import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 400 });

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ success: false, message: "Incorrect password" }, { status: 401 });

  const token = signToken({ _id: user._id, role: user.role });
  await createSession(user._id.toString());

  user.lastLogin = new Date();
  await user.save();

  return NextResponse.json({
    success: true,
    message: "Login successful",
    data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
  });
}
