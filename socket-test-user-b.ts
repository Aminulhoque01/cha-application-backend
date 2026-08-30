import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTkxNjhhZTE3YWQ4ODRmMmFmMmExYjgiLCJpYXQiOjE3ODgwODY4MDUsImV4cCI6MTc4ODY5MTYwNX0.xYMrOy113sYfn8Dqd7m8IX3p1QV_Q69KGq45NDLQEh0";

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

socket.on("connect", () => {
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
});

socket.on(
  "conversation:joined",
  (data) => {
    console.log(
      "USER B joined:",
      data,
    );
  },
);

// Receive new message
socket.on(
  "message:new",
  (message) => {
    console.log(
      "USER B received MESSAGE:",
      message,
    );

    // First mark as delivered
    socket.emit(
      "message:delivered",
      {
        messageId: message._id,
      },
    );

    console.log(
      "USER B sent DELIVERED:",
      message._id,
    );

    // Then mark as read
    setTimeout(() => {
      socket.emit(
        "message:read",
        {
          messageId: message._id,
        },
      );

      console.log(
        "USER B sent READ:",
        message._id,
      );
    }, 1000);
  },
);

// Delivery update
socket.on(
  "message:delivery:update",
  (data) => {
    console.log(
      "USER B received DELIVERY UPDATE:",
      data,
    );
  },
);

// Read update
socket.on(
  "message:read:update",
  (data) => {
    console.log(
      "USER B received READ UPDATE:",
      data,
    );
  },
);

socket.on(
  "message:error",
  (error) => {
    console.error(
      "USER B message error:",
      error,
    );
  },
);

socket.on(
  "conversation:error",
  (error) => {
    console.error(
      "USER B conversation error:",
      error,
    );
  },
);

socket.on(
  "connect_error",
  (error) => {
    console.error(
      "USER B connection error:",
      error.message,
    );
  },
);