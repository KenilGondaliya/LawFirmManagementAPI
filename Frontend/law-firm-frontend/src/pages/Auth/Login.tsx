// src/pages/Auth/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { MailIcon, LockIcon, HomeIcon } from 'lucide-react';

interface LoginForm {
  emailOrUsername: string;
  password: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, firms, requiresFirmSelection } = useAuthStore();
  const [selectedFirm, setSelectedFirm] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  
  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.emailOrUsername, data.password, selectedFirm);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600">praava</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Sign In</h2>
          <p className="mt-2 text-gray-600">Enter your details to login and manage your firm</p>
        </div>
        
        <div className="mt-8 space-y-6">
          {/* Google Sign In */}
          <button className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <HomeIcon className="w-5 h-5" />
            Sign in with Google
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email or Username"
              type="text"
              placeholder="Enter your email or username"
              icon={<MailIcon className="w-4 h-4" />}
              error={errors.emailOrUsername?.message}
              {...register('emailOrUsername', { required: 'Email or username is required' })}
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<LockIcon className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />
            
            {requiresFirmSelection && firms.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Firm
                </label>
                <select
                  value={selectedFirm}
                  onChange={(e) => setSelectedFirm(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a firm</option>
                  {firms.map((firm) => (
                    <option key={firm.id} value={firm.id}>
                      {firm.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-primary-600 rounded border-gray-300" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>
            
            <Button type="submit" isLoading={isLoading} fullWidth>
              Sign In
            </Button>
          </form>
          
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};