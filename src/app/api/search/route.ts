import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { destinationSearchSchema } from "@/validators/destinationValidators";
import * as destinationService from "@/services/destinationService";

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const url = new URL(request.url);
    const query = { q: url.searchParams.get("q") || "" };
    const data = destinationSearchSchema.parse(query);
    const results = await destinationService.searchDestination(data.q);
    return successResponse(results);
  } catch (error) {
    return handleError(error);
  }
}
