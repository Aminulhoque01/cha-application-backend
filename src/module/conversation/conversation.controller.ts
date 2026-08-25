import { Request, Response } from "express";
import { createDirectConversationSchema } from "./conversation.validation";
import { createDirectConversation, getMyConversations } from "./conversation.service";
 



export const createConversation = async (
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

    const result =
      createDirectConversationSchema.safeParse(
        req.body,
      );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: result.error.flatten(),
      });
    }

    const conversation =
      await createDirectConversation(
        currentUserId,
        result.data.participantId,
      );

    return res.status(200).json({
      success: true,
      message:
        "Direct conversation created successfully",
      data: conversation,
    });
  } catch (error) {
    console.error(
      "Create conversation error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create conversation";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const getConversations = async (
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

    const conversations =
      await getMyConversations(
        currentUserId,
      );

    return res.status(200).json({
      success: true,
      message:
        "Conversations fetched successfully",
      data: conversations,
    });
  } catch (error) {
    console.error(
      "Get conversations error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};