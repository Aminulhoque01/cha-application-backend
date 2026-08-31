import { Socket } from "socket.io";

export interface ClientToServerEvents {
  "conversation:join": (payload: { conversationId: string }) => void;

  "conversation:leave": (payload: { conversationId: string }) => void;

  "message:send": (payload: { conversationId: string; text: string }) => void;

  "message:reaction": (payload: { messageId: string; emoji: string }) => void;

  "message:edit": (payload: { messageId: string; text: string }) => void;
  "message:delete": (payload: { messageId: string }) => void;
  "message:deleted": (data: {
    messageId: string;
    conversationId: string;
    isDeleted: boolean;
    deletedAt: Date | null;
  }) => void;

  "message:delivered": (payload: { messageId: string }) => void;

  "message:read": (payload: { messageId: string }) => void;

  "typing:start": (payload: { conversationId: string }) => void;

  "typing:stop": (payload: { conversationId: string }) => void;
}

export interface ServerToClientEvents {
  "conversation:joined": (data: { conversationId: string }) => void;

  "conversation:left": (data: { conversationId: string }) => void;

  "conversation:error": (data: {
    message: string;
    conversationId?: string;
  }) => void;

  "message:new": (message: any) => void;
 

  "message:reaction:update": (data: {
    messageId: string;
    conversationId: string;
    action: "added" | "removed";

    reactionSummary: Array<{
      emoji: string;
      count: number;
      userIds: string[];
    }>;
  }) => void;

  "message:delivery:update": (data: {
    messageId: string;
    userId: string;
  }) => void;

  "message:edit": (payload: { messageId: string; text: string }) => void;
  "message:delete": (payload: { messageId: string }) => void;

  "message:read:update": (data: { messageId: string; userId: string }) => void;

  "message:error": (data: { message: string }) => void;

  "typing:start": (data: { conversationId: string; userId: string }) => void;

  "typing:stop": (data: { conversationId: string; userId: string }) => void;
}

// ⭐ এটা add করো
export interface InterServerEvents {
  // Future server-to-server events
}

export interface SocketData {
  userId: string;
}

export type AuthenticatedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
