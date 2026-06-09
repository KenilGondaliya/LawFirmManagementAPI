// src/pages/Auth/SelectFirm.tsx - Fixed version

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/UI/Button';
import { BuildingOfficeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export const SelectFirm: React.FC = () => {
  const navigate = useNavigate();
  const { firms, switchFirm, isLoading } = useAuthStore();
  const [selectedFirmId, setSelectedFirmId] = useState<number | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSelectFirm = async () => {
    if (!selectedFirmId) return;
    
    setIsSwitching(true);
    try {
      await switchFirm(selectedFirmId);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to select firm:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (firms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h1 className="text-4xl font-bold text-primary-600">praava</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">No Firms Found</h2>
          <p className="text-gray-600">You don't have access to any firms yet.</p>
          <Button onClick={() => navigate('/create-firm')}>
            Create a Firm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600">praava</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Select Your Firm</h2>
          <p className="mt-2 text-gray-600">Choose which firm you want to access</p>
        </div>

        <div className="space-y-4">
          {firms.map((firm) => (
            <div
              key={firm.id}
              onClick={() => setSelectedFirmId(firm.id)}
              className={`cursor-pointer transition-all duration-200 rounded-lg border-2 p-4 ${
                selectedFirmId === firm.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedFirmId === firm.id ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  {firm.logoUrl ? (
                    <img src={firm.logoUrl} alt={firm.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <BuildingOfficeIcon className={`w-6 h-6 ${
                      selectedFirmId === firm.id ? 'text-primary-600' : 'text-gray-500'
                    }`} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{firm.name}</h3>
                  <p className="text-sm text-gray-500">Role: {firm.role}</p>
                </div>
                {selectedFirmId === firm.id && (
                  <CheckCircleIcon className="w-6 h-6 text-primary-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleSelectFirm}
          isLoading={isSwitching || isLoading}
          disabled={!selectedFirmId}
          fullWidth
        >
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );
};