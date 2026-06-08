// src/pages/Auth/SelectFirm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

export const SelectFirm: React.FC = () => {
  const navigate = useNavigate();
  const { firms, setCurrentFirm, login } = useAuthStore();
  const [selectedFirmId, setSelectedFirmId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectFirm = async () => {
    if (!selectedFirmId) return;
    
    setIsLoading(true);
    try {
      const selectedFirm = firms.find(f => f.id === selectedFirmId);
      if (selectedFirm) {
        setCurrentFirm(selectedFirm);
        // Re-login with selected firm
        // You'll need to store email/password temporarily or use a different approach
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to select firm:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              className="cursor-pointer"
            >
              <Card
                className={`p-4 transition-all ${
                  selectedFirmId === firm.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{firm.name}</h3>
                    <p className="text-sm text-gray-500">Role: {firm.role}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300">
                    {selectedFirmId === firm.id && (
                      <div className="w-2 h-2 rounded-full bg-primary-600 m-0.5"></div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <Button
          onClick={handleSelectFirm}
          isLoading={isLoading}
          disabled={!selectedFirmId}
          fullWidth
        >
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );
};