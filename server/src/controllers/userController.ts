import { Request, Response } from "express";
import User from "../models/User";
import { hashPassword, comparePassword } from "../utils/hash";

export async function getProfile(req: Request, res: Response) {
  const user = (req as any).user;
  res.json({ success: true, data: user });
}

export async function updateProfile(req: Request, res: Response) {
  const user = (req as any).user;
  const { name } = req.body;
  if (name) user.name = name;
  await user.save();
  res.json({ success: true, data: user });
}

export async function changePassword(req: Request, res: Response) {
  const user = (req as any).user;
  const { oldPassword, newPassword } = req.body;
  if (!user.password) return res.status(400).json({ success: false, message: "No local password to change" });
  const ok = await comparePassword(oldPassword, user.password);
  if (!ok) return res.status(401).json({ success: false, message: "Invalid current password" });
  user.password = await hashPassword(newPassword);
  await user.save();
  res.json({ success: true, message: "Password changed" });
}

export async function deleteAccount(req: Request, res: Response) {
  const user = (req as any).user;
  await User.findByIdAndDelete(user._id);
  res.json({ success: true, message: "Account deleted" });
}
