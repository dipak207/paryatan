import { NextRequest } from "next/server";
import { searchDestination } from "@/services/destinationService";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return errorResponse("Search query is required", 400);
    }

    const results = await searchDestination(query.trim());

    return successResponse(results);
  } catch (error) {
    return handleError(error);
  }
}
