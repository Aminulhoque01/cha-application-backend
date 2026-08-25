import { Router } from "express";

import {
  addParticipants,
  createConversation,
  createGroup,
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


conversationRouter.post(
  "/group",
  authMiddleware,
  createGroup,
);

conversationRouter.post(
  "/:id/participants",
  authMiddleware,
  addParticipants,
);

export default conversationRouter;