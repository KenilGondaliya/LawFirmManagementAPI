// src/types/billing.types.ts
export interface Bill {
  id: number;
  uuid: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  currency: string;
  notes?: string;
  terms?: string;
  isRecurring: boolean;
  sentAt?: string;
  paidAt?: string;
  matterId?: number;
  matterTitle?: string;
  contactId?: number;
  clientName?: string;
  statusId?: number;
  statusName?: string;
  statusColor?: string;
  items: BillItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountPercentage: number;
  amount: number;
  totalAmount: number;
  itemOrder: number;
}

export interface Payment {
  id: number;
  uuid: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  receivedBy?: number;
  createdAt: string;
}

export interface BillStatus {
  id: number;
  name: string;
  color?: string;
  isDefault: boolean;
}

export interface CreateBillDto {
  matterId: number;
  contactId: number;
  statusId?: number;
  billDate: string;
  dueDate: string;
  taxAmount?: number;
  discountAmount?: number;
  currency?: string;
  notes?: string;
  terms?: string;
  isRecurring?: boolean;
  recurrencePattern?: any;
  items?: CreateBillItemDto[];
}

export interface CreateBillItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discountPercentage?: number;
  itemOrder?: number;
}

export interface AddPaymentDto {
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

export interface BillingDashboard {
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueBills: number;
  billsCount: {
    draft: number;
    sent: number;
    partialPaid: number;
    paid: number;
    overdue: number;
  };
}

export interface RevenueReport {
  period: string;
  year: number;
  month?: number;
  totalRevenue: number;
  billsCount: number;
  averageBillAmount: number;
}

export interface OutstandingReport {
  totalOutstanding: number;
  overdueAmount: number;
  bills: OutstandingBill[];
}

export interface OutstandingBill {
  id: number;
  billNumber: string;
  clientName?: string;
  matterTitle?: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
}