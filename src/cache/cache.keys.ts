export const cacheKeys = {
  userProfile: (userId: string) =>
    `user:profile:${userId}`,

  userSearch: (query: string) =>
    `user:search:${query.toLowerCase()}`,

  userConversations: (userId: string) =>
    `user:conversations:${userId}`,

  conversation: (conversationId: string) =>
    `conversation:${conversationId}`,
};