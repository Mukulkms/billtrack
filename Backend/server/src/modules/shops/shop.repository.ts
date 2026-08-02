import prisma from "../../config/prisma";
import { CreateShopDto } from "./shop.types";

export const createShopRepo = (data: CreateShopDto, userId: string) => {
  return prisma.shop.create({
    data: {
      ...data,
      createdById: userId,
    },
  });
};

export const getShopByIdRepo = (id: string) => {
  return prisma.shop.findUnique({
    where: { id },
    include: {
      bills: true,
    },
  });
};

export const getShopsRepo = (page: number, limit: number, search: string) => {
  return prisma.shop.findMany({
    where: {
      isActive: true,
      OR: [
        { shopName: { contains: search, mode: "insensitive" } },
        { ownerName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ],
    },
    include: {
      bills: {
        where: { status: { not: "PAID" } },
        select: {
          id: true,
          status: true,
          dueDate: true,
          pendingAmount: true,
        },
      },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
};
const SHOP_UPDATABLE_FIELDS = [
  "shopName", "ownerName", "phone", "whatsapp", "email", "gstNumber",
  "address", "city", "state", "pincode", "paymentTerm", "creditLimit",
  "openingBalance", "notes", "isActive",
] as const;

export const updateShopRepo = (id: string, data: any) => {
  const cleanData: Record<string, any> = {};
  for (const field of SHOP_UPDATABLE_FIELDS) {
    if (data[field] !== undefined) cleanData[field] = data[field];
  }

  return prisma.shop.update({
    where: { id },
    data: cleanData,
  });
};

export const deleteShopRepo = (id: string) => {
  return prisma.shop.update({
    where: { id },
    data: { isActive: false },
  });
};

