// app/api/vendors/[id]/route.ts
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

type Params = { params: { id: string } };

// GET /api/vendors/:id
export async function GET(_request: Request, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid vendor ID" }, { status: 400 });
    }
    const vendor = await Vendor.findById(id);
    if (!vendor) return NextResponse.json({ success: false, message: "Vendor not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: vendor }, { status: 200 });
  } catch (err) {
    console.error("GET /api/vendors/:id error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PUT /api/vendors/:id
export async function PUT(request: Request, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid vendor ID" }, { status: 400 });
    }

    const updates = await request.json();
    // only allow these fields
    const allowed = ["name", "email", "vendorcode", "gstinno", "address"];
    const payload: Record<string, any> = {};
    for (const k of allowed) if (k in updates) payload[k] = updates[k];

    const vendor = await Vendor.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!vendor) return NextResponse.json({ success: false, message: "Vendor not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Vendor updated", data: vendor }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/vendors/:id error:", err);
    if (err.code === 11000) {
      const dup = Object.keys(err.keyValue || {}).join(", ");
      return NextResponse.json({ success: false, message: `Duplicate field(s): ${dup}` }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/vendors/:id
export async function DELETE(_request: Request, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid vendor ID" }, { status: 400 });
    }

    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor) return NextResponse.json({ success: false, message: "Vendor not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Vendor deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/vendors/:id error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
