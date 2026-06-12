// src/pages/Settings/BillingSettings.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCardIcon, 
  CalendarIcon, 
  RefreshCwIcon, 
  XCircleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  ZapIcon
} from 'lucide-react';
import { paymentService, SubscriptionStatus } from '../../services/payment.service';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

export const BillingSettings: React.FC = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await paymentService.getSubscriptionStatus();
      setSubscription(status);
    } catch (error) {
      console.error('Failed to load subscription:', error);
      toast.error('Failed to load subscription status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }
    
    setCancelling(true);
    try {
      await paymentService.cancelSubscription();
      toast.success('Subscription cancelled successfully');
      await loadSubscriptionStatus();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = () => {
    if (!subscription) return null;
    
    switch (subscription.status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
            <CheckCircleIcon className="w-3 h-3" />
            Active
          </span>
        );
      case 'TRIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
            <ClockIcon className="w-3 h-3" />
            Trial
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
            <XCircleIcon className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
            {subscription.status}
          </span>
        );
    }
  };

  const getDaysRemaining = () => {
    if (!subscription?.nextBillingDate) return null;
    const days = Math.ceil((new Date(subscription.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and billing information</p>
      </div>

      {/* Current Subscription Card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-primary-500" />
            Current Subscription
          </h2>
          {getStatusBadge()}
        </div>

        {subscription ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="font-medium text-gray-900 text-lg">{subscription.planName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Billing Cycle</p>
                <p className="font-medium text-gray-900 capitalize">{subscription.billingCycle.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Billing Date</p>
                <p className="font-medium text-gray-900">
                  {subscription.nextBillingDate 
                    ? new Date(subscription.nextBillingDate).toLocaleDateString()
                    : 'N/A'}
                </p>
                {daysRemaining && daysRemaining > 0 && daysRemaining <= 7 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Renews in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Auto-renewal</p>
                <p className="font-medium text-gray-900">
                  {subscription.autoRenew ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      Enabled
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <XCircleIcon className="w-4 h-4" />
                      Disabled
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Features Section */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ZapIcon className="w-4 h-4 text-primary-500" />
                Included Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subscription.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {subscription.status === 'ACTIVE' && subscription.autoRenew && (
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="danger"
                  onClick={handleCancelSubscription}
                  isLoading={cancelling}
                >
                  Cancel Subscription
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Your subscription will remain active until {new Date(subscription.nextBillingDate || '').toLocaleDateString()}. 
                  You will not be charged again.
                </p>
              </div>
            )}

            {subscription.status === 'TRIAL' && (
              <div className="pt-4 border-t border-gray-200">
                <Button onClick={() => navigate('/pricing')}>
                  Upgrade Plan
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Your trial ends on {new Date(subscription.endDate || '').toLocaleDateString()}
                </p>
              </div>
            )}

            {subscription.status === 'CANCELLED' && (
              <div className="pt-4 border-t border-gray-200">
                <Button onClick={() => navigate('/pricing')}>
                  Reactivate Subscription
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No active subscription found</p>
            <Button onClick={() => navigate('/pricing')}>
              View Plans
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </Card>

      {/* Payment Methods Card */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCardIcon className="w-5 h-5 text-primary-500" />
          Payment Methods
        </h2>
        <div className="text-center py-8">
          <CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No saved payment methods</p>
          <Button variant="outline" className="mt-4">
            Add Payment Method
          </Button>
        </div>
      </Card>

      {/* Payment History Card */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary-500" />
          Payment History
        </h2>
        <div className="text-center py-8">
          <RefreshCwIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No payment history available</p>
        </div>
      </Card>
    </div>
  );
};