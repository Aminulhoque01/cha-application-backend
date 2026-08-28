import {
  Server,
} from "socket.io";

import {
  Server as HttpServer,
} from "http";

import { env } from "../config/env";

import {
  socketAuth,
} from "./socket.auth";
import { registerSocketHandlers } from "./socket.handlers";

 

export const createSocketServer = (
  httpServer: HttpServer,
) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,

      credentials: true,
    },
  });

  // JWT authentication
  io.use(socketAuth);

  io.on(
    "connection",
    (socket) => {
      console.log(
        `Socket connected: ${socket.id}`,
        `userId: ${socket.data.userId}`,
      );

      registerSocketHandlers(
        io,
        socket,
      );
    },
  );

  return io;
};