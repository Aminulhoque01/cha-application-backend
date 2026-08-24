import {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing",
      });
    }

    const [type, token] =
      authHeader.split(" ");

    if (
      type !== "Bearer" ||
      !token
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET!,
      ) as JwtPayload;

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    console.error(
      "Auth middleware error:",
      error,
    );

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};