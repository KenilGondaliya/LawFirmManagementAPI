// src/services/billing.service.ts
import api from './api';
import { 
  Bill, 
  BillStatus, 
  Payment, 
  BillingDashboard,
  RevenueReport,
  OutstandingReport,
  Invoice,
  CreateBillDto,
  AddPaymentDto,
  CreateBillItemDto
} from '../types/billing.types';
import { BillItem } from '../types';

export const billingService = {
  // ==================== Basic Bill Operations ====================
  
  getAllBills: async (params?: {
    matterId?: number;
    contactId?: number;
    status?: string;
  }): Promise<Bill[]> => {
    const response = await api.get('/billing/bills', { params });
    return response.data;
  },
  
  getBillById: async (id: number): Promise<Bill> => {
    const response = await api.get(`/billing/bills/${id}`);
    return response.data;
  },
  
  createBill: async (data: CreateBillDto): Promise<Bill> => {
    const response = await api.post('/billing/bills', data);
    return response.data;
  },
  
  updateBill: async (id: number, data: {
    dueDate?: string;
    taxAmount?: number;
    discountAmount?: number;
    notes?: string;
    terms?: string;
  }): Promise<Bill> => {
    const response = await api.put(`/billing/bills/${id}`, data);
    return response.data;
  },
  
  deleteBill: async (id: number): Promise<void> => {
    await api.delete(`/billing/bills/${id}`);
  },
  
  updateBillStatus: async (id: number, statusId: number): Promise<Bill> => {
    const response = await api.patch(`/billing/bills/${id}/status?statusId=${statusId}`);
    return response.data;
  },
  
  downloadBillPdf: async (id: number): Promise<Blob> => {
    const response = await api.get(`/billing/bills/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  sendBill: async (id: number): Promise<void> => {
    await api.post(`/billing/bills/${id}/send`);
  },
  
  // ==================== Bill Items ====================
  
  getBillItems: async (billId: number): Promise<BillItem[]> => {
    const response = await api.get(`/billing/bills/${billId}/items`);
    return response.data;
  },
  
  addBillItem: async (billId: number, data: CreateBillItemDto): Promise<BillItem> => {
    const response = await api.post(`/billing/bills/${billId}/items`, data);
    return response.data;
  },
  
  removeBillItem: async (itemId: number): Promise<void> => {
    await api.delete(`/billing/bills/items/${itemId}`);
  },
  
  // ==================== Payments ====================
  
  getPayments: async (billId: number): Promise<Payment[]> => {
    const response = await api.get(`/billing/bills/${billId}/payments`);
    return response.data;
  },
  
  addPayment: async (billId: number, data: AddPaymentDto): Promise<Payment> => {
    const response = await api.post(`/billing/bills/${billId}/payments`, data);
    return response.data;
  },
  
  deletePayment: async (paymentId: number): Promise<void> => {
    await api.delete(`/billing/payments/${paymentId}`);
  },
  
  // ==================== Bill Statuses ====================
  
  getBillStatuses: async (): Promise<BillStatus[]> => {
    const response = await api.get('/billing/statuses');
    return response.data;
  },
  
  // ==================== Dashboard & Reports ====================
  
  getBillingDashboard: async (): Promise<BillingDashboard> => {
    const response = await api.get('/billing/dashboard');
    return response.data;
  },
  
  getRevenueReport: async (period: 'monthly' | 'yearly', year: number, month?: number): Promise<RevenueReport> => {
    const params: any = { period, year };
    if (month) params.month = month;
    const response = await api.get('/billing/revenue', { params });
    return response.data;
  },
  
  getOutstandingReport: async (): Promise<OutstandingReport> => {
    const response = await api.get('/billing/outstanding');
    return response.data;
  },
  
  getStatistics: async (): Promise<BillingDashboard> => {
    const response = await api.get('/billing/statistics');
    return response.data;
  },
  
  getMonthlyReport: async (year: number, month: number): Promise<RevenueReport> => {
    const response = await api.get(`/billing/reports/monthly?year=${year}&month=${month}`);
    return response.data;
  },
  
  getYearlyReport: async (year: number): Promise<RevenueReport> => {
    const response = await api.get(`/billing/reports/yearly?year=${year}`);
    return response.data;
  },
  
  // ==================== Invoices ====================
  
  getInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get('/billing/invoices');
    return response.data;
  },
  
  generateInvoice: async (billId: number): Promise<Invoice> => {
    const response = await api.post(`/billing/invoices/generate?billId=${billId}`);
    return response.data;
  },
  
  downloadInvoice: async (id: number): Promise<Blob> => {
    const response = await api.get(`/billing/invoices/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};