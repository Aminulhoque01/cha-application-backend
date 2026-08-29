import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YThiZWFlZjg2N2FlYzY0ZjYwZmQ3YmMiLCJpYXQiOjE3ODc2NTM1MjAsImV4cCI6MTc4ODI1ODMyMH0.4Fzw3X1mui60Qp6hBfspvEEETc1iYWS_gvIQwulsH1M";

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

    // 1. Start typing
    setTimeout(() => {
      socket.emit(
        "typing:start",
        {
          conversationId,
        },
      );

      console.log(
        "USER A sent TYPING START",
      );
    }, 1000);

    // 2. Stop typing
    setTimeout(() => {
      socket.emit(
        "typing:stop",
        {
          conversationId,
        },
      );

      console.log(
        "USER A sent TYPING STOP",
      );
    }, 3000);
  },
);

socket.on(
  "message:new",
  (message) => {
    console.log(
      "USER A received:",
      message,
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