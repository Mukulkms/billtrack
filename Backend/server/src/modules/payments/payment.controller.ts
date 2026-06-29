import { Request, Response } from "express";
import { createPaymentService, getPaymentsByBillService } from "./payment.service";

export const createPaymentController = async (req: Request, res: Response) => {
  const payment = await createPaymentService(req.body, req.user!.id);
  res.status(201).json({ success: true, message: "Payment recorded", data: payment });
};

export const getPaymentsByBillController = async (req: Request, res: Response) => {
 // Line 10
const payments = await getPaymentsByBillService(req.params.billId as string);
  res.json({ success: true, data: payments });
};
