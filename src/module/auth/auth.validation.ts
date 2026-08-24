import { z } from "zod";

export const loginSchema = z.object({
  phone: z
    .string()
    .min(5, "Phone number is required")
    .max(20, "Invalid phone number"),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
});
