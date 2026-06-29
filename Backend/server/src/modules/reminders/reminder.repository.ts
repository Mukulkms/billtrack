import prisma from "../../config/prisma";

export const getUpcomingRemindersRepo = (days = 7) => {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);
  return prisma.bill.findMany({
    where: {
      dueDate: { gte: now, lte: future },
      status: { in: ["PENDING", "PARTIAL"] },
    },
    include: { shop: true, reminders: true },
    orderBy: { dueDate: "asc" },
  });
};

export const getTodayRemindersRepo = () => {
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);
  return prisma.bill.findMany({
    where: { dueDate: { gte: start, lte: end }, status: { in: ["PENDING", "PARTIAL"] } },
    include: { shop: true },
  });
};

export const createReminderRepo = (billId: string, reminderDate: string, message?: string, type = "IN_APP") => {
  return prisma.reminder.create({
    data: { billId, reminderDate: new Date(reminderDate), message, type },
  });
};

export const markReminderSentRepo = (id: string) => {
  return prisma.reminder.update({
    where: { id },
    data: { isSent: true, sentAt: new Date() },
  });
};
