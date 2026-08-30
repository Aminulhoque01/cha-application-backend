import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";

import {
  getMessages,
  sendMessage,
  updateMessage,
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


messageRouter.patch(
  "/:id",
  authMiddleware,
  updateMessage,
);

export default messageRouter;