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




export const createGroupConversation = async (
  currentUserId: string,
  name: string,
  participantIds: string[],
) => {
  // 1. Validate current user ID
  if (
    !mongoose.Types.ObjectId.isValid(currentUserId)
  ) {
    throw new Error("Invalid current user ID");
  }

  // 2. Minimum 2 other participants
  if (participantIds.length < 2) {
    throw new Error(
      "A group must have at least 3 members",
    );
  }

  // 3. Remove duplicate IDs
  const uniqueParticipantIds = [
    ...new Set(participantIds),
  ];

  if (
    uniqueParticipantIds.length !==
    participantIds.length
  ) {
    throw new Error(
      "Duplicate participants are not allowed",
    );
  }

  // 4. Validate every participant ID
  const invalidParticipantId =
    uniqueParticipantIds.find(
      (id) =>
        !mongoose.Types.ObjectId.isValid(id),
    );

  if (invalidParticipantId) {
    throw new Error(
      `Invalid participant ID: ${invalidParticipantId}`,
    );
  }

  // 5. Current user cannot be passed as another participant
  if (
    uniqueParticipantIds.includes(
      currentUserId,
    )
  ) {
    throw new Error(
      "You are already included automatically",
    );
  }

  // 6. Check all users exist
  const users = await UserModel.find({
    _id: {
      $in: uniqueParticipantIds,
    },
  }).select("_id");

  if (
    users.length !==
    uniqueParticipantIds.length
  ) {
    throw new Error(
      "One or more participants do not exist",
    );
  }

  // 7. Prepare ObjectIds
  const currentUserObjectId =
    new mongoose.Types.ObjectId(
      currentUserId,
    );

  const participantObjectIds =
    uniqueParticipantIds.map(
      (id) =>
        new mongoose.Types.ObjectId(id),
    );

  // 8. Create group
  const conversation =
    await ConversationModel.create({
      type: "group",

      name: name.trim(),

      participants: [
        currentUserObjectId,
        ...participantObjectIds,
      ],

      admins: [
        currentUserObjectId,
      ],

      createdBy: currentUserObjectId,

      lastMessage: null,
    });

  // 9. Populate participants
  await conversation.populate(
    "participants",
    "phone name avatar bio isOnline lastSeen",
  );

  // 10. Populate creator
  await conversation.populate(
    "createdBy",
    "phone name avatar",
  );

  // 11. Return conversation
  return conversation;
};