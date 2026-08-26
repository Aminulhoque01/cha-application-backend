import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";

import {
  getMessages,
  sendMessage,
} from "./message.controller";

const messageRouter = Router();

messageRouter.post(
  "/",
  authMiddleware,
  sendMessage,
);

messageRouter.get(
  "/:id/messages",
  authMiddleware,
  getMessages,
);

export default messageRouter;