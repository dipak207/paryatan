import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { loginSchema, registerSchema } from "@/validators/authValidators";
import * as authService from "@/services/authService";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  if (!action) {
    return errorResponse("Missing auth action", 400);
  }

  await connectDB();

  try {
    const body = await request.json();
    if (action === "login") {
      const data = loginSchema.parse(body);
      const result = await authService.login(data);
      return successResponse(result);
    }

    if (action === "register") {
      const data = registerSchema.parse(body);
      const result = await authService.register(data);
      return successResponse(result, 201);
    }

    return errorResponse("Unknown auth action", 400);
  } catch (error) {
    return handleError(error);
  }
}
