import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { getDashboardStats, getMonthlySales } from "./dashboard.controller";

const router = Router();
router.get("/stats", authenticate, getDashboardStats);
router.get("/monthly-sales", authenticate, getMonthlySales);
export default router;
