// src/pages/Pricing/PricingPlans.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, StarIcon, CreditCardIcon, ShieldCheckIcon, UsersIcon, DatabaseIcon, ClockIcon } from 'lucide-react';
import { paymentService, SubscriptionPlan } from '../../services/payment.service';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export const PricingPlans: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const plansData = await paymentService.getPlans();
      setPlans(plansData);
    } catch (error) {
      console.error('Failed to load plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      toast.error('Please login first to subscribe');
      navigate('/login');
      return;
    }

    setProcessingPlan(plan.id);
    try {
      const order = await paymentService.createOrder(plan.id, billingCycle);
      
      paymentService.initRazorpayCheckout(
        order,
        plan,
        billingCycle,
        () => {
          toast.success('Subscription activated successfully!');
          navigate('/settings/billing');
        },
        (error) => {
          console.error('Payment failed:', error);
          toast.error(error.message || 'Payment failed. Please try again.');
        }
      );
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setProcessingPlan(null);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'YEARLY' ? plan.priceYearly : plan.priceMonthly;
  };

  const getPriceLabel = () => {
    return billingCycle === 'YEARLY' ? '/year' : '/month';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your law firm. All plans include core features.
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-4 p-1 bg-gray-100 rounded-full">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'YEARLY'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Yearly <span className="text-green-600 text-xs">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative p-6 transition-all hover:shadow-xl ${
                plan.isPopular ? 'border-2 border-primary-500 shadow-lg transform scale-105' : ''
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <StarIcon className="w-4 h-4 fill-current" />
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-gray-500 mt-2 text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900">
                  ${getPrice(plan)}
                  <span className="text-lg font-normal text-gray-500">{getPriceLabel()}</span>
                </div>
                {billingCycle === 'YEARLY' && plan.priceMonthly > 0 && (
                  <div className="text-sm text-green-600 mt-1">
                    Save ${(plan.priceMonthly * 12 - plan.priceYearly).toFixed(2)}/year
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6">
                {plan.maxUsers && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <UsersIcon className="w-4 h-4" />
                    <span>Up to {plan.maxUsers} users</span>
                  </div>
                )}
                {plan.maxStorageMb && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <DatabaseIcon className="w-4 h-4" />
                    <span>{plan.maxStorageMb / 1024} GB storage</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleSubscribe(plan)}
                isLoading={processingPlan === plan.id}
                fullWidth
                variant={plan.isPopular ? 'primary' : 'outline'}
                className="mt-4"
              >
                {processingPlan === plan.id ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCardIcon className="w-4 h-4 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <div className="flex justify-center gap-8 mb-8">
            <ShieldCheckIcon className="w-8 h-8 text-gray-400" />
            <ShieldCheckIcon className="w-8 h-8 text-gray-400" />
            <ShieldCheckIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">
            Secure payments powered by Razorpay • Cancel anytime • 14-day trial on Basic plan
          </p>
        </div>
      </div>
    </div>
  );
};