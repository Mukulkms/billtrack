// src/utils/activeSessions.store.ts
const activeSessions = new Map<string, { userId: string; createdAt: number }>();

export const getActiveCount = (): number => activeSessions.size;

export const addSession = (token: string, userId: string): void => {
  // Pehle se is user ka session hai toh hata do (duplicate avoid)
  removeSessionByUserId(userId);
  activeSessions.set(token, { userId, createdAt: Date.now() });
};

export const removeSession = (token: string): void => {
  const existed = activeSessions.has(token);
  activeSessions.delete(token);
};

export const removeSessionByUserId = (userId: string): void => {
  let removed = false;
  for (const [token, data] of activeSessions.entries()) {
    if (data.userId === userId) {
      activeSessions.delete(token);
      removed = true;
      break;
    }
  }
};

export const isSessionActive = (token: string): boolean => {
  return activeSessions.has(token);
};

// 🆘 EMERGENCY: Sab sessions clear karne ke liye
export const clearAllSessions = (): void => {
  const count = activeSessions.size;
  activeSessions.clear();
};

// Auto cleanup har 5 minute mein
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [token, data] of activeSessions.entries()) {
    if (now - data.createdAt > 15 * 60 * 1000) {
      activeSessions.delete(token);
      cleaned++;
    }
  }
 
}, 5 * 60 * 1000);