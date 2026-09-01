import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTkxNjhhZTE3YWQ4ODRmMmFmMmExYjgiLCJpYXQiOjE3ODgxNTAxODcsImV4cCI6MTc4ODc1NDk4N30.aJR2klQ5kGtBKMWy2HmeYObWaKxTlx4YbCOJv3HFwtg";


 

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
      "\nNEW MESSAGE:",
    );

    console.log(
      JSON.stringify(
        message,
        null,
        2,
      ),
    );

    // Attachment check
    if (
      message.attachments &&
      message.attachments.length > 0
    ) {
      console.log(
        "\n📎 ATTACHMENTS:",
      );

      message.attachments.forEach(
        (attachment: any) => {
          console.log({
            type: attachment.type,
            url: attachment.url,
            fileName:
              attachment.fileName,
            mimeType:
              attachment.mimeType,
            size:
              attachment.size,
          });
        },
      );
    }

    // Delivery
    socket.emit(
      "message:delivered",
      {
        messageId: message._id,
      },
    );
  },
);

socket.on(
  "message:error",
  (error) => {
    console.error(
      "USER B ERROR:",
      error,
    );
  },
);