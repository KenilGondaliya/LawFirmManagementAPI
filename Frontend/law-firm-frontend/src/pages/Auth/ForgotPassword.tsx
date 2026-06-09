// src/pages/Auth/ForgotPassword.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { MailIcon, ArrowLeftIcon, CheckCircleIcon } from 'lucide-react';

interface ForgotPasswordForm {
  email: string;
}

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();
  
  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Check Your Email</h1>
          <p className="text-gray-600">
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
          </p>
          <Button onClick={() => navigate('/login')} fullWidth>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600">praava</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
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
            Send Reset Link
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