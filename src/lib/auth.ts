import { verify, sign, type SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export function generateToken(payload: { id: string }) {
  return sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string) {
  try {
    return verify(token, JWT_SECRET) as unknown as { id: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser(token?: string | null) {
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) return null;
  const User = (await import("@/models/User")).default;
  return await User.findById(decoded.id).select("-password");
}
