import { Server } from "socket.io";

import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "./socket.types";

type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let socketIO: SocketServer | null =
  null;

export const setSocketIO = (
  io: SocketServer,
) => {
  socketIO = io;

  console.log(
    "Socket.IO instance stored",
  );
};

export const getSocketIO = (): SocketServer => {
  if (!socketIO) {
    throw new Error(
      "Socket.IO is not initialized",
    );
  }

  return socketIO;
};