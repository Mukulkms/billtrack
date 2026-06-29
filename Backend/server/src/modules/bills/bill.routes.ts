import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { createBillController, getBillsController, getBillByIdController, updateBillController, deleteBillController, getOverdueBillsController, markOverdueController } from "./bill.controller";
import { createBillValidation } from "./bill.validation";

const router = Router();
router.use(authenticate);

router.post("/", createBillValidation, createBillController);
router.get("/", getBillsController);
router.get("/overdue", getOverdueBillsController);
router.post("/mark-overdue", markOverdueController);
router.get("/:id", getBillByIdController);
router.put("/:id", updateBillController);
router.delete("/:id", deleteBillController);

export default router;
