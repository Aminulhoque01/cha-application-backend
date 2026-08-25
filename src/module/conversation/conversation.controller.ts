import { Request, Response } from "express";
import { addParticipantsSchema, createDirectConversationSchema, createGroupSchema } from "./conversation.validation";
import { addParticipantsToGroup, createDirectConversation, createGroupConversation, getMyConversations, removeParticipantFromGroup } from "./conversation.service";
 



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



export const createGroup = async (
  req: Request,
  res: Response,
) => {
  try {
    // Current logged-in user
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Validate request body
    const result =
      createGroupSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: result.error.flatten(),
      });
    }

    const {
      name,
      participantIds,
    } = result.data;

    // Create group
    const conversation =
      await createGroupConversation(
        currentUserId,
        name,
        participantIds,
      );

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: conversation,
    });
  } catch (error) {
    console.error(
      "Create group error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create group";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};



export const addParticipants = async (
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

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    // Validate body
    const result =
      addParticipantsSchema.safeParse(
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
      await addParticipantsToGroup(
        currentUserId,
        id as string,
        result.data.participantIds,
      );

    return res.status(200).json({
      success: true,
      message:
        "Participants added successfully",
      data: conversation,
    });
  } catch (error) {
    console.error(
      "Add participants error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to add participants";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};


export const removeParticipant = async (
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

    const { id, userId } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const conversation =
      await removeParticipantFromGroup(
        currentUserId,
        id as string,
        userId as string,
      );

    return res.status(200).json({
      success: true,
      message:
        currentUserId === userId
          ? "You left the group successfully"
          : "Participant removed successfully",
      data: conversation,
    });
  } catch (error) {
    console.error(
      "Remove participant error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to remove participant";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};