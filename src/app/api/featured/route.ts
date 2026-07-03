import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { getFeaturedDestinations } from "@/services/featuredService";

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const featured = await getFeaturedDestinations();
    return successResponse(featured);
  } catch (error) {
    return handleError(error);
  }
}
