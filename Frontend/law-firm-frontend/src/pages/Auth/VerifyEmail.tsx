// src/pages/Auth/VerifyEmail.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/UI/Button';
import { CheckCircleIcon, XCircleIcon, MailIcon } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, user } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isResending, setIsResending] = useState(false);
  
  const token = searchParams.get('token');
  
  useEffect(() => {
    if (token) {
      verifyEmail(token)
        .then(() => {
          setStatus('success');
          toast.success('Email verified successfully!');
        })
        .catch(() => {
          setStatus('error');
          toast.error('Invalid or expired verification link');
        });
    } else {
      setStatus('error');
    }
  }, [token, verifyEmail]);
  
  const handleResend = async () => {
    if (!user?.email) {
      navigate('/resend-verification');
      return;
    }
    
    setIsResending(true);
    try {
      await resendVerification(user.email);
      toast.success('Verification email sent!');
    } catch (error) {
      toast.error('Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Email Verified!</h1>
          <p className="text-gray-600">
            Your email has been successfully verified. You can now access all features.
          </p>
          <Button onClick={() => navigate('/dashboard')} fullWidth>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <XCircleIcon className="w-20 h-20 text-red-500 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-900">Verification Failed</h1>
        <p className="text-gray-600">
          The verification link is invalid or has expired.
        </p>
        <div className="space-y-4">
          <Button onClick={handleResend} isLoading={isResending} fullWidth>
            <MailIcon className="w-4 h-4 mr-2" />
            Resend Verification Email
          </Button>
          <Link to="/login" className="block text-primary-600 hover:text-primary-700">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};