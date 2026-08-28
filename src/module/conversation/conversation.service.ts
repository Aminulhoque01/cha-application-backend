import mongoose from "mongoose";

import { ConversationModel } from "./conversation.model";
import { UserModel } from "../user/user.model";
import { getCache, invalidateUserConversationsCache, setCache } from "../../cache/cache.service";
import { cacheKeys } from "../../cache/cache.keys";



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
    !mongoose.Types.ObjectId.isValid(
      currentUserId,
    )
  ) {
    throw new Error("Invalid user ID");
  }

  const cacheKey =
    cacheKeys.userConversations(
      currentUserId,
    );

  // Redis HIT
  const cachedConversations =
    await getCache(cacheKey);

  if (cachedConversations) {
    console.log(
      "Conversations: Redis HIT",
    );

    return cachedConversations;
  }

  console.log(
    "Conversations: Redis MISS",
  );

  // Redis MISS → MongoDB
  const conversations =
    await ConversationModel.find({
      participants:
        new mongoose.Types.ObjectId(
          currentUserId,
        ),
    })
      .populate(
        "participants",
        "phone name avatar bio isOnline lastSeen",
      )
      .populate(
        "createdBy",
        "phone name avatar",
      )
      .populate(
        "lastMessage",
      )
      .sort({
        updatedAt: -1,
      });

  // Save to Redis
  await setCache(
    cacheKey,
    conversations,
    300,
  );

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



export const addParticipantsToGroup = async (
  currentUserId: string,
  conversationId: string,
  participantIds: string[],
) => {
  // 1. Validate conversation ID
  if (
    !mongoose.Types.ObjectId.isValid(
      conversationId,
    )
  ) {
    throw new Error(
      "Invalid conversation ID",
    );
  }

  // 2. Validate current user ID
  if (
    !mongoose.Types.ObjectId.isValid(
      currentUserId,
    )
  ) {
    throw new Error(
      "Invalid current user ID",
    );
  }

  // 3. Validate participant IDs
  const invalidParticipantId =
    participantIds.find(
      (id) =>
        !mongoose.Types.ObjectId.isValid(id),
    );

  if (invalidParticipantId) {
    throw new Error(
      `Invalid participant ID: ${invalidParticipantId}`,
    );
  }

  // 4. Remove duplicate IDs
  const uniqueParticipantIds = [
    ...new Set(participantIds),
  ];

  // 5. Find conversation
  const conversation =
    await ConversationModel.findById(
      conversationId,
    );

  if (!conversation) {
    throw new Error(
      "Conversation not found",
    );
  }

  // 6. Must be a group
  if (conversation.type !== "group") {
    throw new Error(
      "Participants can only be added to groups",
    );
  }

  // 7. Check current user is admin
  const isAdmin =
    conversation.admins.some(
      (adminId) =>
        adminId.toString() ===
        currentUserId,
    );

  if (!isAdmin) {
    throw new Error(
      "Only group admins can add participants",
    );
  }

  // 8. Convert IDs to ObjectIds
  const newParticipantObjectIds =
    uniqueParticipantIds.map(
      (id) =>
        new mongoose.Types.ObjectId(id),
    );

  // 9. Check whether users exist
  const users = await UserModel.find({
    _id: {
      $in: newParticipantObjectIds,
    },
  }).select("_id");

  if (
    users.length !==
    newParticipantObjectIds.length
  ) {
    throw new Error(
      "One or more users do not exist",
    );
  }

  // 10. Prevent adding existing members
  const existingParticipantIds =
    new Set(
      conversation.participants.map(
        (id) => id.toString(),
      ),
    );

  const alreadyMembers =
    uniqueParticipantIds.filter((id) =>
      existingParticipantIds.has(id),
    );

  if (alreadyMembers.length > 0) {
    throw new Error(
      "One or more users are already group members",
    );
  }

  // 11. Add new participants
  conversation.participants.push(
    ...newParticipantObjectIds,
  );

  await conversation.save();

  await invalidateUserConversationsCache([
    currentUserId,
    ...uniqueParticipantIds,
  ]);

  // 12. Populate response
  await conversation.populate(
    "participants",
    "phone name avatar bio isOnline lastSeen",
  );

  await conversation.populate(
    "createdBy",
    "phone name avatar",
  );

  return conversation;
};


export const removeParticipantFromGroup = async (
  currentUserId: string,
  conversationId: string,
  targetUserId: string,
) => {
  // Validate IDs
  if (
    !mongoose.Types.ObjectId.isValid(
      conversationId,
    )
  ) {
    throw new Error("Invalid conversation ID");
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      currentUserId,
    )
  ) {
    throw new Error("Invalid current user ID");
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      targetUserId,
    )
  ) {
    throw new Error("Invalid target user ID");
  }

  // Find conversation
  const conversation =
    await ConversationModel.findById(
      conversationId,
    );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Must be group
  if (conversation.type !== "group") {
    throw new Error(
      "Participants can only be removed from groups",
    );
  }

  // Check current user is a member
  const isMember =
    conversation.participants.some(
      (participantId) =>
        participantId.toString() ===
        currentUserId,
    );

  if (!isMember) {
    throw new Error(
      "You are not a member of this group",
    );
  }

  // Check target user is a member
  const isTargetMember =
    conversation.participants.some(
      (participantId) =>
        participantId.toString() ===
        targetUserId,
    );

  if (!isTargetMember) {
    throw new Error(
      "Target user is not a member of this group",
    );
  }

  // Is current user admin?
  const isAdmin =
    conversation.admins.some(
      (adminId) =>
        adminId.toString() ===
        currentUserId,
    );

  // ------------------------------------------------
  // CASE 1: User wants to leave the group
  // ------------------------------------------------

  const isLeaving =
    currentUserId === targetUserId;

  if (!isLeaving && !isAdmin) {
    throw new Error(
      "Only group admins can remove other members",
    );
  }

  // ------------------------------------------------
  // Prevent removing last member
  // ------------------------------------------------

  if (conversation.participants.length <= 1) {
    throw new Error(
      "Group must have at least one member",
    );
  }

  // ------------------------------------------------
  // Remove participant
  // ------------------------------------------------

  conversation.participants =
    conversation.participants.filter(
      (participantId) =>
        participantId.toString() !==
        targetUserId,
    );

  // ------------------------------------------------
  // Remove from admins as well
  // ------------------------------------------------

  conversation.admins =
    conversation.admins.filter(
      (adminId) =>
        adminId.toString() !==
        targetUserId,
    );

  await conversation.save();

  await invalidateUserConversationsCache([
    currentUserId,
    targetUserId,
  ]);

  // Populate response
  await conversation.populate(
    "participants",
    "phone name avatar bio isOnline lastSeen",
  );

  await conversation.populate(
    "createdBy",
    "phone name avatar",
  );

  return conversation;
};


export const promoteMemberToAdmin = async (
  currentUserId: string,
  conversationId: string,
  targetUserId: string,
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      conversationId,
    )
  ) {
    throw new Error("Invalid conversation ID");
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      currentUserId,
    )
  ) {
    throw new Error("Invalid current user ID");
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      targetUserId,
    )
  ) {
    throw new Error("Invalid target user ID");
  }

  const conversation =
    await ConversationModel.findById(
      conversationId,
    );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.type !== "group") {
    throw new Error(
      "Only groups can have admins",
    );
  }

  // Current user must be member
  const isCurrentUserMember =
    conversation.participants.some(
      (participantId) =>
        participantId.toString() ===
        currentUserId,
    );

  if (!isCurrentUserMember) {
    throw new Error(
      "You are not a member of this group",
    );
  }

  // Current user must be admin
  const isCurrentUserAdmin =
    conversation.admins.some(
      (adminId) =>
        adminId.toString() ===
        currentUserId,
    );

  if (!isCurrentUserAdmin) {
    throw new Error(
      "Only group admins can promote members",
    );
  }

  // Target must be member
  const isTargetMember =
    conversation.participants.some(
      (participantId) =>
        participantId.toString() ===
        targetUserId,
    );

  if (!isTargetMember) {
    throw new Error(
      "Target user is not a group member",
    );
  }

  // Already admin?
  const isAlreadyAdmin =
    conversation.admins.some(
      (adminId) =>
        adminId.toString() ===
        targetUserId,
    );

  if (isAlreadyAdmin) {
    throw new Error(
      "User is already an admin",
    );
  }

  // Promote
  conversation.admins.push(
    new mongoose.Types.ObjectId(
      targetUserId,
    ),
  );

  await conversation.save();
  await invalidateUserConversationsCache([
    currentUserId,
    targetUserId,
  ]);

  await conversation.populate(
    "participants",
    "phone name avatar bio isOnline lastSeen",
  );

  await conversation.populate(
    "createdBy",
    "phone name avatar",
  );

  return conversation;
};


export const renameGroupConversation = async (
  currentUserId: string,
  conversationId: string,
  name: string,
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      conversationId,
    )
  ) {
    throw new Error("Invalid conversation ID");
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      currentUserId,
    )
  ) {
    throw new Error("Invalid current user ID");
  }

  const conversation =
    await ConversationModel.findById(
      conversationId,
    );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.type !== "group") {
    throw new Error(
      "Only groups can be renamed",
    );
  }

  const isMember =
    conversation.participants.some(
      (participantId) =>
        participantId.toString() ===
        currentUserId,
    );

  if (!isMember) {
    throw new Error(
      "You are not a member of this group",
    );
  }

  const isAdmin =
    conversation.admins.some(
      (adminId) =>
        adminId.toString() ===
        currentUserId,
    );

  if (!isAdmin) {
    throw new Error(
      "Only group admins can rename the group",
    );
  }

  conversation.name = name.trim();

  await conversation.save();

  const memberIds =
  conversation.participants.map(
    (participantId) =>
      participantId.toString(),
  );

  await invalidateUserConversationsCache(
    memberIds,
  );

  await conversation.populate(
    "participants",
    "phone name avatar bio isOnline lastSeen",
  );

  await conversation.populate(
    "createdBy",
    "phone name avatar",
  );

  return conversation;
};


export const isConversationMember = async (
  conversationId: string,
  userId: string,
): Promise<boolean> => {
  if (
    !mongoose.Types.ObjectId.isValid(conversationId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return false;
  }

  const conversation =
    await ConversationModel.findOne({
      _id: conversationId,
      participants: userId,
    }).select("_id");

  return !!conversation;
};