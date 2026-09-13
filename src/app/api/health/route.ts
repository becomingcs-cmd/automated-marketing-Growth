import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "growthos",
    safeMode: process.env.SAFE_MODE !== "false",
    timestamp: new Date().toISOString(),
  });
}

