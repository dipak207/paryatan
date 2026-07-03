import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: false, message: "OAuth redirect not supported" }, { status: 400 });
}
