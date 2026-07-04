import { errorResponse, successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import * as destinationService from "@/services/destinationService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ xid: string }> }
) {
  try {
    const { xid } = await params;

    if (!xid) {
      return errorResponse("Destination xid is required", 400);
    }

    const details = await destinationService.getDestinationDetails(xid);

    return successResponse(details);
  } catch (error) {
    return handleError(error);
  }
}
