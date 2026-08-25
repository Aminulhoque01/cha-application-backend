import mongoose from "mongoose";

import { ConversationModel } from "./conversation.model";
import { UserModel } from "../user/user.model";



export const createDirectConversation = async (
  currentUserId: string,
  participantId: string,
) => {
  if (
    !mongoose.Types.ObjectId.isValid(currentUserId)
  ) {
    throw new Error("Invalid current user ID");
  }

  if (
    !mongoose.Types.ObjectId.isValid(participantId)
  ) {
    throw new Error("Invalid participant ID");
  }

  if (currentUserId === participantId) {
    throw new Error(
      "You cannot create a conversation with yourself",
    );
  }

  const participant = await UserModel.findById(
    participantId,
  );

  if (!participant) {
    throw new Error("Participant user not found");
  }

  const currentUserObjectId =
    new mongoose.Types.ObjectId(currentUserId);

  const participantObjectId =
    new mongoose.Types.ObjectId(participantId);

  const existingConversation =
    await ConversationModel.findOne({
      type: "direct",

      participants: {
        $all: [
          currentUserObjectId,
          participantObjectId,
        ],

        $size: 2,
      },
    })
      .populate(
        "participants",
        "phone name avatar bio isOnline lastSeen",
      )
      .populate("lastMessage");

  if (existingConversation) {
    return existingConversation;
  }

  const conversation =
    await ConversationModel.create({
      type: "direct",

      participants: [
        currentUserObjectId,
        participantObjectId,
      ],

      admins: [],

      createdBy: currentUserObjectId,

      lastMessage: null,
    });

  await conversation.populate(
    "participants",
    "phone name avatar bio isOnline lastSeen",
  );

  return conversation;
};

export const getMyConversations = async (
  currentUserId: string,
) => {
  if (
    !mongoose.Types.ObjectId.isValid(currentUserId)
  ) {
    throw new Error("Invalid user ID");
  }

  const conversations =
    await ConversationModel.find({
      participants: new mongoose.Types.ObjectId(
        currentUserId,
      ),
    })
      .populate(
        "participants",
        "phone name avatar bio isOnline lastSeen",
      )
      .populate(
        "lastMessage",
      )
      .populate(
        "createdBy",
        "phone name avatar",
      )
      .sort({
        updatedAt: -1,
      });

  return conversations;
};