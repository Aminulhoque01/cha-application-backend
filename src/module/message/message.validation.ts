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


export const getMessagesSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, "Conversation ID is required"),
  }),

  query: z.object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(30),
  }),
});