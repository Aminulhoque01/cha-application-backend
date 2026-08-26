import { Request, Response } from "express";

import { createMessage } from "./message.service";

import { sendMessageSchema } from "./message.validation";

export const sendMessage = async (
  req: Request,
  res: Response,
) => {
  try {
    // Current logged-in user
    const currentUserId =
      req.user?.userId;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Validate request body
    const result =
      sendMessageSchema.safeParse(
        req.body,
      );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid message data",
        errors: result.error.flatten(),
      });
    }

    const {
      conversationId,
      text,
    } = result.data;

    // Create message
    const message =
      await createMessage(
        currentUserId,
        conversationId,
        text,
      );

    return res.status(201).json({
      success: true,
      message:
        "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error(
      "Send message error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to send message";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};