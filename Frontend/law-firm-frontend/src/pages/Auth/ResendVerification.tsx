// src/pages/Auth/ResendVerification.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { MailIcon, ArrowLeftIcon } from 'lucide-react';

interface ResendForm {
  email: string;
}

export const ResendVerification: React.FC = () => {
  const navigate = useNavigate();
  const { resendVerification } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ResendForm>();
  
  const onSubmit = async (data: ResendForm) => {
    setIsLoading(true);
    try {
      await resendVerification(data.email);
      toast.success('Verification email sent! Please check your inbox.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600">praava</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Resend Verification</h2>
          <p className="mt-2 text-gray-600">
            Enter your email address to receive a new verification link
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            icon={<MailIcon className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email', { 
              required: 'Email is required', 
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address'
              }
            })}
          />
          
          <Button type="submit" isLoading={isLoading} fullWidth>
            Send Verification Email
          </Button>
          
          <div className="text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1">
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};