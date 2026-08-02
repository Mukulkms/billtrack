import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { getPaymentInsights } from "./insight.controller";

const router = Router();
// GET /api/insights
router.get("/", authenticate, getPaymentInsights);
export default router;
