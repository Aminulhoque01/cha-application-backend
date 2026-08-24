export const cacheKeys = {
  userProfile: (userId: string) =>
    `user:profile:${userId}`,

  userConversations: (userId: string) =>
    `user:conversations:${userId}`,

  conversation: (id: string) =>
    `conversation:${id}`,
};