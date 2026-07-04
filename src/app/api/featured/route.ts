import { getFeaturedDestinations } from "@/services/featuredService";
import { successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

export async function GET() {
  try {
    const featured = await getFeaturedDestinations();
    return successResponse(featured);
  } catch (error) {
    return handleError(error);
  }
}