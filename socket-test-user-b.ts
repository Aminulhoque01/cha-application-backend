import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTkxNjhhZTE3YWQ4ODRmMmFmMmExYjgiLCJpYXQiOjE3ODc5ODAyMDcsImV4cCI6MTc4ODU4NTAwN30.2m4CJdE4Yl7w3ZO4sZHPkty3yq3J7OH7UApzihBBcDs";

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

socket.on(
  "message:new",
  (message) => {
    console.log(
      "USER B received:",
      message,
    );
  },
);

socket.on(
  "typing:start",
  (data) => {
    console.log(
      "USER B received TYPING START:",
      data,
    );
  },
);

socket.on(
  "typing:stop",
  (data) => {
    console.log(
      "USER B received TYPING STOP:",
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