// src/components/Layout/Header.tsx
import React from 'react';
import { BellIcon, SearchIcon, ChevronDownIcon } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, firms, currentFirm, setCurrentFirm } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const handleFirmSwitch = (firm: typeof currentFirm) => {
    if (firm) {
      setCurrentFirm(firm);
      // Call API to switch firm context
    }
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 w-64 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700">
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        {/* Firm Selector */}
        {firms.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className="text-sm">{currentFirm?.name}</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {firms.map((firm) => (
                  <button
                    key={firm.id}
                    onClick={() => handleFirmSwitch(firm)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    {firm.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};