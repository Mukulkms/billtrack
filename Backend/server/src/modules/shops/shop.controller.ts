import { Request, Response } from "express";
import { validationResult } from "express-validator";

import {
  createShopService,
  getShopByIdService,
  getShopsService,
  updateShopService,
  deleteShopService,
} from "./shop.service";

// CREATE
export const createShopController = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const shop = await createShopService(req.body, req.user!.id);

  res.status(201).json({
    success: true,
    message: "Shop Created",
    data: shop,
  });
};

// GET ALL
export const getShopsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = (req.query.search as string) || "";

  const shops = await getShopsService(page, limit, search);

  res.json({
    success: true,
    data: shops,
  });
};

// GET BY ID
export const getShopByIdController = async (req: Request, res: Response) => {
  const shop = await getShopByIdService(req.params.id as string);

  res.json({
    success: true,
    data: shop,
  });
};

// UPDATE
export const updateShopController = async (req: Request, res: Response) => {
  const shop = await updateShopService(req.params.id as string, req.body);

  res.json({
    success: true,
    message: "Shop Updated",
    data: shop,
  });
};

// DELETE (SOFT)
export const deleteShopController = async (req: Request, res: Response) => {
  await deleteShopService(req.params.id as string);

  res.json({
    success: true,
    message: "Shop Deleted",
  });
};