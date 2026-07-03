import { z } from "zod";

export const visitedSchema = z.object({
  xid: z.string().min(1),
  destinationName: z.string().min(1),
  image: z.string().url().optional(),
  country: z.string().optional(),
  visitedDate: z.string().optional(),
});
