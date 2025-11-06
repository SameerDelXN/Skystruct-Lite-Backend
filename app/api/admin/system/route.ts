import mongoose from "mongoose";
import os from "os";
import process from "process";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/utils/permissions";

export async function GET() {
  await dbConnect();
  const session = await getSession(arguments[0] as any);
  if (!session || !isAdmin(session.role))
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

  const dbStats = await mongoose.connection.db.stats();

  const data = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpuLoad: os.loadavg(),
    dbName: mongoose.connection.db.databaseName,
    collections: dbStats.collections,
    storageSize: dbStats.storageSize,
    dataSize: dbStats.dataSize,
    indexes: dbStats.indexes,
  };

  return NextResponse.json({ success: true, data });
}
