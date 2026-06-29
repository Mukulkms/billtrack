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
  ] = await Promise.all([
    prisma.shop.count({ where: { isActive: true } }),
    prisma.bill.count(),

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
    },
  });
};