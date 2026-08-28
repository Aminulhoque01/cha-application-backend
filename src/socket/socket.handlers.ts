import {
  Server,
} from "socket.io";

import {
  AuthenticatedSocket,
} from "./socket.types";
import { setUserOffline, setUserOnline } from "../module/user/user.service";

 

export const registerSocketHandlers = (
  io: Server,
  socket: AuthenticatedSocket,
) => {
  const userId = socket.data.userId;

  // User online
  setUserOnline(userId)
    .then(() => {
      console.log(
        `User ${userId} is online`,
      );
    })
    .catch((error) => {
      console.error(
        "Failed to set user online:",
        error,
      );
    });

  // Disconnect
  socket.on(
    "disconnect",
    (reason) => {
      console.log(
        `Socket disconnected: ${socket.id}`,
        `reason: ${reason}`,
      );

      setUserOffline(userId)
        .then(() => {
          console.log(
            `User ${userId} is offline`,
          );
        })
        .catch((error) => {
          console.error(
            "Failed to set user offline:",
            error,
          );
        });
    },
  );
};