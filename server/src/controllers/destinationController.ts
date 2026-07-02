import { Request, Response } from "express";
import * as destinationService from "../services/destinationService";

export async function search(req: Request, res: Response) {
  const q = (req.query.q as string) || "";
  if (!q) return res.status(400).json({ success: false, message: "q query required" });
  const results = await destinationService.searchDestination(q);
  res.json({ success: true, data: results });
}

export async function details(req: Request, res: Response) {
  const xid = req.params.xid;
  if (!xid) return res.status(400).json({ success: false, message: "xid required" });
  const data = await destinationService.getDestinationDetails(xid);
  res.json({ success: true, data });
}
