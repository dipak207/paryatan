import User from "@/models/User";
import { IFavorite } from "@/models/User";

export async function getFavorites(userId: string) {
  const user = await User.findById(userId).select("favorites");
  return user?.favorites || [];
}

export async function addFavorite(userId: string, dto: IFavorite) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  if (user.favorites.some((favorite) => favorite.xid === dto.xid)) {
    throw { status: 409, message: "Already in favorites" };
  }
  user.favorites.push(dto);
  await user.save();
  return user.favorites;
}

export async function removeFavorite(userId: string, xid: string) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  user.favorites = user.favorites.filter((favorite) => favorite.xid !== xid);
  await user.save();
  return user.favorites;
}
