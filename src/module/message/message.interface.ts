import { Types } from "mongoose";

export interface IMessage {
  _id: Types.ObjectId;

  conversationId: Types.ObjectId;

  senderId: Types.ObjectId;

  text: string;

  createdAt: Date;

  updatedAt: Date;
}