import { Request, Response } from "express";

import { registerPushToken, removePushToken } from "./notification.service";

export const registerPushTokenController = async (
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

    const { token, device } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid push token is required",
      });
    }

    await registerPushToken(currentUserId, token, device);

    return res.status(200).json({
      success: true,
      message: "Push token registered successfully",
    });
  } catch (error) {
    console.error("Register push token error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to register push token";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const removePushTokenController = async (
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

    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid push token is required",
      });
    }

    await removePushToken(currentUserId, token);

    return res.status(200).json({
      success: true,
      message: "Push token removed successfully",
    });
  } catch (error) {
    console.error("Remove push token error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to remove push token";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};
