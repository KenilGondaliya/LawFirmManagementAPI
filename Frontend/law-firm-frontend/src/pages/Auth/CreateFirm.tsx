// src/pages/Auth/CreateFirm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { BuildingIcon, MailIcon, PhoneIcon, MapPinIcon, GlobeIcon } from 'lucide-react';

interface CreateFirmForm {
  firmName: string;
  legalName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  planCode: string;
  billingCycle: string;
}

export const CreateFirm: React.FC = () => {
  const navigate = useNavigate();
  const { createFirm } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreateFirmForm>({
    defaultValues: {
      planCode: 'basic',
      billingCycle: 'monthly',
    },
  });
  
  const onSubmit = async (data: CreateFirmForm) => {
    setIsLoading(true);
    try {
      await createFirm(data);
      toast.success('Firm created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create firm');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600">praava</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create Your Firm</h2>
          <p className="mt-2 text-gray-600">Enter your firm details to get started</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-xl shadow-sm p-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Firm Information</h3>
            
            <Input
              label="Firm Name *"
              placeholder="Enter your firm name"
              icon={<BuildingIcon className="w-4 h-4" />}
              error={errors.firmName?.message}
              {...register('firmName', { required: 'Firm name is required' })}
            />
            
            <Input
              label="Legal Name"
              placeholder="Legal entity name"
              {...register('legalName')}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Registration Number"
                placeholder="Registration number"
                {...register('registrationNumber')}
              />
              <Input
                label="Tax Number"
                placeholder="Tax/VAT number"
                {...register('taxNumber')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="firm@example.com"
                icon={<MailIcon className="w-4 h-4" />}
                {...register('email')}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="Phone number"
                icon={<PhoneIcon className="w-4 h-4" />}
                {...register('phone')}
              />
            </div>
            
            <Input
              label="Website"
              type="url"
              placeholder="https://example.com"
              icon={<GlobeIcon className="w-4 h-4" />}
              {...register('website')}
            />
            
            <h3 className="text-lg font-semibold text-gray-800 pt-4">Address</h3>
            
            <Input
              label="Address Line 1"
              placeholder="Street address"
              icon={<MapPinIcon className="w-4 h-4" />}
              {...register('addressLine1')}
            />
            
            <Input
              label="Address Line 2"
              placeholder="Apartment, suite, etc."
              {...register('addressLine2')}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" placeholder="City" {...register('city')} />
              <Input label="State" placeholder="State" {...register('state')} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input label="Postal Code" placeholder="Postal code" {...register('postalCode')} />
              <Input label="Country" placeholder="Country" {...register('country')} />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 pt-4">Subscription Plan</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="basic"
                  {...register('planCode')}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <p className="font-medium">Basic - Free</p>
                  <p className="text-sm text-gray-500">Up to 5 users, 1GB storage</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="pro"
                  {...register('planCode')}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <p className="font-medium">Pro - $49/month</p>
                  <p className="text-sm text-gray-500">Unlimited users, 10GB storage, Advanced features</p>
                </div>
              </label>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  value="monthly"
                  {...register('billingCycle')}
                  className="w-4 h-4 text-primary-600"
                />
                <span>Monthly billing</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  value="yearly"
                  {...register('billingCycle')}
                  className="w-4 h-4 text-primary-600"
                />
                <span>Yearly billing (Save 20%)</span>
              </label>
            </div>
          </div>
          
          <Button type="submit" isLoading={isLoading} fullWidth>
            Create Firm & Continue
          </Button>
        </form>
      </div>
    </div>
  );
};