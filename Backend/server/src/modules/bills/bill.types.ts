export interface CreateBillDto {
  shopId: string;
  billNumber?: string;
  invoiceNumber?: string;
  amount: number;
  billDate: string;
  dueDate: string;
  reminderDate?: string;
  remarks?: string;
  attachment?: string;
  categoryId?: string;
}

export interface UpdateBillDto {
  invoiceNumber?: string;
  amount?: number;
  billDate?: string;
  dueDate?: string;
  reminderDate?: string;
  remarks?: string;
  status?: string;
  categoryId?: string;
}
