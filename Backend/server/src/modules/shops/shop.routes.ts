import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

import {
  createShopController,
  getShopsController,
  getShopByIdController,
  updateShopController,
  deleteShopController,
} from "./shop.controller";

import { createShopValidation } from "./shop.validation";

const router = Router();

// CREATE
router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  createShopValidation,
  createShopController
);

// GET ALL
router.get(
  "/",
  authenticate,
  getShopsController
);

// GET ONE
router.get(
  "/:id",
  authenticate,
  getShopByIdController
);

// UPDATE
router.put(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  updateShopController
);

// DELETE
router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  deleteShopController
);

export default router;