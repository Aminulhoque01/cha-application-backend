import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";

import {
  addReactionController,
  deleteMessageController,
  getMessages,
   
  markMessageAsReadController,
   
  sendMessage,
  updateMessage,
} from "./message.controller";
import { uploadMessageFiles } from "../../middleware/messageUpload.middleware";
 

const messageRouter = Router();

messageRouter.post(
  "/",
  authMiddleware,
  uploadMessageFiles.array(
    "attachments",
    10,
  ),
  sendMessage,
);


messageRouter.get(
  "/:id/messages",
  authMiddleware,
  getMessages,
);


messageRouter.patch(
  "/:id/read",
  authMiddleware,
  markMessageAsReadController,
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