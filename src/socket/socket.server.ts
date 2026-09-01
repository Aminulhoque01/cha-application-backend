import { Server } from "socket.io";
import { Server as HttpServer } from "http";

import { env } from "../config/env";

import { socketAuth } from "./socket.auth";
import { registerSocketHandlers } from "./socket.handlers";

import {
  isConversationMember,
} from "../module/conversation/conversation.service";

import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "./socket.types";

import {
  setSocketIO,
} from "./socket.instance";

export const createSocketServer = (
  httpServer: HttpServer,
) => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Store Socket.IO instance
  setSocketIO(io);

  console.log(
    "Socket.IO initialized successfully",
  );

  // JWT authentication
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(
      `Socket connected: ${socket.id}`,
      `userId: ${socket.data.userId}`,
    );

    registerSocketHandlers(io, socket);

    socket.on(
      "conversation:join",
      async ({ conversationId }) => {
        try {
          if (!conversationId) {
            socket.emit(
              "conversation:error",
              {
                message:
                  "Conversation ID is required",
              },
            );

            return;
          }

          const userId =
            socket.data.userId;

          const isMember =
            await isConversationMember(
              conversationId,
              userId,
            );

          if (!isMember) {
            socket.emit(
              "conversation:error",
              {
                message:
                  "You are not a member of this conversation",
                conversationId,
              },
            );

            return;
          }

          await socket.join(
            conversationId,
          );

          socket.emit(
            "conversation:joined",
            {
              conversationId,
            },
          );

          console.log(
            `User ${userId} joined conversation ${conversationId}`,
          );
        } catch (error) {
          console.error(
            "conversation:join error:",
            error,
          );

          socket.emit(
            "conversation:error",
            {
              message:
                "Failed to join conversation",
            },
          );
        }
      },
    );

    socket.on(
      "conversation:leave",
      async ({ conversationId }) => {
        try {
          if (!conversationId) {
            socket.emit(
              "conversation:error",
              {
                message:
                  "Conversation ID is required",
              },
            );

            return;
          }

          await socket.leave(
            conversationId,
          );

          socket.emit(
            "conversation:left",
            {
              conversationId,
            },
          );

          console.log(
            `User ${socket.data.userId} left conversation ${conversationId}`,
          );
        } catch (error) {
          console.error(
            "conversation:leave error:",
            error,
          );

          socket.emit(
            "conversation:error",
            {
              message:
                "Failed to leave conversation",
            },
          );
        }
      },
    );
  });

  return io;
};