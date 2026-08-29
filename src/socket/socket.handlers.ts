import { Server } from "socket.io";

import { AuthenticatedSocket } from "./socket.types";
import { setUserOffline, setUserOnline } from "../module/user/user.service";
import { createMessage } from "../module/message/message.service";

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
    async (payload: { conversationId: string; text: string }) => {
      try {
        const { conversationId, text } = payload;

        // Basic validation
        if (!conversationId) {
          socket.emit("message:error", {
            message: "Conversation ID is required",
          });

          return;
        }

        if (!text || !text.trim()) {
          socket.emit("message:error", {
            message: "Message text is required",
          });

          return;
        }

        // Create message
        // This already verifies:
        // 1. Valid user
        // 2. Valid conversation
        // 3. User is a participant
        const message = await createMessage(userId, conversationId, text);

        // Broadcast ONLY to this conversation room
        io.to(conversationId).emit("message:new", message);

        console.log(`Message ${message._id} sent to room ${conversationId}`);
      } catch (error) {
        console.error("Socket message:send error:", error);

        socket.emit("message:error", {
          message:
            error instanceof Error ? error.message : "Failed to send message",
        });
      }
    },
  );

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
