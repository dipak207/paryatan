import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/utils/errorHandler";
import * as authService from "@/services/authService";

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    const { accessToken } = body as { accessToken?: string };
    if (!accessToken) return NextResponse.json({ success: false, message: "accessToken required" }, { status: 400 });
    const result = await authService.facebookLogin(accessToken);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    if (!code) return NextResponse.json({ success: false, message: "code required" }, { status: 400 });
    const result = await authService.facebookCallback(code);
    const frontend = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${frontend}/auth/success?token=${encodeURIComponent(result.token)}`);
  } catch (error) {
    return handleError(error);
  }
}
