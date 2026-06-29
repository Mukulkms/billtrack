import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import {
  getMeController,
  getUsersController,
  createUserController,
  deleteUserController,
  updateUserController,
  resetUserPasswordController,
  updateOwnPasswordController,
} from "./user.controller";
import { UserRole } from "@prisma/client";

const router = Router();

// ─── Current User ──────────────────────────────────
router.get("/me", authenticate, getMeController);

// ─── Admin Routes ──────────────────────────────────
router.get("/", authenticate, authorize(UserRole.ADMIN), getUsersController);
router.post("/", authenticate, authorize(UserRole.ADMIN), createUserController);
router.delete("/:id", authenticate, authorize(UserRole.ADMIN), deleteUserController);
router.patch("/:id", authenticate, authorize(UserRole.ADMIN), updateUserController);
router.patch("/:id/reset-password", authenticate, authorize(UserRole.ADMIN), resetUserPasswordController);

// ─── Admin Own Password Update ─────────────────────
router.patch("/me/password", authenticate, authorize(UserRole.ADMIN), updateOwnPasswordController);

export default router;