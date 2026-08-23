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
