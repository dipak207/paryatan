import { Request, Response } from "express";
import * as favoritesService from "../services/favoritesService";

export async function getFavorites(req: Request, res: Response) {
  const user = (req as any).user;
  const favs = await favoritesService.getFavorites(user._id);
  res.json({ success: true, data: favs });
}

export async function addFavorite(req: Request, res: Response) {
  const user = (req as any).user;
  const { xid, destinationName, image, country } = req.body;
  const fav = await favoritesService.addFavorite(user._id, { xid, destinationName, image, country });
  res.status(201).json({ success: true, data: fav });
}

export async function removeFavorite(req: Request, res: Response) {
  const user = (req as any).user;
  const xid = req.params.xid;
  await favoritesService.removeFavorite(user._id, xid);
  res.json({ success: true, message: "Favorite removed" });
}
