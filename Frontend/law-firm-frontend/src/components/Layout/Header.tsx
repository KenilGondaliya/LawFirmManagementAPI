import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { FirmSwitcher } from './FirmSwitcher';
import { 
  UserCircleIcon, 
  BellIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  UsersIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';

interface HeaderProps {
  title?: string;
}

const getAbsoluteImageUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('/')) {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5165';
    return `${baseUrl}${url}`;
  }
  
  return url;
};

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // console.log('Header rendered with user:', user);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

   useEffect(() => {
        if (user) {        
          const absoluteUrl = getAbsoluteImageUrl(user.profileImageUrl);
          setAvatarUrl(absoluteUrl);
        }
      }, [user]);    

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Page Title */}
        <div className="flex items-center gap-4">
          {title && (
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          )}
          <FirmSwitcher />
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side icons and user menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 relative">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
            )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </Menu.Button>

            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Menu.Items className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none z-50">
                <div className="p-1">
                  {/* User Info */}
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.fullName || user?.username}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings/profile"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700`}
                      >
                        <UserCircleIcon className="w-4 h-4" />
                        My Profile
                      </Link>
                    )}
                  </Menu.Item>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings/team"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700`}
                      >
                        <UsersIcon className="w-4 h-4" />
                        Team Members
                      </Link>
                    )}
                  </Menu.Item>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings/firm"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700`}
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        Firm Settings
                      </Link>
                    )}
                  </Menu.Item>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings/billing"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700`}
                      >
                        <CurrencyDollarIcon className="w-4 h-4" />
                        Billing & Subscription
                      </Link>
                    )}
                  </Menu.Item>

                  <div className="border-t border-gray-200 my-1" />
                  
                  {/* Logout Button */}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`${
                          active ? 'bg-red-50 text-red-600' : 'text-gray-700'
                        } group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors`}
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};