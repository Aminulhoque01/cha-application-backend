import { Request, Response } from "express";
import mongoose from "mongoose";

import {
  getAllUsers,
  getUserById,
  searchUsers,
  updateUserAvatar,
  updateUserProfile,
} from "./user.service";

import { searchUserSchema, updateProfileSchema } from "./user.validation";
import { uploadToCloudinary } from "../../utils/cloudinary";

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const searchUser = async (req: Request, res: Response) => {
  try {
    const result = searchUserSchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid search query",
        errors: result.error.flatten(),
      });
    }

    const users = await searchUsers(result.data.q as string);

    return res.status(200).json({
      success: true,
      message: "Users searched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Search user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search users",
    });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await getUserById(id as string);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const result = updateProfileSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile data",
        errors: result.error.flatten(),
      });
    }

    const user = await updateUserProfile(
      id as string,
      result.data,
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};


export const updateAvatar = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Avatar image is required",
      });
    }

    // Upload image to Cloudinary
    const uploadedImage =
      await uploadToCloudinary(
        req.file.buffer,
        "chat-app/avatars",
      );

    // Save Cloudinary URL in MongoDB
    const user = await updateUserAvatar(
      id as string,
      uploadedImage.secure_url,
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      data: {
        user,
        avatar: uploadedImage.secure_url,
      },
    });
  } catch (error) {
    console.error(
      "Update avatar error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update avatar",
    });
  }
};