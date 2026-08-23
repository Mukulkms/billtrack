import prisma from "../../config/prisma";
import { CreatePaymentDto } from "./payment.types";
import { PaymentMode } from "@prisma/client";

export const createPaymentRepo = async (data: CreatePaymentDto, receivedById: string) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        billId: data.billId,
        amount: data.amount,
        mode: data.mode as PaymentMode,
        transactionId: data.transactionId,
        note: data.note,
        receivedById,
        receivedAt: data.receivedAt ? new Date(data.receivedAt) : new Date(),
      },
    });

    const bill = await tx.bill.findUnique({ where: { id: data.billId }, include: { shop: true } });
    if (!bill) throw new Error("Bill not found");

    const newPaidAmount = Number(bill.paidAmount) + data.amount;
    const newPendingAmount = Number(bill.amount) - newPaidAmount;

    let newStatus: any = "PENDING";
    if (newPendingAmount <= 0) newStatus = "PAID";
    else if (newPaidAmount > 0) newStatus = "PARTIAL";
    else {
      const now = new Date();
      if (bill.dueDate < now) newStatus = "OVERDUE";
    }

    await tx.bill.update({
      where: { id: data.billId },
      data: {
        paidAmount: newPaidAmount,
        pendingAmount: Math.max(0, newPendingAmount),
        status: newStatus,
      },
    });

    if (newStatus === "PAID") {
      await tx.paymentHistory.create({
        data: {
          shopName: bill.shop.shopName,
          ownerName: bill.shop.ownerName,
          billNumber: bill.billNumber,
          amount: bill.amount,
          billDate: bill.billDate,
          paidAt: new Date(),
        },
      });
    }

    return payment;
  });
};

export const getPaymentsByBillRepo = (billId: string) => {
  return prisma.payment.findMany({
    where: { billId },
    include: { receivedBy: { select: { name: true, email: true } } },
    orderBy: { receivedAt: "desc" },
  });
};
