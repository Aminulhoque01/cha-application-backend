import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTk0NDc5MDFhNDI2Yzc5MDc0YWQ0ODMiLCJpYXQiOjE3ODgxMDI1NDQsImV4cCI6MTc4ODcwNzM0NH0.eQElqEdzinDeWYafVIct9GDUwffVkBBot8wHpkIlj2k";


 

const conversationId =
  "6a94529283f2c840bcda7042";

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

socket.on(
  "message:deleted",
  (data) => {
    console.log(
      "MESSAGE DELETED:",
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

    // Mark as delivered
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

    // Mark as read
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

// ⭐ Receive edited message
socket.on(
  "message:updated",
  (message) => {
    console.log(
      "USER B received MESSAGE UPDATED:",
      message,
    );
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