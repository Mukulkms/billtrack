export interface CreatePaymentDto {
  billId: string;
  amount: number;
  mode: "CASH" | "UPI" | "BANK" | "CHEQUE";
  transactionId?: string;
  note?: string;
  receivedAt?: string;
}
