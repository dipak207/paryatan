import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";
import { getCurrentUser } from "@/lib/auth";
import * as favoritesService from "@/services/favoritesService";
import { favoriteSchema } from "@/validators/favoritesValidators";

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getCurrentUser(auth);
    if (!user) return errorResponse("Unauthorized", 401);
    const favorites = await favoritesService.getFavorites(user._id.toString());
    return successResponse(favorites);
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
    const data = favoriteSchema.parse(body);
    const favorites = await favoritesService.addFavorite(user._id.toString(), data);
    return successResponse(favorites, 201);
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
    const favorites = await favoritesService.removeFavorite(user._id.toString(), xid);
    return successResponse(favorites);
  } catch (error) {
    return handleError(error);
  }
}
