// import { io } from "socket.io-client";

// const token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YThiZWFlZjg2N2FlYzY0ZjYwZmQ3YmMiLCJpYXQiOjE3ODc2MzEyNDUsImV4cCI6MTc4ODIzNjA0NX0.czm6HmwHF1u-mlPT_iWzPgqKTE8tUVrl2SneqhwB-a8";

// const socket = io(
//   "http://localhost:5000",
//   {
//     auth: {
//       token,
//     },
//   },
// );

// socket.on(
//   "connect",
//   () => {
//     console.log(
//       "Socket connected:",
//       socket.id,
//     );
//   },
// );

// socket.on(
//   "connect_error",
//   (error) => {
//     console.error(
//       "Socket connection error:",
//       error.message,
//     );
//   },
// );

// socket.on(
//   "disconnect",
//   (reason) => {
//     console.log(
//       "Socket disconnected:",
//       reason,
//     );
//   },
// );


import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YThiZWFlZjg2N2FlYzY0ZjYwZmQ3YmMiLCJpYXQiOjE3ODc2NTM1MjAsImV4cCI6MTc4ODI1ODMyMH0.4Fzw3X1mui60Qp6hBfspvEEETc1iYWS_gvIQwulsH1M";

const socket = io("http://localhost:5000", {
  auth: {
    token,
  },
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);

  // Join conversation
  socket.emit("conversation:join", {
    conversationId: "6a9168c317ad884f2af2a1bc",
  });
});

 
 

socket.on("conversation:joined", (data) => {
  console.log("Conversation joined:", data);

  // Leave after successfully joining
  socket.emit("conversation:leave", {
    conversationId: "6a9168c317ad884f2af2a1bc",
  });
});

socket.on("conversation:left", (data) => {
  console.log("Conversation left:", data);
});

socket.on("conversation:error", (data) => {
  console.error("Conversation error:", data);
});