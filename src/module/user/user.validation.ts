import { z } from "zod";

export const updateProfileSchema =
  z.object({
    body: z.object({
      name: z
        .string()
        .min(1)
        .max(100)
        .optional(),

      avatar: z
        .url()
        .nullable()
        .optional(),

      bio: z
        .string()
        .max(500)
        .optional(),
    }),
  });

export const searchUserSchema =
  z.object({
    query: z.object({
      q: z
        .string()
        .min(1)
        .max(100),
    }),
  });