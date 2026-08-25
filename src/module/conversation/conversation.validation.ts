import { z } from "zod";

export const createDirectConversationSchema =
  z.object({
    participantId: z
      .string()
      .min(1, "Participant ID is required"),
  });