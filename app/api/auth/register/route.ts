import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { registerSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, message: "Invalid data", errors: parsed.error.errors }, { status: 400 });

  const { name, email, password, role } = parsed.data;
  const existingUser = await User.findOne({ email });
  if (existingUser)
    return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role });

  return NextResponse.json({ success: true, message: "User registered successfully", data: user }, { status: 201 });
}
