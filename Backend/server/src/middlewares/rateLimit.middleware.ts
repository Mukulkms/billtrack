import rateLimit from "express-rate-limit";

// General API limiter — generous, covers normal app usage
// (dashboard + bills + shops + categories easily fire 15-20 requests per page load)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Try again later."
  }
});

// Strict limiter — only for login, to actually stop brute-force attempts.
// Successful logins don't count against the limit, only failed attempts do.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in a few minutes."
  }
});
