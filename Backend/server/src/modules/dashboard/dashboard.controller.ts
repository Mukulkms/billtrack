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
    totalCollectedAgg,   
    recentBills,
    categoryGroups,
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
    prisma.payment.aggregate({        
      _sum: { amount: true },
    }),
    prisma.bill.findMany({
      include: { shop: { select: { shopName: true, ownerName: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.bill.groupBy({
      by: ["categoryId"],
      where: { categoryId: { not: null } },
      _sum: { amount: true, pendingAmount: true },
      _count: { _all: true },
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
      totalCollected: Number(totalCollectedAgg._sum.amount) || 0,
      collectedThisMonth: Number(totalCollected._sum.amount) || 0,
      weeklyDue,
      recentBills,
      categoryTotals,
    },
  });
};

// ✅ Month-wise sales per category.
// This is always computed live from the Bill table (billDate + amount + categoryId),
// so it is never a stale "snapshot" — if a bill's amount, category, or date is edited
// later, the very next call to this endpoint reflects the correction automatically.
export const getMonthlySales = async (req: Request, res: Response) => {
  const now = new Date();
  const year = req.query.year ? Number(req.query.year) : now.getFullYear();
  const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1; // 1-12

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return res.status(400).json({ success: false, message: "Invalid year or month" });
  }

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1); // exclusive (1st of next month)

  const [categoryGroups, uncategorizedGroup, monthBillCount, allCategories] = await Promise.all([
    prisma.bill.groupBy({
      by: ["categoryId"],
      where: {
        categoryId: { not: null },
        billDate: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.bill.aggregate({
      where: {
        categoryId: null,
        billDate: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.bill.count({ where: { billDate: { gte: monthStart, lt: monthEnd } } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const categoryMap = new Map(allCategories.map((c) => [c.id, c.name]));

  const salesByCategory = categoryGroups
    .map((g) => ({
      categoryId: g.categoryId as string,
      categoryName: categoryMap.get(g.categoryId as string) || "Unknown",
      totalAmount: Number(g._sum.amount) || 0,
      billCount: g._count._all,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  // Include every category, even ones with 0 sales this month, so the filter
  // view always lists all categories the user has defined.
  const coveredIds = new Set(salesByCategory.map((c) => c.categoryId));
  for (const cat of allCategories) {
    if (!coveredIds.has(cat.id)) {
      salesByCategory.push({ categoryId: cat.id, categoryName: cat.name, totalAmount: 0, billCount: 0 });
    }
  }
  salesByCategory.sort((a, b) => b.totalAmount - a.totalAmount);

  if ((uncategorizedGroup._count._all || 0) > 0) {
    salesByCategory.push({
      categoryId: "uncategorized",
      categoryName: "Uncategorized",
      totalAmount: Number(uncategorizedGroup._sum.amount) || 0,
      billCount: uncategorizedGroup._count._all,
    });
  }

  const grandTotal = salesByCategory.reduce((s, c) => s + c.totalAmount, 0);

  res.json({
    success: true,
    data: {
      year,
      month,
      monthLabel: monthStart.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      billCount: monthBillCount,
      grandTotal,
      categoryTotals: salesByCategory,
    },
  });
};
