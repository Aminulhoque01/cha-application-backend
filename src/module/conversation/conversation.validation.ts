import { z } from "zod";

export const createDirectConversationSchema =
  z.object({
    participantId: z
      .string()
      .min(1, "Participant ID is required"),
  });


 export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Group name is required")
    .max(
      100,
      "Group name cannot exceed 100 characters",
    ),

  participantIds: z
    .array(
      z
        .string()
        .min(1, "Participant ID is required"),
    )
    .min(
      2,
      "A group must have at least 3 members including you",
    )
    .refine(
      (ids) => new Set(ids).size === ids.length,
      {
        message:
          "Duplicate participant IDs are not allowed",
      },
    ),
});

export const addParticipantsSchema = z.object({
  participantIds: z
    .array(
      z
        .string()
        .min(1, "Participant ID is required"),
    )
    .min(
      1,
      "At least one participant is required",
    )
    .refine(
      (ids) => new Set(ids).size === ids.length,
      {
        message:
          "Duplicate participant IDs are not allowed",
      },
    ),
});