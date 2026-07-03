import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import * as authService from "@/services/authService";

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    const { idToken } = body as { idToken?: string };
    if (!idToken) return errorResponse("idToken required", 400);
    const result = await authService.googleLogin(idToken);
    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    if (!code) return errorResponse("code required", 400);
    const result = await authService.googleCallback(code);
    const frontend = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${frontend}/auth/success?token=${encodeURIComponent(result.token)}`);
  } catch (error) {
    return handleError(error);
  }
}
