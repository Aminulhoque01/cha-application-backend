import { Request, Response } from "express";

import { createMessage, getConversationMessages } from "./message.service";

import { getMessagesSchema, sendMessageSchema } from "./message.validation";

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



export const getMessages = async (
  req: Request,
  res: Response,
) => {
  try {
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Validate params + query
    const result =
      getMessagesSchema.safeParse({
        params: req.params,
        query: req.query,
      });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: result.error.flatten(),
      });
    }

    const {
      id: conversationId,
    } = result.data.params;

    const {
      page,
      limit,
    } = result.data.query;

    const data =
      await getConversationMessages(
        currentUserId,
        conversationId,
        page,
        limit,
      );

    return res.status(200).json({
      success: true,
      message:
        "Messages fetched successfully",
      data,
    });
  } catch (error) {
    console.error(
      "Get messages error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch messages";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};