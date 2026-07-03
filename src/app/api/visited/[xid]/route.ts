import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { getCurrentUser } from "@/lib/auth";
import * as visitedService from "@/services/visitedService";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ xid: string }> }) {
  await connectDB();
  try {
    const { xid } = await params;
    const auth = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getCurrentUser(auth);
    if (!user) return errorResponse("Unauthorized", 401);
    const visited = await visitedService.removeVisited(user._id.toString(), xid);
    return successResponse(visited);
  } catch (error) {
    return handleError(error);
  }
}
