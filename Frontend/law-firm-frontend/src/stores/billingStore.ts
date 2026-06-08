// src/stores/billingStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Bill, 
  BillStatus, 
  Payment, 
  BillingDashboard,
  RevenueReport,
  OutstandingReport,
  Invoice,
  CreateBillDto,
  AddPaymentDto
} from '../types/billing.types';
import { billingService } from '../services/billing.service';
import toast from 'react-hot-toast';

interface BillingState {
  // State
  bills: Bill[];
  selectedBill: Bill | null;
  statuses: BillStatus[];
  dashboard: BillingDashboard | null;
  revenueReport: RevenueReport | null;
  outstandingReport: OutstandingReport | null;
  invoices: Invoice[];
  isLoading: boolean;
  
  // Bill Actions
  fetchBills: (params?: { matterId?: number; contactId?: number; status?: string }) => Promise<void>;
  fetchBillById: (id: number) => Promise<void>;
  createBill: (data: CreateBillDto) => Promise<Bill | null>;
  updateBill: (id: number, data: any) => Promise<Bill | null>;
  deleteBill: (id: number) => Promise<boolean>;
  updateBillStatus: (id: number, statusId: number) => Promise<Bill | null>;
  downloadBillPdf: (id: number) => Promise<void>;
  sendBill: (id: number) => Promise<boolean>;
  
  // Bill Items
  addBillItem: (billId: number, data: any) => Promise<any>;
  removeBillItem: (itemId: number) => Promise<boolean>;
  
  // Payment Actions
  addPayment: (billId: number, data: AddPaymentDto) => Promise<Payment | null>;
  deletePayment: (paymentId: number) => Promise<boolean>;
  
  // Status Actions
  fetchStatuses: () => Promise<void>;
  
  // Dashboard & Reports
  fetchDashboard: () => Promise<void>;
  fetchRevenueReport: (period: 'monthly' | 'yearly', year: number, month?: number) => Promise<void>;
  fetchOutstandingReport: () => Promise<void>;
  
  // Invoice Actions
  fetchInvoices: () => Promise<void>;
  generateInvoice: (billId: number) => Promise<Invoice | null>;
  
  // Utility
  clearSelectedBill: () => void;
  resetState: () => void;
}

export const useBillingStore = create<BillingState>()(
  devtools((set, get) => ({
    // Initial State
    bills: [],
    selectedBill: null,
    statuses: [],
    dashboard: null,
    revenueReport: null,
    outstandingReport: null,
    invoices: [],
    isLoading: false,
    
    // ==================== Bill Actions ====================
    
    fetchBills: async (params) => {
      set({ isLoading: true });
      try {
        const bills = await billingService.getAllBills(params);
        set({ bills, isLoading: false });
      } catch (error) {
        console.error('Failed to fetch bills:', error);
        toast.error('Failed to load bills');
        set({ isLoading: false });
      }
    },
    
    fetchBillById: async (id) => {
      set({ isLoading: true });
      try {
        const bill = await billingService.getBillById(id);
        set({ selectedBill: bill, isLoading: false });
      } catch (error) {
        console.error('Failed to fetch bill:', error);
        toast.error('Failed to load bill details');
        set({ isLoading: false });
      }
    },
    
    createBill: async (data) => {
      set({ isLoading: true });
      try {
        const bill = await billingService.createBill(data);
        set((state) => ({ 
          bills: [bill, ...state.bills],
          isLoading: false 
        }));
        toast.success('Bill created successfully');
        return bill;
      } catch (error: any) {
        console.error('Failed to create bill:', error);
        toast.error(error.response?.data?.message || 'Failed to create bill');
        set({ isLoading: false });
        return null;
      }
    },
    
    updateBill: async (id, data) => {
      set({ isLoading: true });
      try {
        const bill = await billingService.updateBill(id, data);
        set((state) => ({
          bills: state.bills.map((b) => b.id === id ? bill : b),
          selectedBill: bill,
          isLoading: false
        }));
        toast.success('Bill updated successfully');
        return bill;
      } catch (error) {
        console.error('Failed to update bill:', error);
        toast.error('Failed to update bill');
        set({ isLoading: false });
        return null;
      }
    },
    
    deleteBill: async (id) => {
      set({ isLoading: true });
      try {
        await billingService.deleteBill(id);
        set((state) => ({
          bills: state.bills.filter((b) => b.id !== id),
          selectedBill: state.selectedBill?.id === id ? null : state.selectedBill,
          isLoading: false
        }));
        toast.success('Bill deleted successfully');
        return true;
      } catch (error) {
        console.error('Failed to delete bill:', error);
        toast.error('Failed to delete bill');
        set({ isLoading: false });
        return false;
      }
    },
    
    updateBillStatus: async (id, statusId) => {
      set({ isLoading: true });
      try {
        const bill = await billingService.updateBillStatus(id, statusId);
        set((state) => ({
          bills: state.bills.map((b) => b.id === id ? bill : b),
          selectedBill: bill,
          isLoading: false
        }));
        toast.success('Bill status updated');
        return bill;
      } catch (error) {
        console.error('Failed to update bill status:', error);
        toast.error('Failed to update bill status');
        set({ isLoading: false });
        return null;
      }
    },
    
    downloadBillPdf: async (id) => {
      try {
        const blob = await billingService.downloadBillPdf(id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bill-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Download started');
      } catch (error) {
        console.error('Failed to download bill:', error);
        toast.error('Failed to download bill');
      }
    },
    
    sendBill: async (id) => {
      set({ isLoading: true });
      try {
        await billingService.sendBill(id);
        toast.success('Bill sent successfully');
        set({ isLoading: false });
        return true;
      } catch (error) {
        console.error('Failed to send bill:', error);
        toast.error('Failed to send bill');
        set({ isLoading: false });
        return false;
      }
    },
    
    // ==================== Bill Items ====================
    
    addBillItem: async (billId, data) => {
      try {
        const item = await billingService.addBillItem(billId, data);
        await get().fetchBillById(billId);
        toast.success('Item added successfully');
        return item;
      } catch (error) {
        console.error('Failed to add item:', error);
        toast.error('Failed to add item');
        return null;
      }
    },
    
    removeBillItem: async (itemId) => {
      try {
        await billingService.removeBillItem(itemId);
        const { selectedBill } = get();
        if (selectedBill) {
          await get().fetchBillById(selectedBill.id);
        }
        toast.success('Item removed successfully');
        return true;
      } catch (error) {
        console.error('Failed to remove item:', error);
        toast.error('Failed to remove item');
        return false;
      }
    },
    
    // ==================== Payment Actions ====================
    
    addPayment: async (billId, data) => {
      set({ isLoading: true });
      try {
        const payment = await billingService.addPayment(billId, data);
        await get().fetchBillById(billId);
        toast.success('Payment added successfully');
        set({ isLoading: false });
        return payment;
      } catch (error) {
        console.error('Failed to add payment:', error);
        toast.error('Failed to add payment');
        set({ isLoading: false });
        return null;
      }
    },
    
    deletePayment: async (paymentId) => {
      try {
        await billingService.deletePayment(paymentId);
        const { selectedBill } = get();
        if (selectedBill) {
          await get().fetchBillById(selectedBill.id);
        }
        toast.success('Payment deleted successfully');
        return true;
      } catch (error) {
        console.error('Failed to delete payment:', error);
        toast.error('Failed to delete payment');
        return false;
      }
    },
    
    // ==================== Status Actions ====================
    
    fetchStatuses: async () => {
      try {
        const statuses = await billingService.getBillStatuses();
        set({ statuses });
      } catch (error) {
        console.error('Failed to fetch statuses:', error);
      }
    },
    
    // ==================== Dashboard & Reports ====================
    
    fetchDashboard: async () => {
      try {
        const dashboard = await billingService.getBillingDashboard();
        set({ dashboard });
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      }
    },
    
    fetchRevenueReport: async (period, year, month) => {
      try {
        const report = await billingService.getRevenueReport(period, year, month);
        set({ revenueReport: report });
      } catch (error) {
        console.error('Failed to fetch revenue report:', error);
      }
    },
    
    fetchOutstandingReport: async () => {
      try {
        const report = await billingService.getOutstandingReport();
        set({ outstandingReport: report });
      } catch (error) {
        console.error('Failed to fetch outstanding report:', error);
      }
    },
    
    // ==================== Invoice Actions ====================
    
    fetchInvoices: async () => {
      try {
        const invoices = await billingService.getInvoices();
        set({ invoices });
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      }
    },
    
    generateInvoice: async (billId) => {
      set({ isLoading: true });
      try {
        const invoice = await billingService.generateInvoice(billId);
        toast.success('Invoice generated successfully');
        set({ isLoading: false });
        return invoice;
      } catch (error) {
        console.error('Failed to generate invoice:', error);
        toast.error('Failed to generate invoice');
        set({ isLoading: false });
        return null;
      }
    },
    
    // ==================== Utility ====================
    
    clearSelectedBill: () => {
      set({ selectedBill: null });
    },
    
    resetState: () => {
      set({
        bills: [],
        selectedBill: null,
        statuses: [],
        dashboard: null,
        revenueReport: null,
        outstandingReport: null,
        invoices: [],
        isLoading: false,
      });
    },
  }))
);