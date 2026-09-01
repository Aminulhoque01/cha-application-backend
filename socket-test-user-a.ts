import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YThiZWFlZjg2N2FlYzY0ZjYwZmQ3YmMiLCJpYXQiOjE3ODgxNDU2NTgsImV4cCI6MTc4ODc1MDQ1OH0.A4gfHEUivY_X463zjtikQ792c333cYU-M8bLER34JeU";


 
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

    // শুধু socket connection test
    console.log(
      "USER A ready for attachment test",
    );
  },
);

socket.on(
  "message:new",
  (message) => {
    console.log(
      "USER A received:",
      JSON.stringify(
        message,
        null,
        2,
      ),
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
  "connect_error",
  (error) => {
    console.error(
      "Connection error:",
      error.message,
    );
  },
);