import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  CheckSquare, 
  Mail, 
  FileText, 
  CreditCard,
  Settings,
  Menu,
  Plus
} from 'lucide-react';
import useUIStore from '../../stores/uiStore';
import useAuthStore from '../../stores/authStore';

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { currentFirm } = useAuthStore();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/contacts', icon: Users, label: 'Contacts' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/communications', icon: Mail, label: 'Communications' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/billing', icon: CreditCard, label: 'Billing' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between p-4 border-b">
        {sidebarOpen && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg"></div>
            <span className="font-bold text-xl">Praava</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="p-4">
        <NavLink
          to="/create-new"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <Plus size={20} />
          {sidebarOpen && <span>Create New</span>}
        </NavLink>
      </div>

      <nav className="mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={20} />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {sidebarOpen && currentFirm && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="text-sm text-gray-600">
            <p className="font-medium">{currentFirm.name}</p>
            <p className="text-xs">Role: {currentFirm.role}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;