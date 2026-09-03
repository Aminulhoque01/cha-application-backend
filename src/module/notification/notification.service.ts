import { firebaseMessaging } from "../../config/firebase";
import { UserModel } from "../user/user.model";

export const registerPushToken = async (
  currentUserId: string,
  token: string,
  device = "web",
) => {
  if (!token?.trim()) {
    throw new Error(
      "Push token is required",
    );
  }

  const user =
    await UserModel.findById(
      currentUserId,
    );

  if (!user) {
    throw new Error(
      "User not found",
    );
  }

  const tokenExists =
    user.pushTokens.some(
      (item) =>
        item.token === token,
    );

  if (tokenExists) {
    return user;
  }

  user.pushTokens.push({
    token: token.trim(),
    device,
    createdAt: new Date(),
  });

  await user.save();

  return user;
};

export const removePushToken = async (
  currentUserId: string,
  token: string,
) => {
  if (!token?.trim()) {
    throw new Error(
      "Push token is required",
    );
  }

  const user =
    await UserModel.findById(
      currentUserId,
    );

  if (!user) {
    throw new Error(
      "User not found",
    );
  }

  user.pushTokens =
    user.pushTokens.filter(
      (item) =>
        item.token !== token,
    );

  await user.save();

  return user;
};


 

export const sendPushNotification = async ({
  tokens,
  title,
  body,
  data = {},
}: {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}) => {
  if (!tokens.length) {
    return;
  }

  try {
    const messages = tokens.map(
      (token) => ({
        token,

        notification: {
          title,
          body,
        },

        data,

        webpush: {
          notification: {
            icon: "/icon-192x192.png",
          },
        },
      }),
    );

    const responses =
      await firebaseMessaging.sendEach(
        messages,
      );

    const successCount =
      responses.responses.filter(
        (response) => response.success,
      ).length;

    const failureCount =
      responses.responses.filter(
        (response) => !response.success,
      ).length;

    console.log(
      `Push notification: ${successCount} sent, ${failureCount} failed`,
    );

    return responses;
  } catch (error) {
    console.error(
      "Push notification error:",
      error,
    );
  }
};