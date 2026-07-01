import prisma from "../../config/prisma";
import { CreateBillDto } from "./bill.types";
import { BillStatus } from "@prisma/client";

export const createBillRepo = (data: CreateBillDto & { billNumber: string; pendingAmount: number }) => {
  return prisma.bill.create({
    data: {
      shopId: data.shopId,
      billNumber: data.billNumber,
      invoiceNumber: data.invoiceNumber,
      amount: data.amount,
      paidAmount: 0,
      pendingAmount: data.amount,
      billDate: new Date(data.billDate),
      dueDate: new Date(data.dueDate),
      reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
      remarks: data.remarks,
      attachment: data.attachment,
    },
    include: { shop: true, payments: true },
  });
};

export const getBillsRepo = (page: number, limit: number, search: string, status?: string, shopId?: string) => {
  const where: any = {};
  
  // ✅ OVERDUE ko date-based filter mein convert karo
  if (status === "OVERDUE") {
    where.status = { in: ["PENDING", "PARTIAL"] };
    where.dueDate = { lt: new Date() };
  } else if (status) {
    where.status = status as BillStatus;
  }
  
  if (shopId) where.shopId = shopId;
  if (search) {
    where.OR = [
      { billNumber: { contains: search, mode: "insensitive" } },
      { shop: { shopName: { contains: search, mode: "insensitive" } } },
      { shop: { ownerName: { contains: search, mode: "insensitive" } } },
    ];
  }
  return prisma.bill.findMany({
    where,
    include: { shop: { select: { shopName: true, ownerName: true, phone: true, whatsapp: true } }, payments: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { dueDate: "asc" },
  });
};

export const getBillsCountRepo = (search: string, status?: string, shopId?: string) => {
  const where: any = {};
  
  // ✅ Same fix here bhi
  if (status === "OVERDUE") {
    where.status = { in: ["PENDING", "PARTIAL"] };
    where.dueDate = { lt: new Date() };
  } else if (status) {
    where.status = status as BillStatus;
  }
  
  if (shopId) where.shopId = shopId;
  if (search) {
    where.OR = [
      { billNumber: { contains: search, mode: "insensitive" } },
      { shop: { shopName: { contains: search, mode: "insensitive" } } },
    ];
  }
  return prisma.bill.count({ where });
};

export const getBillByIdRepo = (id: string) => {
  return prisma.bill.findUnique({
    where: { id },
    include: {
      shop: true,
      payments: { include: { receivedBy: { select: { name: true } } }, orderBy: { receivedAt: "desc" } },
      reminders: { orderBy: { reminderDate: "asc" } },
    },
  });
};

export const updateBillRepo = (id: string, data: any) => {
  return prisma.bill.update({ where: { id }, data, include: { shop: true } });
};

// bill.repository.ts

export const deleteBillRepo = (id: string) => {
  return prisma.$transaction([
    // Pehle linked payments delete karo
    prisma.payment.deleteMany({
      where: { billId: id }
    }),
    // Phir bill delete karo
    prisma.bill.delete({
      where: { id }
    })
  ])
}

export const getOverdueBillsRepo = () => {
  const now = new Date();
  return prisma.bill.findMany({
    where: {
      dueDate: { lt: now },
      status: { in: ["PENDING", "PARTIAL"] },
    },
    include: { shop: true },
  });
};

export const markOverdueRepo = () => {
  const now = new Date();
  return prisma.bill.updateMany({
    where: { dueDate: { lt: now }, status: { in: ["PENDING", "PARTIAL"] } },
    data: { status: "OVERDUE" },
  });
};
export const createBillRepo = (data: CreateBillDto & { billNumber: string; pendingAmount: number }) => {
  return prisma.bill.create({
    data: {
      shopId: data.shopId,
      billNumber: data.billNumber,
      invoiceNumber: data.invoiceNumber,
      amount: data.amount,
      paidAmount: 0,
      pendingAmount: data.amount,
      billDate: new Date(data.billDate),
      dueDate: new Date(data.dueDate),
      reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
      remarks: data.remarks,
      attachment: data.attachment,
      categoryId: data.categoryId || null,
    },
    include: { shop: true, payments: true, category: true },
  });
};
