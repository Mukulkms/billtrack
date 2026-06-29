export interface CreateShopDto {
  shopName: string;
  ownerName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  gstNumber?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  openingBalance?: number;
  creditLimit?: number;
  paymentTerm?: number;
  notes?: string;
}