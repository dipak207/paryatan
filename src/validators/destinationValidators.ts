import { z } from "zod";

export const destinationSearchSchema = z.object({
  q: z.string().min(1),
});
