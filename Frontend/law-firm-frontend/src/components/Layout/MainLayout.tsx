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
  '/settings/profile': 'Profile Settings',
  '/settings/team': 'Team Management',
  '/settings/firm': 'Firm Settings',
  '/settings/billing': 'Billing & Plan',
};

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};