import { Request, Response } from "express";
import * as visitedService from "../services/visitedService";

export async function getVisited(req: Request, res: Response) {
  const user = (req as any).user;
  const list = await visitedService.getVisited(user._id);
  res.json({ success: true, data: list });
}

export async function addVisited(req: Request, res: Response) {
  const user = (req as any).user;
  const { xid, destinationName, image, country, visitedDate } = req.body;
  const v = await visitedService.addVisited(user._id, { xid, destinationName, image, country, visitedDate });
  res.status(201).json({ success: true, data: v });
}

export async function removeVisited(req: Request, res: Response) {
  const user = (req as any).user;
  const xid = req.params.xid;
  await visitedService.removeVisited(user._id, xid);
  res.json({ success: true, message: "Visited removed" });
}
