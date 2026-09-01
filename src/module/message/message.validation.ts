import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  text: z.string().optional().default(""),
  replyTo: z.string().optional(),
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

export const editMessageSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),

  body: z.object({
    text: z
      .string()
      .trim()
      .min(1)
      .max(5000),
  }),
});