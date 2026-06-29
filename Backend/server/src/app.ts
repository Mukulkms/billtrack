import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth";
import { apiLimiter } from "./middlewares/rateLimit.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { notFound } from "./middlewares/notFound.middleware";
import shopRoutes from "./modules/shops/shop.routes";
import billRoutes from "./modules/bills/bill.routes";
import scanRoutes from "./modules/bills/scan.routes";
import paymentRoutes from "./modules/payments/payment.routes";
import reminderRoutes from "./modules/reminders/reminder.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import userRoutes from "./modules/users/user.routes";

const app = express();

// 🔥 CORS FIX — Multiple origins allow
const allowedOrigins = [
  "http://localhost:5173",
  "https://billtrack-azure.vercel.app",  // 👈 Tera actual Vercel URL
];

// Agar env mein aur URLs hain toh split karke add kar
if (process.env.CLIENT_URL) {
  const envUrls = process.env.CLIENT_URL.split(',').map(u => u.trim());
  allowedOrigins.push(...envUrls);
}

app.use(cors({
  origin: (origin, callback) => {
    // No origin (Postman/curl) allow
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());
app.use(apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/scan-bill", scanRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

app.get("/", (_req, res) => res.json({ success: true, message: "BillTracker API 🚀" }));

app.use(notFound);
app.use(errorHandler);

export default app;
