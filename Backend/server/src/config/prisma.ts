import { PrismaClient } from "@prisma/client";

// Logging every query adds real overhead on every request in production.
// Keep full logging in dev, but only warnings/errors once deployed.
const isProd = process.env.NODE_ENV === "production";

const prisma = new PrismaClient({
  log: isProd ? ["warn", "error"] : ["query", "info", "warn", "error"],
});

export default prisma;