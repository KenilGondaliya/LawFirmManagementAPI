// src/pages/Settings/BillingSettings.tsx - Fixed version

import React, { useEffect, useState } from 'react';
import { settingsService, CurrentPlan, Plan } from '../../services/settings.service';
import { usePermissions } from '../../hooks/usePermissions';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Modal } from '../../components/UI/Modal';
import { CreditCardIcon, CalendarIcon, CheckCircleIcon, XCircleIcon, ZapIcon, AlertCircleIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const BillingSettings: React.FC = () => {
  const { isAdmin } = usePermissions();
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isChanging, setIsChanging] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [plan, plans] = await Promise.all([
        settingsService.getCurrentPlan(),
        settingsService.getAvailablePlans(),
      ]);
      setCurrentPlan(plan);
      setAvailablePlans(plans || []);
    } catch (error) {
      console.error('Failed to load billing information:', error);
      toast.error('Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) return;
    setIsChanging(true);
    try {
      const updated = await settingsService.changePlan(selectedPlan.code, selectedBillingCycle);
      setCurrentPlan(updated);
      toast.success(`Plan changed to ${selectedPlan.name} successfully`);
      setShowChangePlanModal(false);
    } catch (error) {
      console.error('Failed to change plan:', error);
      toast.error('Failed to change plan');
    } finally {
      setIsChanging(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return;
    }
    setIsCancelling(true);
    try {
      const updated = await settingsService.cancelSubscription();
      setCurrentPlan(updated);
      toast.success('Subscription cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = () => {
    if (!currentPlan) return null;
    switch (currentPlan.status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Active</span>;
      case 'TRIAL':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">Trial</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{currentPlan.status}</span>;
    }
  };

  // Get features safely - handles both 'features' and 'featuresList'
  const getFeatures = (plan: CurrentPlan | Plan) => {
    if (plan.featuresList && Array.isArray(plan.featuresList)) {
      return plan.featuresList;
    }
    if ('features' in plan && plan.features && Array.isArray(plan.features)) {
      return plan.features;
    }
    return [];
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ZapIcon className="w-5 h-5 text-primary-500" />
            Current Plan
          </h2>
          {getStatusBadge()}
        </div>

        {currentPlan ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="font-semibold text-gray-900 text-lg">{currentPlan.planName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Billing Cycle</p>
                <p className="text-gray-900 capitalize">{currentPlan.billingCycle?.toLowerCase() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="text-gray-900">
                  {currentPlan.startDate ? new Date(currentPlan.startDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Billing Date</p>
                <p className="text-gray-900">
                  {currentPlan.nextBillingDate ? new Date(currentPlan.nextBillingDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Auto-renewal</p>
                <p className="flex items-center gap-1">
                  {currentPlan.autoRenew ? (
                    <span className="text-green-600 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4" /> Enabled</span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1"><XCircleIcon className="w-4 h-4" /> Disabled</span>
                  )}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-2">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {getFeatures(currentPlan).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {isAdmin() && (
              <div className="pt-4 border-t border-gray-200 flex gap-3">
                <Button variant="outline" onClick={() => setShowChangePlanModal(true)}>
                  Change Plan
                </Button>
                {currentPlan.status === 'ACTIVE' && currentPlan.autoRenew && (
                  <Button variant="danger" onClick={handleCancelSubscription} isLoading={isCancelling}>
                    Cancel Subscription
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No subscription information available</p>
          </div>
        )}
      </Card>

      {/* Change Plan Modal */}
      <Modal isOpen={showChangePlanModal} onClose={() => setShowChangePlanModal(false)} title="Change Plan">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select Plan</label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availablePlans && availablePlans.length > 0 ? (
                availablePlans.map((plan) => (
                  <label
                    key={plan.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlan?.id === plan.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={selectedPlan?.id === plan.id}
                      onChange={() => setSelectedPlan(plan)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{plan.name}</span>
                        {plan.isPopular && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">Popular</span>}
                      </div>
                      <p className="text-sm text-gray-500">{plan.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getFeatures(plan).slice(0, 2).map((feature, idx) => (
                          <span key={idx} className="text-xs text-gray-400">• {feature.substring(0, 30)}</span>
                        ))}
                        {getFeatures(plan).length > 2 && (
                          <span className="text-xs text-gray-400">+{getFeatures(plan).length - 2} more</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${selectedBillingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                        <span className="text-sm font-normal text-gray-500">
                          /{selectedBillingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No plans available</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Billing Cycle</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedBillingCycle('monthly')}
                className={`flex-1 py-2 px-4 border rounded-lg text-center transition-colors ${
                  selectedBillingCycle === 'monthly'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setSelectedBillingCycle('yearly')}
                className={`flex-1 py-2 px-4 border rounded-lg text-center transition-colors ${
                  selectedBillingCycle === 'yearly'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Yearly <span className="text-xs text-green-600">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowChangePlanModal(false)}>Cancel</Button>
            <Button onClick={handleChangePlan} isLoading={isChanging} disabled={!selectedPlan}>
              Confirm Change
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};