import { Socket } from "socket.io";

export interface SocketData {
  userId: string;
}

// ==========================================
// Client -> Server
// ==========================================

export interface ClientToServerEvents {
  "conversation:join": (
    payload: {
      conversationId: string;
    },
  ) => void;

  "conversation:leave": (
    payload: {
      conversationId: string;
    },
  ) => void;

  "message:send": (
    payload: {
      conversationId: string;
      text: string;
    },
  ) => void;

  "typing:start": (
    payload: {
      conversationId: string;
    },
  ) => void;

  "typing:stop": (
    payload: {
      conversationId: string;
    },
  ) => void;
}
// ==========================================
// Server -> Client
// ==========================================

export interface ServerToClientEvents {
  "conversation:joined": (
    payload: {
      conversationId: string;
    },
  ) => void;

  "conversation:left": (
    payload: {
      conversationId: string;
    },
  ) => void;

  "conversation:error": (
    payload: {
      message: string;
      conversationId?: string;
    },
  ) => void;

  "message:new": (
    message: unknown,
  ) => void;

  "message:error": (
    payload: {
      message: string;
    },
  ) => void;

  "typing:start": (
    payload: {
      conversationId: string;
      userId: string;
    },
  ) => void;

  "typing:stop": (
    payload: {
      conversationId: string;
      userId: string;
    },
  ) => void;
}
// ==========================================
// Inter-server
// ==========================================

export interface InterServerEvents {}



 

export interface ClientToServerEvents {
  "message:delivered": (
    payload: {
      messageId: string;
    },
  ) => void;
}

export interface ServerToClientEvents {
  "message:delivery:update": (
    payload: {
      messageId: string;
      userId: string;
    },
  ) => void;
}

// ==========================================
// Socket
// ==========================================

export type AuthenticatedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
