import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

export const authorize =
  (...roles: UserRole[]) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Permission Denied",
      });
    }

    next();
  };