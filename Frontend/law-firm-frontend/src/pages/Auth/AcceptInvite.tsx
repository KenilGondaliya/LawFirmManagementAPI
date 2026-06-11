// src/pages/Auth/AcceptInvite.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

export const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { acceptInvite, isAuthenticated, user } = useAuthStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'form'>('loading');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const firmIdParam = searchParams.get('firmId');
    
    if (emailParam) {
      setEmail(emailParam);
      
      // If user is already logged in, try to accept automatically
      if (isAuthenticated && user) {
        handleAcceptInvite(emailParam, user.firstName || '', user.lastName || '');
      } else {
        setStatus('form');
      }
    } else {
      setStatus('error');
    }
  }, [searchParams, isAuthenticated, user]);

  const handleAcceptInvite = async (emailValue: string, firstNameValue: string, lastNameValue: string) => {
    setIsSubmitting(true);
    try {
      await acceptInvite(emailValue, firstNameValue, lastNameValue);
      setStatus('success');
      toast.success('Invitation accepted successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    handleAcceptInvite(email, firstName, lastName);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Accepted!</h2>
          <p className="text-gray-600 mb-4">
            You have successfully joined the firm. Redirecting to dashboard...
          </p>
          <div className="animate-pulse">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">
            The invitation link is invalid or has expired.
          </p>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600">praava</h1>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Accept Invitation</h2>
          <p className="mt-2 text-gray-600">
            You've been invited to join <span className="font-semibold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>

          <Input
            label="First Name"
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <Input
            label="Last Name"
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <Button type="submit" isLoading={isSubmitting} fullWidth>
            Accept Invitation
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Login here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};