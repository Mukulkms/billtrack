import prisma from "../../config/prisma";

const RETENTION_DAYS = 30;

const purgeOld = async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  await prisma.paymentHistory.deleteMany({ where: { paidAt: { lt: cutoff } } });
};

export const getPaymentHistoryRepo = async () => {
  await purgeOld();
  return prisma.paymentHistory.findMany({ orderBy: { paidAt: "desc" } });
};

// Selected entries ko delete karta hai (checkbox / "select all" se). ids khali ho
// ya na diye gaye ho to kuch nahi hota — safety ke liye.
export const deletePaymentHistoryRepo = async (ids: string[]) => {
  if (!ids || ids.length === 0) return { count: 0 };
  return prisma.paymentHistory.deleteMany({ where: { id: { in: ids } } });
};
