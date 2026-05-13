// src/components/Layout/MainLayout.tsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Calendar',
  '/matters': 'Matters',
  '/contacts': 'Contacts',
  '/tasks': 'Tasks',
  '/communications': 'Communications',
  '/documents': 'Documents',
  '/billing': 'Billing',
  '/settings': 'Settings',
};

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header title={title} />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};