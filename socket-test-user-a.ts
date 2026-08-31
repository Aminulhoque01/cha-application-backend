import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTk0NTI2MzgzZjJjODQwYmNkYTcwM2MiLCJpYXQiOjE3ODgxMDUzMTUsImV4cCI6MTc4ODcxMDExNX0.d3DcKq5S9ASX2HAtCrnynD2R69ncZrKs2uQ_FPGy6Bs";

const conversationId =
  "6a94529283f2c840bcda7042";

let messageId: string | null = null;

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
    "USER A connected:",
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
      "USER A joined:",
      data,
    );

    // Send message
    setTimeout(() => {
      socket.emit(
        "message:send",
        {
          conversationId,
          text: "Hello edit test",
        },
      );

      console.log(
        "USER A sent MESSAGE",
      );
    }, 2000);
  },
);

// Receive new message
socket.on(
  "message:new",
  (message) => {
    console.log(
      "USER A received MESSAGE:",
      message,
    );

    // Only save User A's own message ID
    if (
      message.senderId?._id ===
      "6a94526383f2c840bcda703c"
    ) {
      messageId = message._id;

      console.log(
        "USER A saved MESSAGE ID:",
        messageId,
      );

      // Edit after 2 seconds
      setTimeout(() => {
        if (!messageId) {
          return;
        }

        socket.emit(
          "message:edit",
          {
            messageId,
            text: "Hello, this message was edited!",
          },
        );

        console.log(
          "USER A sent MESSAGE EDIT:",
          messageId,
        );
      }, 2000);
    }
  },
);

socket.on(
  "message:new",
  (message) => {
    console.log(
      "USER A received MESSAGE:",
      message,
    );

    if (
      message.senderId?._id ===
      "6a94526383f2c840bcda703c"
    ) {
      messageId = message._id;

      setTimeout(() => {
        if (!messageId) {
          return;
        }

        socket.emit(
          "message:delete",
          {
            messageId,
          },
        );

        console.log(
          "USER A sent DELETE:",
          messageId,
        );
      }, 4000);
    }
  },
);

// Updated message
socket.on(
  "message:updated",
  (message) => {
    console.log(
      "USER A received MESSAGE UPDATED:",
      message,
    );
  },
);

// Delivery update
socket.on(
  "message:delivery:update",
  (data) => {
    console.log(
      "USER A received DELIVERY UPDATE:",
      data,
    );
  },
);

// Read update
socket.on(
  "message:read:update",
  (data) => {
    console.log(
      "USER A received READ UPDATE:",
      data,
    );
  },
);

socket.on(
  "message:error",
  (error) => {
    console.error(
      "USER A message error:",
      error,
    );
  },
);

socket.on(
  "conversation:error",
  (error) => {
    console.error(
      "USER A conversation error:",
      error,
    );
  },
);

socket.on(
  "connect_error",
  (error) => {
    console.error(
      "USER A connection error:",
      error.message,
    );
  },
);