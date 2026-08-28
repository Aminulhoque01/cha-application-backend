import { Socket } from "socket.io";

export interface SocketData {
  userId: string;
}

export type AuthenticatedSocket =
  Socket<
    Record<string, never>,
    Record<string, never>,
    Record<string, never>,
    SocketData
  >;