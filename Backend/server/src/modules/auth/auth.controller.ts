import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { loginService } from "./auth.service";
import { getActiveCount, addSession, removeSession, removeSessionByUserId, clearAllSessions } from "../../utils/activeSessions.store";

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {

    if (getActiveCount() >= 2) {
      return res.status(503).json({
        success: false,
        message: "🚫 Server at full capacity (2/2 users online). Please try again later.",
      });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const result = await loginService(email, password);

    if (result?.token && result?.user?.id) {
      addSession(result.token, result.user.id);
    }

    return res.json({
      success: true,
      message: "Login Successful",
      data: result,
      activeUsers: getActiveCount(),
      maxUsers: 2,
    });

  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: err.message || "Invalid email or password",
    });
  }
};

export const logout = (req: Request, res: Response) => {
  // Token nikalo — multiple sources se
  let token: string | null = null;
  
  const authHeader = req.headers.authorization || (req as any).headers?.Authorization;
  if (authHeader && typeof authHeader === 'string') {
    token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
  }

  const userId = (req as any).user?.id;

  // Step 1: Token se remove karo
  if (token) {
    removeSession(token);
  }

  // Step 2: Backup — UserId se bhi hata do (agar token fail ho)
  if (userId) {
    removeSessionByUserId(userId);
  }
  return res.json({
    success: true,
    message: "Logged out successfully",
    activeUsers: getActiveCount(),
  });
};

// 🆘 EMERGENCY: Sab sessions clear karne ka API (Admin only)
export const emergencyClear = (req: Request, res: Response) => {
  clearAllSessions();
  return res.json({
    success: true,
    message: "All sessions cleared",
    activeUsers: 0,
  });
};