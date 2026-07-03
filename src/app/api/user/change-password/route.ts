import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { getCurrentUser } from "@/lib/auth";
import { changePasswordSchema } from "@/validators/userValidators";
import * as userService from "@/services/userService";

export async function PUT(request: NextRequest) {
  await connectDB();
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getCurrentUser(auth);
    if (!user) return errorResponse("Unauthorized", 401);
    const body = await request.json();
    const data = changePasswordSchema.parse(body);
    const result = await userService.changePassword(user._id.toString(), data.oldPassword, data.newPassword);
    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}
