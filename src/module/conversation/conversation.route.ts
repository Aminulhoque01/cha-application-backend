import { Router } from "express";

import {
  createConversation,
  getConversations,
} from "./conversation.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

 

const conversationRouter = Router();

/**
 * Create / get existing direct conversation
 */
conversationRouter.post(
  "/",
  authMiddleware,
  createConversation,
);

/**
 * Get current user's conversations
 */
conversationRouter.get(
  "/",
  authMiddleware,
  getConversations,
);

export default conversationRouter;