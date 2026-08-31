import { Request, Response } from "express";

import { addReaction, createMessage, deleteMessage, editMessage, getConversationMessages } from "./message.service";

import { editMessageSchema, getMessagesSchema, sendMessageSchema } from "./message.validation";

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


export const updateMessage = async (
  req: Request,
  res: Response,
) => {
  try {
    const currentUserId =
      req.user?.userId;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result =
      editMessageSchema.safeParse({
        params: req.params,
        body: req.body,
      });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid message data",
        errors: result.error.flatten(),
      });
    }

    const {
      id: messageId,
    } = result.data.params;

    const {
      text,
    } = result.data.body;

    const message =
      await editMessage(
        currentUserId,
        messageId,
        text,
      );

    return res.status(200).json({
      success: true,
      message:
        "Message updated successfully",
      data: message,
    });
  } catch (error) {
    console.error(
      "Update message error:",
      error,
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update message",
    });
  }
};

export const deleteMessageController = async (
  req: Request,
  res: Response,
) => {
  try {
    const currentUserId =
      req.user?.userId;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id: messageId } =
      req.params;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: "Message ID is required",
      });
    }

    const data =
      await deleteMessage(
        currentUserId,
        messageId as string,
      );

    return res.status(200).json({
      success: true,
      message:
        "Message deleted successfully",
      data,
    });
  } catch (error) {
    console.error(
      "Delete message error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete message";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const addReactionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const userId = req.user?.userId;

    const result = await addReaction(
      userId as string,
      messageId as string,
      emoji,
    );

    return res.status(200).json({
      success: true,
      message:
        result.action === "added"
          ? "Reaction added successfully"
          : "Reaction removed successfully",
      data: result.message,
    });
  } catch (error) {
    console.error("Add reaction error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to add reaction",
    });
  }
};


 