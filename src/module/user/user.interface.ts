import { Document, Types } from "mongoose";

 

export interface IUser extends Document {
  _id: Types.ObjectId;

  phone: string;

  name: string;

  avatar?: string | null;

  bio?: string;

  
  isOnline: boolean;

  lastSeen?: Date | null;

  createdAt: Date;

  updatedAt: Date;
}