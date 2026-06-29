import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { createPaymentController, getPaymentsByBillController } from "./payment.controller";

const router = Router();
router.use(authenticate);

router.post("/", createPaymentController);
router.get("/bill/:billId", getPaymentsByBillController);

export default router;
