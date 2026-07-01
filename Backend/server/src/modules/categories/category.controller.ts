import { Request, Response } from "express";
import { createCategoryService, getCategoriesService } from "./category.service";

export const createCategoryController = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Category name required" });
  }
  try {
    const category = await createCategoryService({ name });
    res.status(201).json({ success: true, message: "Category created", data: category });
  } catch (e: any) {
    if (e.code === "P2002") {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }
    throw e;
  }
};

export const getCategoriesController = async (req: Request, res: Response) => {
  const categories = await getCategoriesService();
  res.json({ success: true, data: categories });
};
