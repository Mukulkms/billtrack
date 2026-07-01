import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { createBillService, getBillsService, getBillByIdService, updateBillService, deleteBillService, getOverdueBillsService, markOverdueService } from "./bill.service";
import prisma from "../../config/prisma";
import { BillStatus } from "@prisma/client";

export const createBillController = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const bill = await createBillService(req.body);
  res.status(201).json({ success: true, message: "Bill created", data: bill });
};
export const getBillsController = async (req: Request, res: Response) => {
  const { search, status, shopId, categoryId, page = '1', limit = '10' } = req.query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};
  if (status === 'OVERDUE') {
    // Overdue isn't a stored status — compute it dynamically
    where.status = { in: ['PENDING', 'PARTIAL'] };
    where.dueDate = { lt: new Date() };
  } else if (status) {
    where.status = status;
  }
  if (shopId) where.shopId = shopId;
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.OR = [
      { billNumber: { contains: search as string, mode: 'insensitive' } },
      { shop: { shopName: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  // Get total count
  const totalCount = await prisma.bill.count({ where });

  // Get paginated data
  const bills = await prisma.bill.findMany({
    where,
    skip,
    take: limitNum,
    orderBy: { createdAt: 'desc' },
    include: { shop: true, payments: true, category: true },
  });

  res.json({
    success: true,
    data: bills,
    totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
    pageSize: limitNum,
  });
};

export const getBillByIdController = async (req: Request, res: Response) => {
  const bill = await getBillByIdService(req.params.id as string);
  if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });
  res.json({ success: true, data: bill });
};

export const updateBillController = async (req: Request, res: Response) => {
  const bill = await updateBillService(req.params.id as string, req.body);
  res.json({ success: true, message: "Bill updated", data: bill });
};

export const deleteBillController = async (req: Request, res: Response) => {
  await deleteBillService(req.params.id as string);
  res.json({ success: true, message: "Bill deleted" });
};

export const getOverdueBillsController = async (req: Request, res: Response) => {
  const bills = await getOverdueBillsService();
  res.json({ success: true, data: bills });
};

export const markOverdueController = async (req: Request, res: Response) => {
  const result = await markOverdueService();
  res.json({ success: true, message: `${result.count} bills marked overdue`, data: result });
};
