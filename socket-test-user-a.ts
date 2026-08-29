import { io } from "socket.io-client";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YThiZWFlZjg2N2FlYzY0ZjYwZmQ3YmMiLCJpYXQiOjE3ODc2NTM1MjAsImV4cCI6MTc4ODI1ODMyMH0.4Fzw3X1mui60Qp6hBfspvEEETc1iYWS_gvIQwulsH1M";

const conversationId =
  "6a9168c317ad884f2af2a1bc";

const socket = io(
  "http://localhost:5000",
  {
    auth: {
      token,
    },
  },
);

// ==========================================
// Connected
// ==========================================

socket.on(
  "connect",
  () => {
    console.log(
      "USER A connected:",
      socket.id,
    );

    socket.emit(
      "conversation:join",
      {
        conversationId,
      },
    );
  },
);

// ==========================================
// Conversation Joined
// ==========================================

socket.on(
  "conversation:joined",
  (data) => {
    console.log(
      "USER A joined:",
      data,
    );

    // Send message after joining
    setTimeout(() => {
      socket.emit(
        "message:send",
        {
          conversationId,
          text: "Hello delivery test",
        },
      );

      console.log(
        "USER A sent MESSAGE",
      );
    }, 2000);
  },
);

// ==========================================
// New Message
// ==========================================

socket.on(
  "message:new",
  (message) => {
    console.log(
      "USER A received:",
      message,
    );
  },
);

// ==========================================
// Delivery Update
// ==========================================

socket.on(
  "message:delivery:update",
  (data) => {
    console.log(
      "USER A received DELIVERY UPDATE:",
      data,
    );
  },
);

// ==========================================
// Typing Start
// ==========================================

socket.on(
  "typing:start",
  (data) => {
    console.log(
      "USER A received TYPING START:",
      data,
    );
  },
);

// ==========================================
// Typing Stop
// ==========================================

socket.on(
  "typing:stop",
  (data) => {
    console.log(
      "USER A received TYPING STOP:",
      data,
    );
  },
);

// ==========================================
// Message Error
// ==========================================

socket.on(
  "message:error",
  (error) => {
    console.error(
      "USER A message error:",
      error,
    );
  },
);

// ==========================================
// Conversation Error
// ==========================================

socket.on(
  "conversation:error",
  (error) => {
    console.error(
      "USER A conversation error:",
      error,
    );
  },
);

// ==========================================
// Connection Error
// ==========================================

socket.on(
  "connect_error",
  (error) => {
    console.error(
      "USER A connection error:",
      error.message,
    );
  },
);

// ==========================================
// Disconnect
// ==========================================

socket.on(
  "disconnect",
  (reason) => {
    console.log(
      "USER A disconnected:",
      reason,
    );
  },
);