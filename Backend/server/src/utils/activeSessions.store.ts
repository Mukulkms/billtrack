// src/utils/activeSessions.store.ts
//
// Idle-based session expiry: a session dies only after IDLE_TIMEOUT_MS of
// NO activity, not a fixed time after login. Every authenticated request
// "touches" the session (see auth.middleware.ts), which resets the clock.
const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour of inactivity

const activeSessions = new Map<string, { userId: string; createdAt: number; lastActive: number }>();

export const getActiveCount = (): number => activeSessions.size;

export const addSession = (token: string, userId: string): void => {
  // Pehle se is user ka session hai toh hata do (duplicate avoid)
  removeSessionByUserId(userId);
  const now = Date.now();
  activeSessions.set(token, { userId, createdAt: now, lastActive: now });
};

export const removeSession = (token: string): void => {
  activeSessions.delete(token);
};

export const removeSessionByUserId = (userId: string): void => {
  for (const [token, data] of activeSessions.entries()) {
    if (data.userId === userId) {
      activeSessions.delete(token);
      break;
    }
  }
};

// Call this on every authenticated request to reset the idle clock.
export const touchSession = (token: string): void => {
  const session = activeSessions.get(token);
  if (session) session.lastActive = Date.now();
};

export const isSessionActive = (token: string): boolean => {
  const session = activeSessions.get(token);
  if (!session) return false;
  if (Date.now() - session.lastActive > IDLE_TIMEOUT_MS) {
    activeSessions.delete(token);
    return false;
  }
  return true;
};

// 🆘 EMERGENCY: Sab sessions clear karne ke liye
export const clearAllSessions = (): void => {
  activeSessions.clear();
};

// Auto cleanup har 5 minute mein — based on lastActive, not createdAt
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of activeSessions.entries()) {
    if (now - data.lastActive > IDLE_TIMEOUT_MS) {
      activeSessions.delete(token);
    }
  }
}, 5 * 60 * 1000);