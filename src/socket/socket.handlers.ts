import { Server } from "socket.io";

import { AuthenticatedSocket } from "./socket.types";
import { setUserOffline, setUserOnline } from "../module/user/user.service";
import {
  addReaction,
  createMessage,
  deleteMessage,
  editMessage,
  markMessageAsDelivered,
  markMessageAsRead,
} from "../module/message/message.service";
import { isConversationMember } from "../module/conversation/conversation.service";

export const registerSocketHandlers = (
  io: Server,
  socket: AuthenticatedSocket,
) => {
  const userId = socket.data.userId;

  // User online
  setUserOnline(userId)
    .then(() => {
      console.log(`User ${userId} is online`);
    })
    .catch((error) => {
      console.error("Failed to set user online:", error);
    });

  socket.on(
    "message:send",
    async (payload: {
      conversationId: string;
      text: string;
      replyTo?: string;
    }) => {
      try {
        const { conversationId, text, replyTo } = payload;

        const message = await createMessage(
          socket.data.userId,
          conversationId,
          text,
          replyTo,
        );

        io.to(conversationId).emit("message:new", message);

        console.log(`Message ${message._id} sent to room ${conversationId}`);
      } catch (error) {
        console.error("message:send error:", error);

        socket.emit("message:error", {
          message:
            error instanceof Error ? error.message : "Failed to send message",
        });
      }
    },
  );

  socket.on("message:reaction", async (payload) => {
    try {
      const { messageId, emoji } = payload;

      const result = await addReaction(userId, messageId, emoji);

      const conversationId = result.message.conversationId.toString();

      io.to(conversationId).emit("message:reaction:update", {
        messageId: result.message._id.toString(),

        conversationId,

        action: result.action,

        reactionSummary: result.reactionSummary,
      });

      console.log(
        `Reaction ${result.action}:`,
        emoji,
        `on message ${messageId}`,
      );
    } catch (error) {
      console.error("message:reaction error:", error);

      socket.emit("message:error", {
        message:
          error instanceof Error ? error.message : "Failed to update reaction",
      });
    }
  });

  socket.on("message:delete", async (payload) => {
    try {
      const { messageId } = payload;

      if (!messageId) {
        socket.emit("message:error", {
          message: "Message ID is required",
        });

        return;
      }

      const deletedMessage = await deleteMessage(userId, messageId);

      io.to(deletedMessage.conversationId).emit(
        "message:deleted",
        deletedMessage,
      );

      console.log(`Message ${messageId} deleted`);
    } catch (error) {
      console.error("message:delete error:", error);

      socket.emit("message:error", {
        message:
          error instanceof Error ? error.message : "Failed to delete message",
      });
    }
  });

  socket.on("message:edit", async (payload) => {
    try {
      const { messageId, text } = payload;

      if (!messageId) {
        socket.emit("message:error", {
          message: "Message ID is required",
        });

        return;
      }

      if (!text || !text.trim()) {
        socket.emit("message:error", {
          message: "Message text is required",
        });

        return;
      }

      const message = await editMessage(userId, messageId, text);

      // Notify everyone in the conversation
      io.to(message.conversationId.toString()).emit("message:updated", message);

      console.log(`Message ${message._id} edited`);
    } catch (error) {
      console.error("message:edit error:", error);

      socket.emit("message:error", {
        message:
          error instanceof Error ? error.message : "Failed to edit message",
      });
    }
  });

  socket.on("message:delivered", async ({ messageId }) => {
    try {
      const result = await markMessageAsDelivered(userId, messageId);

      // Notify only the conversation room
      io.to(result.conversationId).emit("message:delivery:update", {
        messageId: result.messageId,
        userId: result.userId,
      });

      console.log(
        `Message ${result.messageId} delivered to user ${result.userId}`,
      );
    } catch (error) {
      console.error("message:delivered error:", error);

      socket.emit("message:error", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to mark message as delivered",
      });
    }
  });

  // ==========================================
  // Message Read
  // ==========================================

  socket.on("message:read", async (payload: { messageId: string }) => {
    try {
      const { messageId } = payload;

      // Basic validation
      if (!messageId) {
        socket.emit("message:error", {
          message: "Message ID is required",
        });

        return;
      }

      // Mark message as read
      const message = await markMessageAsRead(userId, messageId);

      // Broadcast read update
      io.to(message.conversationId.toString()).emit("message:read:update", {
        messageId: message._id.toString(),

        conversationId: message.conversationId.toString(),

        userId,
      });

      console.log(`User ${userId} read message ${messageId}`);
    } catch (error) {
      console.error("message:read error:", error);

      socket.emit("message:error", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to mark message as read",
      });
    }
  });

  socket.on("typing:start", async ({ conversationId }) => {
    try {
      if (!conversationId) {
        socket.emit("message:error", {
          message: "Conversation ID is required",
        });

        return;
      }

      const isMember = await isConversationMember(conversationId, userId);

      if (!isMember) {
        socket.emit("message:error", {
          message: "You are not a member of this conversation",
        });

        return;
      }

      // Send to everyone in the room EXCEPT sender
      socket.to(conversationId).emit("typing:start", {
        conversationId,
        userId,
      });

      console.log(`User ${userId} started typing in ${conversationId}`);
    } catch (error) {
      console.error("typing:start error:", error);
    }
  });

  // ==========================================
  // Typing Stop
  // ==========================================

  socket.on("typing:stop", async ({ conversationId }) => {
    try {
      if (!conversationId) {
        socket.emit("message:error", {
          message: "Conversation ID is required",
        });

        return;
      }

      const isMember = await isConversationMember(conversationId, userId);

      if (!isMember) {
        socket.emit("message:error", {
          message: "You are not a member of this conversation",
        });

        return;
      }

      socket.to(conversationId).emit("typing:stop", {
        conversationId,
        userId,
      });

      console.log(`User ${userId} stopped typing in ${conversationId}`);
    } catch (error) {
      console.error("typing:stop error:", error);
    }
  });

  // Disconnect
  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id}`, `reason: ${reason}`);

    setUserOffline(userId)
      .then(() => {
        console.log(`User ${userId} is offline`);
      })
      .catch((error) => {
        console.error("Failed to set user offline:", error);
      });
  });
};
