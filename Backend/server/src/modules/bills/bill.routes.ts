import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middlewares/auth.middleware";
import { createBillController, getBillsController, getBillByIdController, updateBillController, deleteBillController, getOverdueBillsController, markOverdueController, uploadAttachmentController, getAttachmentUrlController } from "./bill.controller";
import { createBillValidation } from "./bill.validation";

const router = Router();
router.use(authenticate);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only image files are allowed")),
});

router.post("/attachment", upload.single("file"), uploadAttachmentController);
router.post("/", createBillValidation, createBillController);
router.get("/", getBillsController);
router.get("/overdue", getOverdueBillsController);
router.post("/mark-overdue", markOverdueController);
router.get("/:id/attachment", getAttachmentUrlController);
router.get("/:id", getBillByIdController);
router.put("/:id", updateBillController);
router.delete("/:id", deleteBillController);

export default router;
