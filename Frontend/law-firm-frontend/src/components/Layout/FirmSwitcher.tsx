// src/components/Layout/FirmSwitcher.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { BuildingOfficeIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';

export const FirmSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const { firms, currentFirm, switchFirm } = useAuthStore();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchFirm = async (firmId: number) => {
    if (firmId === currentFirm?.id) return;
    
    setIsSwitching(true);
    try {
      await switchFirm(firmId);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to switch firm:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!currentFirm || firms.length <= 1) {
    return null;
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
        <BuildingOfficeIcon className="w-4 h-4" />
        <span className="max-w-[150px] truncate">{currentFirm.name}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </Menu.Button>

      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none z-50">
          <div className="p-1">
            {firms.map((firm) => (
              <Menu.Item key={firm.id}>
                {({ active }) => (
                  <button
                    onClick={() => handleSwitchFirm(firm.id)}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm`}
                    disabled={isSwitching}
                  >
                    <div className="flex items-center gap-3">
                      {firm.logoUrl ? (
                        <img src={firm.logoUrl} alt="" className="w-6 h-6 rounded-full" />
                      ) : (
                        <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{firm.name}</p>
                        <p className="text-xs text-gray-500">{firm.role}</p>
                      </div>
                    </div>
                    {currentFirm?.id === firm.id && (
                      <CheckIcon className="w-4 h-4 text-primary-600" />
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};