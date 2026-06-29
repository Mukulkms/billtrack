import { createPaymentRepo, getPaymentsByBillRepo } from "./payment.repository";
import { CreatePaymentDto } from "./payment.types";

export const createPaymentService = (data: CreatePaymentDto, userId: string) => createPaymentRepo(data, userId);
export const getPaymentsByBillService = (billId: string) => getPaymentsByBillRepo(billId);
