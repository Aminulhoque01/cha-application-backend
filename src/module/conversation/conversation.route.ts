import { Router } from "express";

import {
  addParticipants,
  createConversation,
  createGroup,
  getConversations,
  promoteAdmin,
  removeParticipant,
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

conversationRouter.delete(
  "/:id/participants/:userId",
  authMiddleware,
  removeParticipant,
);

conversationRouter.post(
  "/:id/admins",
  authMiddleware,
  promoteAdmin,
);

export default conversationRouter;