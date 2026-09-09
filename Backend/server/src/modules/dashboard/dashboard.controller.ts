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
// Two sources are combined for each month, so a sale never disappears:
//   1) Bill table — live, still-existing bills (billDate + amount + categoryId).
//      If a bill's amount/category/date is edited, the very next call reflects it.
//   2) SalesArchive table — permanent snapshots taken the moment a bill is deleted
//      (see deleteBillRepo). These never purge and never depend on the live
//      Category table, so a deleted bill's sale still counts toward its month
//      forever, even years later.
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

  const [categoryGroups, uncategorizedGroup, monthBillCount, allCategories, archiveGroups, archiveUncategorizedGroup, archiveCount] = await Promise.all([
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
    // Deleted bills, grouped by their original categoryId (categoryName snapshot
    // is used for display so it's correct even if that category no longer exists).
    prisma.salesArchive.groupBy({
      by: ["categoryId"],
      where: {
        categoryId: { not: null },
        billDate: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.salesArchive.aggregate({
      where: {
        categoryId: null,
        billDate: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.salesArchive.count({ where: { billDate: { gte: monthStart, lt: monthEnd } } }),
  ]);

  const categoryMap = new Map(allCategories.map((c) => [c.id, c.name]));
  // Fallback name for a categoryId that no longer exists in Category (deleted
  // category): use whatever name was snapshotted alongside its archived bills.
  const archiveNameByCategoryId = new Map<string, string>();
  for (const g of archiveGroups) {
    if (g.categoryId && !categoryMap.has(g.categoryId)) {
      const sample = await prisma.salesArchive.findFirst({
        where: { categoryId: g.categoryId },
        orderBy: { archivedAt: "desc" },
        select: { categoryName: true },
      });
      if (sample) archiveNameByCategoryId.set(g.categoryId, sample.categoryName);
    }
  }

  const archiveSumByCategoryId = new Map(
    archiveGroups.map((g) => [g.categoryId as string, { amount: Number(g._sum.amount) || 0, count: g._count._all }])
  );

  // categoryId -> combined totals (live Bill + archived/deleted Bill)
  const combined = new Map<string, { categoryName: string; totalAmount: number; billCount: number }>();

  for (const g of categoryGroups) {
    const id = g.categoryId as string;
    combined.set(id, {
      categoryName: categoryMap.get(id) || archiveNameByCategoryId.get(id) || "Unknown",
      totalAmount: Number(g._sum.amount) || 0,
      billCount: g._count._all,
    });
  }
  for (const [id, sum] of archiveSumByCategoryId) {
    const existing = combined.get(id);
    if (existing) {
      existing.totalAmount += sum.amount;
      existing.billCount += sum.count;
    } else {
      combined.set(id, {
        categoryName: categoryMap.get(id) || archiveNameByCategoryId.get(id) || "Unknown",
        totalAmount: sum.amount,
        billCount: sum.count,
      });
    }
  }

  // Include every currently-defined category, even ones with 0 sales this
  // month, so the filter view always lists all categories the user has defined.
  for (const cat of allCategories) {
    if (!combined.has(cat.id)) {
      combined.set(cat.id, { categoryName: cat.name, totalAmount: 0, billCount: 0 });
    }
  }

  const salesByCategory = Array.from(combined.entries())
    .map(([categoryId, v]) => ({ categoryId, ...v }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  const uncategorizedTotal = (Number(uncategorizedGroup._sum.amount) || 0) + (Number(archiveUncategorizedGroup._sum.amount) || 0);
  const uncategorizedCount = (uncategorizedGroup._count._all || 0) + (archiveUncategorizedGroup._count._all || 0);
  if (uncategorizedCount > 0) {
    salesByCategory.push({
      categoryId: "uncategorized",
      categoryName: "Uncategorized",
      totalAmount: uncategorizedTotal,
      billCount: uncategorizedCount,
    });
  }
  salesByCategory.sort((a, b) => b.totalAmount - a.totalAmount);

  const grandTotal = salesByCategory.reduce((s, c) => s + c.totalAmount, 0);

  res.json({
    success: true,
    data: {
      year,
      month,
      monthLabel: monthStart.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      billCount: monthBillCount + archiveCount,
      grandTotal,
      categoryTotals: salesByCategory,
    },
  });
};
