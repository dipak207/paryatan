import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import User from "../models/User";
import { AuthenticatedRequest } from "../types/express";

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  const user = await User.findById((decoded as { id: string }).id).select("-password");
  if (!user) return res.status(401).json({ success: false, message: "User not found" });
  req.user = user;
  next();
}
