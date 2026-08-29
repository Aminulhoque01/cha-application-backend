import { io } from "socket.io-client";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTkxNjhhZTE3YWQ4ODRmMmFmMmExYjgiLCJpYXQiOjE3ODgwMDAwMzcsImV4cCI6MTc4ODYwNDgzN30.SzIcLZmZr5qQCORVXqNJ2MysQw7_uqMgvz68zYEoDds";

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
      "USER B connected:",
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
      "USER B joined:",
      data,
    );
  },
);

// ==========================================
// New Message
// ==========================================

socket.on(
  "message:new",
  (message) => {
    console.log(
      "USER B received:",
      message,
    );

    // Mark message as delivered
    socket.emit(
      "message:delivered",
      {
        messageId: message._id,
      },
    );

    console.log(
      "USER B sent MESSAGE DELIVERED:",
      message._id,
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
      "USER B received DELIVERY UPDATE:",
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
      "USER B received TYPING START:",
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
      "USER B received TYPING STOP:",
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
      "USER B message error:",
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
      "USER B conversation error:",
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
      "USER B connection error:",
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
      "USER B disconnected:",
      reason,
    );
  },
);