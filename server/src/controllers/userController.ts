import { Response } from "express";
import User from "../models/User";
import { hashPassword, comparePassword } from "../utils/hash";
import { AuthenticatedRequest } from "../types/express";

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  res.json({ success: true, data: user });
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  const { name } = req.body as { name?: string };
  if (name) user.name = name;
  await user.save();
  res.json({ success: true, data: user });
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
  if (!user.password) return res.status(400).json({ success: false, message: "No local password to change" });
  const ok = await comparePassword(oldPassword, user.password);
  if (!ok) return res.status(401).json({ success: false, message: "Invalid current password" });
  user.password = await hashPassword(newPassword);
  await user.save();
  res.json({ success: true, message: "Password changed" });
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  await User.findByIdAndDelete(user._id);
  res.json({ success: true, message: "Account deleted" });
}
