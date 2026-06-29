import { Router } from "express";
import { login, logout, emergencyClear } from "./auth.controller";
import { loginValidation } from "./auth.validation";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/login", loginValidation, login);
router.post("/logout", authenticate, logout);

// 🆘 Emergency clear — Admin only
router.post("/clear-sessions", authenticate, authorize(UserRole.ADMIN), emergencyClear);

export default router;