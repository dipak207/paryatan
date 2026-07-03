import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { getCurrentUser } from "@/lib/auth";
import * as userService from "@/services/userService";
import { updateProfileSchema } from "@/validators/userValidators";

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getCurrentUser(auth);
    if (!user) return errorResponse("Unauthorized", 401);
    const profile = await userService.getProfile(user._id.toString());
    return successResponse(profile);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest) {
  await connectDB();
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getCurrentUser(auth);
    if (!user) return errorResponse("Unauthorized", 401);
    const body = await request.json();
    const data = updateProfileSchema.parse(body);
    const profile = await userService.updateProfile(user._id.toString(), data);
    return successResponse(profile);
  } catch (error) {
    return handleError(error);
  }
}
