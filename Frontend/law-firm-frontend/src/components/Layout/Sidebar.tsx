// src/components/Layout/Sidebar.tsx - Ensure it has proper width

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  HomeIcon,
  FolderIcon,
  UsersIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import logoUrl from '../assets/logo_white-1.webp';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const menuItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/matters', icon: FolderIcon, label: 'Matters' },
    { path: '/contacts', icon: UsersIcon, label: 'Contacts' },
    { path: '/calendar', icon: CalendarIcon, label: 'Calendar' },
    { path: '/tasks', icon: ClipboardDocumentListIcon, label: 'Tasks' },
    { path: '/documents', icon: DocumentTextIcon, label: 'Documents' },
    { path: '/communications', icon: ChatBubbleLeftRightIcon, label: 'Messages' },
    { path: '/billing', icon: CurrencyDollarIcon, label: 'Billing' },
    { path: '/settings/profile', icon: Cog6ToothIcon, label: 'Settings' },
  ];

  return (
    <div
      className={`bg-gray-900 text-white transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!isCollapsed && (
          <Link to="/dashboard" className="text-xl font-bold text-white">
            <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
          </Link>
        )}
        {isCollapsed && (
          <Link to="/dashboard" className="text-xl font-bold text-white mx-auto">
            P
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-3 border-t border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-3 px-2">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#e67e2b] hover:text-white transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          {!isCollapsed && (isLoggingOut ? 'Logging out...' : 'Logout')}
        </button>
      </div>
    </div>
  );
};