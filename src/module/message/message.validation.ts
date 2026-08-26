import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z
    .string()
    .min(1, "Conversation ID is required"),

  text: z
    .string()
    .trim()
    .min(1, "Message text is required")
    .max(
      5000,
      "Message cannot exceed 5000 characters",
    ),
});