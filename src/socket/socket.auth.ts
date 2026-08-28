import {
  Socket,
} from "socket.io";

import {
  verifyToken,
} from "../utils/jwt";

export const socketAuth = (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const token =
      socket.handshake.auth?.token;

    if (
      !token ||
      typeof token !== "string"
    ) {
      return next(
        new Error(
          "Authentication required",
        ),
      );
    }

    const decoded =
      verifyToken(token);

    socket.data.userId =
      decoded.userId;

    next();
  } catch (error) {
    console.error(
      "Socket authentication failed:",
      error,
    );

    next(
      new Error(
        "Invalid or expired token",
      ),
    );
  }
};