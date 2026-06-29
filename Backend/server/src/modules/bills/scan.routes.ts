import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { scanBillController } from "./scan.controller";

const router = Router();
// POST /api/scan-bill
router.post("/", authenticate, scanBillController);
export default router;