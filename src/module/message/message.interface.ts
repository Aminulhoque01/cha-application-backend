import { Types } from "mongoose";

export interface IMessageReaction {
  userId: Types.ObjectId;
  emoji: string;
  createdAt: Date;
}

export interface IMessage {
  _id: Types.ObjectId;

  conversationId: Types.ObjectId;

  senderId: Types.ObjectId;

  text: string;

  isEdited: boolean;

  isDeleted: boolean;

  deletedAt: Date | null;

  reactions: IMessageReaction[];

  deliveredTo: Types.ObjectId[];

  readBy: Types.ObjectId[];

  createdAt: Date;

  updatedAt: Date;
}