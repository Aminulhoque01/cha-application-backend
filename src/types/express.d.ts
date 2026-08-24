declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};