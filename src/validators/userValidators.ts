import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});
