import User from "../models/User";
import { IFavorite } from "../models/User";

interface FavoriteDTO {
  xid: string;
  destinationName: string;
  image?: string;
  country?: string;
}

export async function getFavorites(userId: string) {
  const user = await User.findById(userId).select("favorites");
  return user?.favorites || [];
}

export async function addFavorite(userId: string, dto: FavoriteDTO) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  const exists = user.favorites.find((f) => f.xid === dto.xid);
  if (exists) throw { status: 409, message: "Already in favorites" };
  user.favorites.push(dto as IFavorite);
  await user.save();
  return user.favorites;
}

export async function removeFavorite(userId: string, xid: string) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  user.favorites = user.favorites.filter((f) => f.xid !== xid);
  await user.save();
  return user.favorites;
}
