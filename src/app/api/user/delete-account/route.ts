import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { getCurrentUser } from "@/lib/auth";
import * as userService from "@/services/userService";

export async function DELETE(request: NextRequest) {
  await connectDB();
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getCurrentUser(auth);
    if (!user) return errorResponse("Unauthorized", 401);
    const result = await userService.deleteAccount(user._id.toString());
    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}
