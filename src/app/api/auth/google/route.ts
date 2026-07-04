import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { OAuth2Client } from "google-auth-library";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { handleError } from "@/utils/errorHandler";

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return errorResponse("Google login is not configured", 500);
    }

    const body = await request.json();
    const idToken = body.idToken || body.credential;

    if (!idToken) {
      return errorResponse("Google ID token is required", 400);
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return errorResponse("Google account email not found", 400);
    }

    if (!payload.email_verified) {
      return errorResponse("Google email is not verified", 400);
    }

    await connectDB();

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        provider: "google",
        googleId: payload.sub,
        favorites: [],
        visited: [],
      });
    } else {
      user.name = user.name || payload.name || payload.email.split("@")[0];
      user.googleId = user.googleId || payload.sub;

      if (!user.provider || user.provider === "local") {
        user.provider = user.googleId ? user.provider : "google";
      }

      await user.save();
    }

    const token = generateToken({ id: user._id.toString() });

    return successResponse({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        provider: user.provider,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
