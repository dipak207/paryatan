import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { getCurrentUser } from "@/lib/auth";
import * as visitedService from "@/services/visitedService";
import { visitedSchema } from "@/validators/visitedValidators";

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getCurrentUser(auth);
    if (!user) return errorResponse("Unauthorized", 401);
    const visited = await visitedService.getVisited(user._id.toString());
    return successResponse(visited);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getCurrentUser(auth);
    if (!user) return errorResponse("Unauthorized", 401);
    const body = await request.json();
    const data = visitedSchema.parse(body);
    const visited = await visitedService.addVisited(user._id.toString(), data);
    return successResponse(visited, 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest) {
  await connectDB();
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getCurrentUser(auth);
    if (!user) return errorResponse("Unauthorized", 401);
    const url = new URL(request.url);
    const xid = url.searchParams.get("xid");
    if (!xid) return errorResponse("xid required", 400);
    const visited = await visitedService.removeVisited(user._id.toString(), xid);
    return successResponse(visited);
  } catch (error) {
    return handleError(error);
  }
}
