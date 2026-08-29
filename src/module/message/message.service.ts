import mongoose from "mongoose";

import { MessageModel } from "./message.model";
import { ConversationModel } from "../conversation/conversation.model";

export const createMessage = async (
  currentUserId: string,
  conversationId: string,
  text: string,
) => {
  // 1. Validate current user ID
  if (
    !mongoose.Types.ObjectId.isValid(
      currentUserId,
    )
  ) {
    throw new Error("Invalid current user ID");
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

  // 3. Find conversation and make sure
  //    current user is a participant
  const conversation =
    await ConversationModel.findOne({
      _id: new mongoose.Types.ObjectId(
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

  // 4. Create message
  const message = await MessageModel.create({
    conversationId:
      new mongoose.Types.ObjectId(
        conversationId,
      ),

    senderId:
      new mongoose.Types.ObjectId(
        currentUserId,
      ),

    text: text.trim(),
  });

  // 5. Update conversation lastMessage
  conversation.lastMessage = message._id;

  await conversation.save();

  // 6. Populate sender
  await message.populate(
    "senderId",
    "phone name avatar bio isOnline lastSeen",
  );

  return message;
};


export const getConversationMessages = async (
  currentUserId: string,
  conversationId: string,
  page = 1,
  limit = 30,
) => {
  // 1. Validate current user ID
  if (
    !mongoose.Types.ObjectId.isValid(
      currentUserId,
    )
  ) {
    throw new Error("Invalid current user ID");
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

  // 3. Find conversation and verify membership
  const conversation =
    await ConversationModel.findOne({
      _id: new mongoose.Types.ObjectId(
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

  // 4. Calculate pagination
  const skip = (page - 1) * limit;

  // 5. Fetch messages + total count together
  const [messages, total] =
    await Promise.all([
      MessageModel.find({
        conversationId:
          new mongoose.Types.ObjectId(
            conversationId,
          ),
      })
        .populate(
          "senderId",
          "phone name avatar bio isOnline lastSeen",
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      MessageModel.countDocuments({
        conversationId:
          new mongoose.Types.ObjectId(
            conversationId,
          ),
      }),
    ]);

  // 6. Reverse for chat UI
  // DB gives newest → oldest
  // Response gives oldest → newest
  messages.reverse();

  // 7. Pagination information
  const totalPages = Math.ceil(
    total / limit,
  );

  return {
    messages,

    pagination: {
      page,
      limit,
      total,
      totalPages,

      hasNextPage:
        page < totalPages,

      hasPreviousPage:
        page > 1,
    },
  };
};


export const markMessageAsDelivered = async (
  currentUserId: string,
  messageId: string,
) => {
  // 1. Validate IDs
  if (
    !mongoose.Types.ObjectId.isValid(
      currentUserId,
    )
  ) {
    throw new Error(
      "Invalid current user ID",
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      messageId,
    )
  ) {
    throw new Error(
      "Invalid message ID",
    );
  }

  // 2. Find message
  const message =
    await MessageModel.findById(messageId);

  if (!message) {
    throw new Error(
      "Message not found",
    );
  }

  // 3. Sender cannot mark own message as delivered
  if (
    message.senderId.toString() ===
    currentUserId
  ) {
    throw new Error(
      "You cannot mark your own message as delivered",
    );
  }

  // 4. Verify user is a conversation member
  const conversation =
    await ConversationModel.findOne({
      _id: message.conversationId,

      participants:
        new mongoose.Types.ObjectId(
          currentUserId,
        ),
    }).select("_id");

  if (!conversation) {
    throw new Error(
      "You are not a member of this conversation",
    );
  }

  // 5. Add user only once
  await MessageModel.findByIdAndUpdate(
    messageId,
    {
      $addToSet: {
        deliveredTo:
          new mongoose.Types.ObjectId(
            currentUserId,
          ),
      },
    },
    {
      new: true,
    },
  );

  return {
    messageId,
    conversationId:
      message.conversationId.toString(),
    userId: currentUserId,
  };
};