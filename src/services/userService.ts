import User from "@/models/User";
import { hashPassword, comparePassword } from "@/utils/hash";

export async function getProfile(userId: string) {
  const user = await User.findById(userId).select("-password");
  if (!user) throw { status: 404, message: "User not found" };
  return user;
}

export async function updateProfile(userId: string, data: { name?: string }) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  if (data.name) user.name = data.name;
  await user.save();
  return user;
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  const user = await User.findById(userId);
  if (!user || !user.password) throw { status: 400, message: "No local password to change" };
  const ok = await comparePassword(oldPassword, user.password);
  if (!ok) throw { status: 401, message: "Invalid current password" };
  user.password = await hashPassword(newPassword);
  await user.save();
  return { message: "Password changed" };
}

export async function deleteAccount(userId: string) {
  await User.findByIdAndDelete(userId);
  return { message: "Account deleted" };
}
