import { Types } from "mongoose";

export interface IMessage {
  _id: Types.ObjectId;

  conversationId: Types.ObjectId;

  senderId: Types.ObjectId;

  text: string;

  deliveredTo: Types.ObjectId[];

  readBy: Types.ObjectId[];

  createdAt: Date;

  updatedAt: Date;
}