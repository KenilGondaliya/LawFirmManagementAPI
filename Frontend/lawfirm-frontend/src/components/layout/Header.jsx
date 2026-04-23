import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import useContactStore from '../../stores/contactStore';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, currentFirm, firms, selectFirm } = useAuthStore();
  const { setSearchQuery, fetchContacts } = useContactStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFirmMenu, setShowFirmMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchQuery(value);
    fetchContacts({ search: value });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFirmSwitch = async (firmId) => {
    await selectFirm(firmId);
    setShowFirmMenu(false);
    navigate('/');
  };

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search contacts, matters, documents..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {firms && firms.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowFirmMenu(!showFirmMenu)}
                className="flex items-center space-x-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
              >
                <span className="text-sm font-medium">{currentFirm?.name}</span>
                <ChevronDown size={16} />
              </button>
              {showFirmMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20">
                  {firms.map((firm) => (
                    <button
                      key={firm.id}
                      onClick={() => handleFirmSwitch(firm.id)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {firm.name}
                      {currentFirm?.id === firm.id && (
                        <span className="ml-2 text-primary-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white">
                {user?.fullName?.[0] || user?.username?.[0] || 'U'}
              </div>
              <ChevronDown size={16} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium">{user?.fullName || user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                >
                  <Settings size={16} />
                  <span>Profile Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;