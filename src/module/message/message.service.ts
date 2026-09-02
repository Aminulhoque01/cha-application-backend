import mongoose, { Types } from "mongoose";

import { MessageModel } from "./message.model";
import { ConversationModel } from "../conversation/conversation.model";
import { isConversationMember } from "../conversation/conversation.service";
import { IAttachment, IMessageReaction } from "./message.interface";
import { deleteMultipleMessageAttachments } from "./messageUpload.service";

export const createMessage = async (
  currentUserId: string,
  conversationId: string,
  text = "",
  replyTo?: string,
  attachments: IAttachment[] = []
) => {
  // 1. Validate current user ID
  if (
    !mongoose.Types.ObjectId.isValid(
      currentUserId,
    )
  ) {
    throw new Error(
      "Invalid current user ID",
    );
  }

  // 2. Validate conversation ID
  if (
    !mongoose.Types.ObjectId.isValid(
      conversationId,
    )
  ) {
    throw new Error(
      "Invalid conversation ID",
    );
  }

  // 3. Validate message content
  const trimmedText = text.trim();

  if (
    !trimmedText &&
    attachments.length === 0
  ) {
    throw new Error(
      "Message must contain text or attachment",
    );
  }

  // 4. Find conversation and make sure
  // current user is a participant
  const conversation =
    await ConversationModel.findOne({
      _id:
        new mongoose.Types.ObjectId(
          conversationId,
        ),

      participants:
        new mongoose.Types.ObjectId(
          currentUserId,
        ),
    });

  if (!conversation) {
    throw new Error(
      "Conversation not found or you are not a member",
    );
  }

  // 5. Validate reply message
  if (replyTo) {
    if (
      !mongoose.Types.ObjectId.isValid(
        replyTo,
      )
    ) {
      throw new Error(
        "Invalid reply message ID",
      );
    }

    const replyMessage =
      await MessageModel.findById(
        replyTo,
      );

    if (!replyMessage) {
      throw new Error(
        "Reply message not found",
      );
    }

    if (
      replyMessage.conversationId.toString() !==
      conversationId
    ) {
      throw new Error(
        "Reply message belongs to another conversation",
      );
    }
  }

  // 6. Create message
  const message =
    await MessageModel.create({
      conversationId:
        new mongoose.Types.ObjectId(
          conversationId,
        ),

      senderId:
        new mongoose.Types.ObjectId(
          currentUserId,
        ),

      // Can be empty for file/media-only messages
      text: trimmedText,

      // New attachment support
      attachments,

      // Existing reply support
      replyTo: replyTo
        ? new mongoose.Types.ObjectId(
            replyTo,
          )
        : null,
    });

  // 7. Update conversation lastMessage
  conversation.lastMessage =
    message._id;

  await conversation.save();

  // 8. Populate sender
  await message.populate(
    "senderId",
    "phone name avatar bio isOnline lastSeen",
  );

  // 9. Populate reply message
  await message.populate({
    path: "replyTo",

    select:
      "text senderId isDeleted createdAt attachments",

    populate: {
      path: "senderId",

      select: "name avatar",
    },
  });

  return message;
};

export const getConversationMessages = async (
  currentUserId: string,
  conversationId: string,
  page = 1,
  limit = 30,
) => {
  // 1. Validate current user ID
  if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
    throw new Error("Invalid current user ID");
  }

  // 2. Validate conversation ID
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new Error("Invalid conversation ID");
  }

  // 3. Find conversation and verify membership
  const conversation = await ConversationModel.findOne({
    _id: new mongoose.Types.ObjectId(conversationId),

    participants: new mongoose.Types.ObjectId(currentUserId),
  });

  if (!conversation) {
    throw new Error("Conversation not found or you are not a member");
  }

  // 4. Calculate pagination
  const skip = (page - 1) * limit;

  // 5. Fetch messages + total count together
  const [messages, total] = await Promise.all([
    MessageModel.find({
      conversationId: new mongoose.Types.ObjectId(conversationId),
    })
      .populate("senderId", "phone name avatar bio isOnline lastSeen")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    MessageModel.countDocuments({
      conversationId: new mongoose.Types.ObjectId(conversationId),
    }),
  ]);

  // 6. Reverse for chat UI
  // DB gives newest → oldest
  // Response gives oldest → newest
  messages.reverse();

  // 7. Pagination information
  const totalPages = Math.ceil(total / limit);

  return {
    messages,

    pagination: {
      page,
      limit,
      total,
      totalPages,

      hasNextPage: page < totalPages,

      hasPreviousPage: page > 1,
    },
  };
};

export const markMessageAsDelivered = async (
  currentUserId: string,
  messageId: string,
) => {
  // 1. Validate IDs
  if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
    throw new Error("Invalid current user ID");
  }

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new Error("Invalid message ID");
  }

  // 2. Find message
  const message = await MessageModel.findById(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  // 3. Sender cannot mark own message as delivered
  if (message.senderId.toString() === currentUserId) {
    throw new Error("You cannot mark your own message as delivered");
  }

  // 4. Verify user is a conversation member
  const conversation = await ConversationModel.findOne({
    _id: message.conversationId,

    participants: new mongoose.Types.ObjectId(currentUserId),
  }).select("_id");

  if (!conversation) {
    throw new Error("You are not a member of this conversation");
  }

  // 5. Add user only once
  await MessageModel.findByIdAndUpdate(
    messageId,
    {
      $addToSet: {
        deliveredTo: new mongoose.Types.ObjectId(currentUserId),
      },
    },
    {
      new: true,
    },
  );

  return {
    messageId,
    conversationId: message.conversationId.toString(),
    userId: currentUserId,
  };
};

export const markMessageAsRead = async (
  currentUserId: string,
  messageId: string,
) => {
  // 1. Validate user ID
  if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
    throw new Error("Invalid current user ID");
  }

  // 2. Validate message ID
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new Error("Invalid message ID");
  }

  const userObjectId = new mongoose.Types.ObjectId(currentUserId);

  // 3. Find message
  const message = await MessageModel.findById(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  // 4. Check conversation membership
  const conversation = await ConversationModel.findOne({
    _id: message.conversationId,

    participants: userObjectId,
  }).select("_id");

  if (!conversation) {
    throw new Error("You are not a member of this conversation");
  }

  // 5. Sender cannot mark own message as read
  if (message.senderId.toString() === currentUserId) {
    throw new Error("You cannot mark your own message as read");
  }

  // 6. Prevent duplicate read
  const alreadyRead = message.readBy.some(
    (userId) => userId.toString() === currentUserId,
  );

  if (alreadyRead) {
    return message;
  }

  // 7. Add user to readBy
  message.readBy.push(userObjectId);

  await message.save();

  // 8. Populate readBy users
  await message.populate("readBy", "phone name avatar");

  return message;
};

export const editMessage = async (
  currentUserId: string,
  messageId: string,
  text: string,
) => {
  // 1. Validate IDs
  if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
    throw new Error("Invalid current user ID");
  }

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new Error("Invalid message ID");
  }

  // 2. Find message
  const message = await MessageModel.findById(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  // 3. Only sender can edit
  if (message.senderId.toString() !== currentUserId) {
    throw new Error("You can only edit your own message");
  }

  // 4. Validate text
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error("Message text cannot be empty");
  }

  // 5. Edit
  message.text = trimmedText;

  message.isEdited = true;

  await message.save();

  // 6. Populate sender
  await message.populate("senderId", "phone name avatar bio isOnline lastSeen");

  return message;
};

 

export const deleteMessage = async (
  currentUserId: string,
  messageId: string,
) => {
  // Validate current user ID
  if (
    !mongoose.Types.ObjectId.isValid(
      currentUserId,
    )
  ) {
    throw new Error(
      "Invalid current user ID",
    );
  }

  // Validate message ID
  if (
    !mongoose.Types.ObjectId.isValid(
      messageId,
    )
  ) {
    throw new Error(
      "Invalid message ID",
    );
  }

  // Find message
  const message =
    await MessageModel.findById(
      messageId,
    );

  if (!message) {
    throw new Error(
      "Message not found",
    );
  }

  // Check ownership
  if (
    message.senderId.toString() !==
    currentUserId
  ) {
    throw new Error(
      "You can only delete your own messages",
    );
  }

  // Prevent duplicate deletion
  if (message.isDeleted) {
    throw new Error(
      "Message is already deleted",
    );
  }

  // =====================================
  // Delete attachments from Cloudinary
  // =====================================
  if (
    message.attachments &&
    message.attachments.length > 0
  ) {
    await deleteMultipleMessageAttachments(
      message.attachments,
    );
  }

  // =====================================
  // Soft delete message
  // =====================================
  message.isDeleted = true;

  message.deletedAt =
    new Date();

  // Hide original text
  message.text = "";

  // Remove attachments from MongoDB
  message.attachments = [];

  await message.save();

  return {
    messageId:
      message._id.toString(),

    conversationId:
      message.conversationId.toString(),

    isDeleted: true,

    deletedAt:
      message.deletedAt,
  };
};

const getReactionSummary = (reactions: IMessageReaction[]) => {
  const reactionMap = new Map<
    string,
    {
      emoji: string;
      count: number;
      userIds: string[];
    }
  >();

  for (const reaction of reactions) {
    const emoji = reaction.emoji;

    const existing = reactionMap.get(emoji);

    if (existing) {
      existing.count += 1;
      existing.userIds.push(reaction.userId.toString());
    } else {
      reactionMap.set(emoji, {
        emoji,
        count: 1,
        userIds: [reaction.userId.toString()],
      });
    }
  }

  return Array.from(reactionMap.values());
};


export const addReaction = async (
  userId: string,
  messageId: string,
  emoji: string,
) => {
  if (!Types.ObjectId.isValid(messageId)) {
    throw new Error("Invalid message ID");
  }

  if (!emoji?.trim()) {
    throw new Error("Emoji is required");
  }

  const message = await MessageModel.findById(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.isDeleted) {
    throw new Error("Cannot react to a deleted message");
  }

  const isMember = await isConversationMember(
    message.conversationId.toString(),
    userId,
  );

  if (!isMember) {
    throw new Error("You are not a member of this conversation");
  }

  const existingReactionIndex = message.reactions.findIndex(
    (reaction) =>
      reaction.userId.toString() === userId && reaction.emoji === emoji,
  );

  // Same emoji again = remove it
  if (existingReactionIndex !== -1) {
    message.reactions.splice(existingReactionIndex, 1);

    await message.save();

    return {
      action: "removed" as const,
      message,
      reactionSummary: getReactionSummary(message.reactions),
    };
  }

  // Add new reaction
  message.reactions.push({
    userId: new Types.ObjectId(userId),
    emoji,
    createdAt: new Date(),
  });

  await message.save();

  return {
    action: "added" as const,
    message,
    reactionSummary: getReactionSummary(message.reactions),
  };
};

 