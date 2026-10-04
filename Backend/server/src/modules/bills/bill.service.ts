import { createBillRepo, getBillsRepo, getBillsCountRepo, getBillByIdRepo, updateBillRepo, deleteBillRepo, getOverdueBillsRepo, markOverdueRepo } from "./bill.repository";
import { CreateBillDto, UpdateBillDto } from "./bill.types";
import prisma from "../../config/prisma";
import { deleteBillImage, isValidBillImageKey } from "../../config/b2";

let billCounter = 1000;
const generateBillNumber = () => `BILL-${Date.now()}-${++billCounter}`;

export const createBillService = async (data: CreateBillDto) => {
  const billNumber = data.billNumber || generateBillNumber();
  const attachment = isValidBillImageKey(data.attachment) ? data.attachment : undefined;
  return createBillRepo({ ...data, attachment, billNumber, pendingAmount: data.amount });
};

export const getBillsService = (page: number, limit: number, search: string, status?: string, shopId?: string) => {
  return Promise.all([
    getBillsRepo(page, limit, search, status, shopId),
    getBillsCountRepo(search, status, shopId),
  ]);
};

export const getBillByIdService = (id: string) => getBillByIdRepo(id);

export const updateBillService = async (id: string, data: UpdateBillDto) => {
  const updateData: any = { ...data };
  let oldAttachment: string | null | undefined;

  // attachment: valid key => replace, null => remove, baaki => ignore
  if ("attachment" in data) {
    if (data.attachment === null || isValidBillImageKey(data.attachment)) {
      const existing = await prisma.bill.findUnique({ where: { id }, select: { attachment: true } });
      oldAttachment = existing?.attachment;
    } else {
      delete updateData.attachment;
    }
  }
  if (data.billDate) updateData.billDate = new Date(data.billDate);
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
  if (data.reminderDate) updateData.reminderDate = new Date(data.reminderDate);
  const updated = await updateBillRepo(id, updateData);

  // Naya image save hone ke baad purana B2 se hata do
  if (oldAttachment && oldAttachment !== updateData.attachment) {
    await deleteBillImage(oldAttachment);
  }
  return updated;
};

export const deleteBillService = async (id: string) => {
  const existing = await prisma.bill.findUnique({ where: { id }, select: { attachment: true } });
  const result = await deleteBillRepo(id);
  // Bill delete ho gaya — ab uski image bhi B2 se hata do
  await deleteBillImage(existing?.attachment);
  return result;
};
export const getOverdueBillsService = () => getOverdueBillsRepo();
export const markOverdueService = () => markOverdueRepo();
