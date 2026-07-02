import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import User from "../models/User";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const token = auth.split(" ")[1];
  const decoded: any = verifyToken(token);
  if (!decoded || !decoded.id) return res.status(401).json({ success: false, message: "Invalid token" });
  const user = await User.findById(decoded.id).select("-password");
  if (!user) return res.status(401).json({ success: false, message: "User not found" });
  // attach user to request
  (req as any).user = user;
  next();
}
