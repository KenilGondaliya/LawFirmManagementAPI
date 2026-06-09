// src/pages/Auth/ResetPassword.tsx

import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { LockIcon, ArrowLeftIcon, CheckCircleIcon } from 'lucide-react';

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordForm>();
  const newPassword = watch('newPassword');
  
  // If no token or email, redirect to forgot password
  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h1 className="text-4xl font-bold text-primary-600">praava</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Invalid Reset Link</h2>
          <p className="text-gray-600">The password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }
  
  const onSubmit = async (data: ResetPasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.resetPassword(token, email, data.newPassword);
      setIsSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Password Reset!</h1>
          <p className="text-gray-600">
            Your password has been successfully reset. You will be redirected to login.
          </p>
          <Button onClick={() => navigate('/login')} fullWidth>
            Go to Login
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
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-gray-600">
            Enter your new password for {email}
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            icon={<LockIcon className="w-4 h-4" />}
            error={errors.newPassword?.message}
            {...register('newPassword', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
          />
          
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            icon={<LockIcon className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === newPassword || 'Passwords do not match',
            })}
          />
          
          <Button type="submit" isLoading={isLoading} fullWidth>
            Reset Password
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

export default ResetPassword;