import { Router } from "express";

import {
  getAllUser,
  getUserProfile,
  searchUser,
  updateAvatar,
  updateProfile,
} from "./user.controller";
import { uploadAvatar } from "../../middleware/upload.middleware";

 

const router = Router();

// Get all users
userRouter.get("/", getAllUser);

// Search users
userRouter.get("/search", searchUser);

// Get single user
userRouter.get("/:id", getUserProfile);

// Update profile
userRouter.patch("/:id/profile", updateProfile);

// Update avatar
userRouter.patch(
  "/:id/avatar",
  uploadAvatar.single("avatar"),
  updateAvatar,
);

export default userRouter;