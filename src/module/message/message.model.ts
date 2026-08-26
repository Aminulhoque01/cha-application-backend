import { Schema, model } from "mongoose";

import { IMessage } from "./message.interface";

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

messageSchema.index({
  conversationId: 1,
  createdAt: 1,
});

export const MessageModel =
  model<IMessage>(
    "Message",
    messageSchema,
  );