import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Building, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

const CreateFirm = () => {
  const navigate = useNavigate();
  const { createFirm, isLoading } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const plans = [
    { code: 'basic', name: 'Basic', price: '$0', features: ['5 Users', '1GB Storage', 'Basic Support'], trial: '14-day trial' },
    { code: 'pro', name: 'Pro', price: '$49', features: ['20 Users', '10GB Storage', 'Priority Support', 'Advanced Analytics'], billing: '/month' },
    { code: 'enterprise', name: 'Enterprise', price: '$99', features: ['Unlimited Users', '100GB Storage', '24/7 Support', 'Custom Features'], billing: '/month' },
  ];

  const onSubmit = async (data) => {
    const firmData = {
      ...data,
      planCode: selectedPlan,
      billingCycle: data.billingCycle || 'monthly',
    };
    const result = await createFirm(firmData);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Create Your Law Firm</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your firm details to get started with Praava</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Firm Details Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firm Name *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      {...register('firmName', { required: 'Firm name is required' })}
                      type="text"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your firm name"
                    />
                  </div>
                  {errors.firmName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firmName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Legal Name
                  </label>
                  <input
                    {...register('legalName')}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Legal name (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="firm@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      {...register('phone')}
                      type="tel"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea
                      {...register('addressLine1')}
                      rows="2"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Firm address"
                    ></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register('city')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <input
                      {...register('state')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register('postalCode')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Postal Code"
                    />
                  </div>
                  <div>
                    <input
                      {...register('country')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Plans Section */}
            <div className="bg-gray-50 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a Plan</h3>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.code}
                    onClick={() => setSelectedPlan(plan.code)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPlan === plan.code
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                        <p className="text-2xl font-bold text-primary-600">{plan.price}</p>
                        {plan.billing && <p className="text-xs text-gray-500">{plan.billing}</p>}
                        {plan.trial && <p className="text-xs text-primary-600 mt-1">{plan.trial}</p>}
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                        {selectedPlan === plan.code && (
                          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                        )}
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-600">✓ {feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {selectedPlan !== 'basic' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Cycle
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="monthly"
                        {...register('billingCycle')}
                        defaultChecked
                        className="mr-2"
                      />
                      Monthly
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="yearly"
                        {...register('billingCycle')}
                        className="mr-2"
                      />
                      Yearly (Save 20%)
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit(onSubmit)}
                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner /> : 'Create Firm & Continue →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFirm;