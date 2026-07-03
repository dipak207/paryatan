import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import * as destinationService from "@/services/destinationService";

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const url = new URL(request.url);
    const xid = url.searchParams.get("xid");
    if (!xid) return errorResponse("xid required", 400);
    const details = await destinationService.getDestinationDetails(xid);
    return successResponse(details);
  } catch (error) {
    return handleError(error);
  }
}
