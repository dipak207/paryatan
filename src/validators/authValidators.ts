import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const googleSchema = z.object({
  idToken: z.string().min(1),
});

export const facebookSchema = z.object({
  accessToken: z.string().min(1),
});
