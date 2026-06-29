import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT) || 5000,
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
  NODE_ENV: process.env.NODE_ENV || "development",
};