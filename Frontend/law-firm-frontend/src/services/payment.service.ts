// src/services/payment.service.ts
import api from "./api";
import axios from "axios";

export interface SubscriptionPlan {
  id: number;
  name: string;
  code: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  maxUsers?: number;
  maxMatters?: number;
  maxContacts?: number;
  maxStorageMb?: number;
  features: string[];
  isPopular: boolean;
}

export interface SubscriptionStatus {
  planName: string;
  planCode: string;
  status: string;
  billingCycle: string;
  startDate: string;
  nextBillingDate?: string;
  endDate?: string;
  autoRenew: boolean;
  features: string[];
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  keyId: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const paymentService = {
  // Get all subscription plans
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await api.get("/subscription-plans");
    return response.data;
  },

  // Get current firm's subscription status
  getSubscriptionStatus: async (): Promise<SubscriptionStatus> => {
    const response = await api.get("/payment/subscription-status");
    return response.data;
  },

  // Create Razorpay order
  createOrder: async (
    planId: number,
    billingCycle: string,
  ): Promise<CreateOrderResponse> => {
    const response = await api.post("/payment/create-order", {
      planId,
      billingCycle,
    });
    return response.data;
  },

  // Verify payment after successful transaction
  verifyPayment: async (
    firmId: number,
    planId: number,
    billingCycle: string,
    orderId: string,
    paymentId: string,
    signature: string,
  ): Promise<void> => {
    console.log("Verifying payment:", {
      firmId,
      planId,
      billingCycle,
      orderId,
      paymentId,
      signature,
    });
    const response = await api.post("/payment/verify-payment", {
      firmId,
      planId,
      billingCycle,
      orderId,
      paymentId,
      signature,
    });
    return response.data;
  },

  // Cancel current subscription
  cancelSubscription: async (): Promise<void> => {
    await api.post("/payment/cancel-subscription");
  },

  // Initialize Razorpay checkout
  initRazorpayCheckout: (
    order: CreateOrderResponse,
    plan: SubscriptionPlan,
    billingCycle: string,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) => {
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        openRazorpay(order, plan, billingCycle, onSuccess, onError);
      };
      document.body.appendChild(script);
    } else {
      openRazorpay(order, plan, billingCycle, onSuccess, onError);
    }
  },
};

function openRazorpay(
  order: CreateOrderResponse,
  plan: SubscriptionPlan,
  billingCycle: string,
  onSuccess: () => void,
  onError: (error: any) => void,
) {
  const options = {
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    name: "Praava",
    description: `${plan.name} Plan - ${billingCycle === "YEARLY" ? "Yearly" : "Monthly"} Subscription`,
    order_id: order.orderId,
    handler: async (response: any) => {
      try {
        // Get firmId from localStorage or store
        const firmId = localStorage.getItem("firmId") || "";
        await paymentService.verifyPayment(
          parseInt(firmId),
          plan.id,
          billingCycle,
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature,
        );
        onSuccess();
      } catch (error) {
        onError(error);
      }
    },
    prefill: {
      name: localStorage.getItem("userName") || "",
      email: localStorage.getItem("userEmail") || "",
    },
    theme: {
      color: "#4F46E5",
    },
    modal: {
      ondismiss: () => {
        onError(new Error("Payment cancelled"));
      },
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
}
