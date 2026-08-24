import { Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;

  phone: string;

  name: string;

  avatar?: string | undefined;

  bio?: string | undefined;

  isOnline: boolean;

  lastSeen?: Date | null;

  createdAt: Date;

  updatedAt: Date;
}