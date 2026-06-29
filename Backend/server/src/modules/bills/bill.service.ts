import { createBillRepo, getBillsRepo, getBillsCountRepo, getBillByIdRepo, updateBillRepo, deleteBillRepo, getOverdueBillsRepo, markOverdueRepo } from "./bill.repository";
import { CreateBillDto, UpdateBillDto } from "./bill.types";

let billCounter = 1000;
const generateBillNumber = () => `BILL-${Date.now()}-${++billCounter}`;

export const createBillService = async (data: CreateBillDto) => {
  const billNumber = data.billNumber || generateBillNumber();
  return createBillRepo({ ...data, billNumber, pendingAmount: data.amount });
};

export const getBillsService = (page: number, limit: number, search: string, status?: string, shopId?: string) => {
  return Promise.all([
    getBillsRepo(page, limit, search, status, shopId),
    getBillsCountRepo(search, status, shopId),
  ]);
};

export const getBillByIdService = (id: string) => getBillByIdRepo(id);

export const updateBillService = (id: string, data: UpdateBillDto) => {
  const updateData: any = { ...data };
  if (data.billDate) updateData.billDate = new Date(data.billDate);
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
  if (data.reminderDate) updateData.reminderDate = new Date(data.reminderDate);
  return updateBillRepo(id, updateData);
};

export const deleteBillService = (id: string) => deleteBillRepo(id);
export const getOverdueBillsService = () => getOverdueBillsRepo();
export const markOverdueService = () => markOverdueRepo();
