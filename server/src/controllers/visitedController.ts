import { Response } from "express";
import * as visitedService from "../services/visitedService";
import { AuthenticatedRequest } from "../types/express";

export async function getVisited(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  const list = await visitedService.getVisited(user._id.toString());
  res.json({ success: true, data: list });
}

export async function addVisited(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  const { xid, destinationName, image, country, visitedDate } = req.body as {
    xid: string;
    destinationName: string;
    image?: string;
    country?: string;
    visitedDate?: string;
  };
  const v = await visitedService.addVisited(user._id.toString(), { xid, destinationName, image, country, visitedDate });
  res.status(201).json({ success: true, data: v });
}

export async function removeVisited(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  const xid = req.params.xid;
  await visitedService.removeVisited(user._id.toString(), xid);
  res.json({ success: true, message: "Visited removed" });
}
