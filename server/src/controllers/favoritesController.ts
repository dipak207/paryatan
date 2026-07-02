import { Response } from "express";
import * as favoritesService from "../services/favoritesService";
import { AuthenticatedRequest } from "../types/express";

export async function getFavorites(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  const favs = await favoritesService.getFavorites(user._id.toString());
  res.json({ success: true, data: favs });
}

export async function addFavorite(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  const { xid, destinationName, image, country } = req.body as {
    xid: string;
    destinationName: string;
    image?: string;
    country?: string;
  };
  const fav = await favoritesService.addFavorite(user._id.toString(), { xid, destinationName, image, country });
  res.status(201).json({ success: true, data: fav });
}

export async function removeFavorite(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  const xid = req.params.xid;
  await favoritesService.removeFavorite(user._id.toString(), xid);
  res.json({ success: true, message: "Favorite removed" });
}
