import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";

import {
  sendMessage,
} from "./message.controller";

const messageRouter = Router();

messageRouter.post(
  "/",
  authMiddleware,
  sendMessage,
);

export default messageRouter;