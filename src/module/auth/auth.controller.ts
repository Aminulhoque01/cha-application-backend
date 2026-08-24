import { Request, Response } from "express";

 

import { loginSchema } from "./auth.validation";
import { getCurrentUser, loginUser } from "./auth.service";
import { AuthRequest } from "../../middleware/auth.middleware";

 

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    const { phone, name } = result.data;

    const resultData = await loginUser({
      phone,
      name,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token: resultData.token,
        user: resultData.user,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const me = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await getCurrentUser(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get current user",
    });
  }
};