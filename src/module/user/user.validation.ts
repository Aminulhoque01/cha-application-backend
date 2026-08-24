import { z } from "zod";

 


export const searchUserSchema = z.object({
  q: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query is too long"),
});


export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().optional(),
  bio: z.string().max(500).optional(),
});

