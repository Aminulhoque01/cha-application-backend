import { io } from "socket.io-client";

const token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YThiZWFlZjg2N2FlYzY0ZjYwZmQ3YmMiLCJpYXQiOjE3ODc2MzEyNDUsImV4cCI6MTc4ODIzNjA0NX0.czm6HmwHF1u-mlPT_iWzPgqKTE8tUVrl2SneqhwB-a8";

const socket = io(
  "http://localhost:5000",
  {
    auth: {
      token,
    },
  },
);

socket.on(
  "connect",
  () => {
    console.log(
      "Socket connected:",
      socket.id,
    );
  },
);

socket.on(
  "connect_error",
  (error) => {
    console.error(
      "Socket connection error:",
      error.message,
    );
  },
);

socket.on(
  "disconnect",
  (reason) => {
    console.log(
      "Socket disconnected:",
      reason,
    );
  },
);