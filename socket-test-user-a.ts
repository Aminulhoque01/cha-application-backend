import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YThiZWFlZjg2N2FlYzY0ZjYwZmQ3YmMiLCJpYXQiOjE3ODgxNDU2NTgsImV4cCI6MTc4ODc1MDQ1OH0.A4gfHEUivY_X463zjtikQ792c333cYU-M8bLER34JeU";

const conversationId =
  "6a9168c317ad884f2af2a1bc";

  
 

const currentUserId =
"6a8beaef867aec64f60fd7bc";

let originalMessageId:
| string
| null = null;

let replySent = false;

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

socket.on(
"conversation:joined",
(data) => {
console.log(
"USER A joined:",
data,
);

 
// Send original message
setTimeout(() => {
  socket.emit(
    "message:send",
    {
      conversationId,
      text: "Hello, this is the original message",
    },
  );

  console.log(
    "USER A sent ORIGINAL MESSAGE",
  );
}, 1000);
 

},
);

socket.on(
"message:new",
(message) => {
console.log(
"USER A received MESSAGE:",
JSON.stringify(
message,
null,
2,
),
);

 
// Find the original message sent by User A
if (
  message.senderId?._id ===
    currentUserId &&
  message.text ===
    "Hello, this is the original message" &&
  !originalMessageId
) {
  originalMessageId =
    message._id;

  console.log(
    "USER A saved ORIGINAL MESSAGE ID:",
    originalMessageId,
  );

  // Send reply after 2 seconds
  setTimeout(() => {
    if (
      !originalMessageId ||
      replySent
    ) {
      return;
    }

    socket.emit(
      "message:send",
      {
        conversationId,
        text: "This is a reply to the previous message",
        replyTo: originalMessageId,
      },
    );

    replySent = true;

    console.log(
      "USER A sent REPLY MESSAGE:",
      originalMessageId,
    );
  }, 2000);
}

// Detect reply message
if (message.replyTo) {
  console.log(
    "⭐ USER A received a REPLY MESSAGE",
  );

  console.log(
    "REPLY DATA:",
    JSON.stringify(
      message.replyTo,
      null,
      2,
    ),
  );
}
 

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
