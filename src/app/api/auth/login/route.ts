import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { loginSchema } from "@/validators/authValidators";
import * as authService from "@/services/authService";

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);
    const result = await authService.login(data);
    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}
