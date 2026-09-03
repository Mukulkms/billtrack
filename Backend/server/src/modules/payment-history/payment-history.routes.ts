import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { getPaymentHistoryController, deletePaymentHistoryController } from "./payment-history.controller";

const router = Router();
router.get("/", authenticate, getPaymentHistoryController);
router.delete("/", authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), deletePaymentHistoryController);
export default router;
