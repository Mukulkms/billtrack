import { Request, Response } from "express";
import prisma from "../../config/prisma";

export const getDashboardStats = async (req: Request, res: Response) => {
  const now = new Date();
  const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalShops,
    totalBills,
    overdueCount,
    pendingCount,
    paidCount,
    weeklyDue,
    totalOutstanding,
    totalCollected,
    recentBills,
    categoryGroups,
  ] = await Promise.all([
    prisma.shop.count({ where: { isActive: true } }),
    prisma.bill.count(),
    
    prisma.bill.groupBy({
    by: ["categoryId"],
    where: { categoryId: { not: null } },
    _sum: { amount: true, pendingAmount: true },
    _count: { _all: true },
  }),
    // ✅ Fix: status se nahi, date se overdue check karo
    prisma.bill.count({
      where: {
        status: { in: ["PENDING", "PARTIAL"] },
        dueDate: { lt: now },
      },
    }),

    prisma.bill.count({ where: { status: { in: ["PENDING", "PARTIAL"] } } }),
    prisma.bill.count({ where: { status: "PAID" } }),
    prisma.bill.findMany({
      where: {
        dueDate: { gte: now, lte: weekEnd },
        status: { in: ["PENDING", "PARTIAL"] }, // OVERDUE hata diya
      },
      include: { shop: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.bill.aggregate({
      where: { status: { in: ["PENDING", "PARTIAL"] } }, // OVERDUE hata diya
      _sum: { pendingAmount: true },
    }),
    prisma.payment.aggregate({
      where: { receivedAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.bill.findMany({
      include: { shop: { select: { shopName: true, ownerName: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

const categoryIds = categoryGroups.map(g => g.categoryId).filter(Boolean) as string[];
const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
const categoryMap = new Map(categories.map(c => [c.id, c.name]));

const categoryTotals = categoryGroups
  .map(g => ({
    categoryId: g.categoryId,
    categoryName: categoryMap.get(g.categoryId as string) || "Unknown",
    totalAmount: Number(g._sum.amount) || 0,
    pendingAmount: Number(g._sum.pendingAmount) || 0,
    billCount: g._count._all,
  }))
  .sort((a, b) => b.totalAmount - a.totalAmount);


  res.json({
    success: true,
    data: {
      totalShops,
      totalBills,
      overdueCount,
      pendingCount,
      paidCount,
      totalOutstanding: Number(totalOutstanding._sum.pendingAmount) || 0,
      collectedThisMonth: Number(totalCollected._sum.amount) || 0,
      weeklyDue,
      recentBills,
      categoryTotals,
    },
  });
};
