import { Request, Response } from "express";
import { getPaymentHistoryService, deletePaymentHistoryService } from "./payment-history.service";
import { success, failure } from "../../utils/response";

export const getPaymentHistoryController = async (req: Request, res: Response) => {
  const data = await getPaymentHistoryService();
  res.json({ success: true, data });
};

// DELETE /api/payment-history  body: { ids: string[] }
// Checkbox se select ki hui (ya "select all" se saari) entries delete karta hai.
export const deletePaymentHistoryController = async (req: Request, res: Response) => {
  const { ids } = req.body as { ids?: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return failure(res, "ids array required", 400);
  }
  const result = await deletePaymentHistoryService(ids);
  return success(res, { deletedCount: result.count }, "Payment history deleted");
};
