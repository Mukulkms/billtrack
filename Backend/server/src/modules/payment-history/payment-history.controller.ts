import { Request, Response } from "express";
import { getPaymentHistoryService } from "./payment-history.service";

export const getPaymentHistoryController = async (req: Request, res: Response) => {
  const data = await getPaymentHistoryService();
  res.json({ success: true, data });
};
