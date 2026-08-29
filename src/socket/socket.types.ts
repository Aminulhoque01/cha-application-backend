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
}

// ==========================================
// Inter-server
// ==========================================

export interface InterServerEvents {}

// ==========================================
// Socket
// ==========================================

export type AuthenticatedSocket =
  Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;