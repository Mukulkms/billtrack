import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { getDashboardStats } from "./dashboard.controller";

const router = Router();
router.get("/stats", authenticate, getDashboardStats);
export default router;
