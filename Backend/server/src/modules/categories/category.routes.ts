import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { createCategoryController, getCategoriesController } from "./category.controller";

const router = Router();
router.get("/", authenticate, getCategoriesController);
router.post("/", authenticate, createCategoryController);
export default router;
