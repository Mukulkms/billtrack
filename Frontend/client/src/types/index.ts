export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF'
export type BillStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
export type PaymentMode = 'CASH' | 'UPI' | 'BANK' | 'CHEQUE'
export interface User { id: string; name: string; email: string; phone?: string; role: UserRole; isActive: boolean; createdAt: string; }
export interface Shop { id: string; shopName: string; ownerName: string; phone: string; whatsapp?: string; email?: string; gstNumber?: string; address: string; city?: string; state?: string; pincode?: string; openingBalance: number; creditLimit: number; paymentTerm: number; isActive: boolean; notes?: string; createdAt: string; bills?: Bill[]; }
export interface Bill { id: string; shopId: string; billNumber: string; invoiceNumber?: string; amount: number; description?: string; paidAmount: number; pendingAmount: number; billDate: string; dueDate: string; reminderDate?: string; status: BillStatus; attachment?: string; remarks?: string; categoryId?: string; category?: { id: string; name: string; }; createdAt: string; shop?: { shopName: string; ownerName: string; phone: string; whatsapp?: string; }; payments?: Payment[]; }
export interface Payment { id: string; billId: string; amount: number; mode: PaymentMode; transactionId?: string; note?: string; receivedById: string; receivedAt: string; receivedBy?: { name: string; }; }
export interface Category { id: string; name: string; }
export interface DashboardStats {
  totalShops: number;
  totalBills: number;
  overdueCount: number;
  pendingCount: number;
  paidCount: number;
  totalOutstanding: number;
  totalCollected: number; 
  collectedThisMonth: number;
  weeklyDue: Bill[];
  recentBills: Bill[];
  categoryTotals: { categoryId: string; categoryName: string; totalAmount: number; pendingAmount: number; billCount: number }[];
}
