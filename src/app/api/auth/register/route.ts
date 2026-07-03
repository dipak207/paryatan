import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { registerSchema } from "@/validators/authValidators";
import * as authService from "@/services/authService";

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    const result = await authService.register(data);
    return successResponse(result, 201);
  } catch (error) {
    return handleError(error);
  }
}
