import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";

import {
  addReactionController,
  deleteMessageController,
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


messageRouter.delete(
  "/:id",
  authMiddleware,
  deleteMessageController,
);

messageRouter.post(
  "/:messageId/reactions",
  authMiddleware,
  addReactionController,
);

 

export default messageRouter;