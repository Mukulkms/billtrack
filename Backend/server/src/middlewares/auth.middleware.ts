import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isSessionActive, removeSession } from "../utils/activeSessions.store";

interface JwtPayload {
  id: string;
  role: string;
}
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    // 🔴 SESSION ACTIVE CHECK
    if (!isSessionActive(token)) {
      return res.status(401).json({
        success: false,
        message: "Session expired or logged out. Please login again.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    req.user = {
      id: decoded.id,
      role: decoded.role as any,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};