// src/pages/Auth/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { MailIcon, LockIcon, UserIcon, PhoneIcon, HomeIcon } from 'lucide-react';

interface RegisterForm {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
}

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const password = watch('password');
  
  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Registration successful! Please create your firm.');
      navigate('/create-firm');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600">praava</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Sign Up</h2>
          <p className="mt-2 text-gray-600">Enter your details to register and start to discover!</p>
        </div>
        
        <div className="mt-8 space-y-6">
          <button className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <HomeIcon className="w-5 h-5" />
            Sign up with Google
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
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon={<MailIcon className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email', { required: 'Email is required', pattern: /^\S+@\S+$/i })}
            />
            
            <Input
              label="Username"
              type="text"
              placeholder="Choose a username"
              icon={<UserIcon className="w-4 h-4" />}
              error={errors.username?.message}
              {...register('username', { required: 'Username is required' })}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="First name"
                error={errors.firstName?.message}
                {...register('firstName', { required: 'First name is required' })}
              />
              <Input
                label="Last Name"
                placeholder="Last name"
                error={errors.lastName?.message}
                {...register('lastName', { required: 'Last name is required' })}
              />
            </div>
            
            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="Enter your phone number"
              icon={<PhoneIcon className="w-4 h-4" />}
              {...register('phoneNumber')}
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              icon={<LockIcon className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password', { required: 'Password is required', minLength: 6 })}
            />
            
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              icon={<LockIcon className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            
            <Button type="submit" isLoading={isLoading} fullWidth>
              Sign Up
            </Button>
          </form>
          
          <p className="text-center text-sm text-gray-600">
            By clicking Register, you agree to accept{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-700">
              Praava Terms and Conditions
            </Link>
          </p>
          
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};