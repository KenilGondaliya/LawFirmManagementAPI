// src/components/Layout/Sidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  CheckSquareIcon,
  MessageSquareIcon,
  FileTextIcon,
  ReceiptIcon,
  SettingsIcon,
  PlusCircleIcon,
  LogOutIcon,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const menuItems = [
  { path: '/dashboard', label: 'Home', icon: HomeIcon },
  { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { path: '/matters', label: 'Matters', icon: FileTextIcon },
  { path: '/contacts', label: 'Contacts', icon: UsersIcon },
  { path: '/tasks', label: 'Tasks', icon: CheckSquareIcon },
  { path: '/communications', label: 'Communications', icon: MessageSquareIcon },
  { path: '/documents', label: 'Documents', icon: FileTextIcon },
  { path: '/billing', label: 'Billing', icon: ReceiptIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, currentFirm } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">praava</h1>
        {currentFirm && (
          <p className="text-sm text-gray-500 mt-1">{currentFirm.name}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
            }
          >
            <item.icon className="sidebar-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Create New Button */}
      <div className="px-3 py-4 border-t border-gray-200">
        <button
          onClick={() => navigate('/create-new')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusCircleIcon className="w-5 h-5" />
          Create New
        </button>
      </div>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <LogOutIcon className="w-4 h-4" />
          <span className="text-sm">Log out</span>
        </button>
      </div>
    </aside>
  );
};