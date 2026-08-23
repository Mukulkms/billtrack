import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { getPaymentHistoryController } from "./payment-history.controller";

const router = Router();
router.get("/", authenticate, getPaymentHistoryController);
export default router;
