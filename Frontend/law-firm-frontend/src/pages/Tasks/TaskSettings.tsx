// src/pages/Settings/TaskSettings.tsx
import React, { useState } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Cog6ToothIcon, FlagIcon, TagIcon } from '@heroicons/react/24/outline';
import { StatusManagementModal } from './StatusManagementModal';
import { PriorityManagementModal } from './PriorityManagementModal';

export const TaskSettings: React.FC = () => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Task Settings</h1>
        <p className="text-gray-500 mt-1">Manage task statuses and priorities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statuses Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TagIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Task Statuses</h2>
              <p className="text-sm text-gray-500">Manage task workflow stages</p>
            </div>
          </div>
          <Button onClick={() => setShowStatusModal(true)} className="w-full">
            Manage Statuses
          </Button>
        </Card>

        {/* Priorities Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FlagIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Task Priorities</h2>
              <p className="text-sm text-gray-500">Manage priority levels</p>
            </div>
          </div>
          <Button onClick={() => setShowPriorityModal(true)} className="w-full">
            Manage Priorities
          </Button>
        </Card>
      </div>

      <StatusManagementModal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} />
      <PriorityManagementModal isOpen={showPriorityModal} onClose={() => setShowPriorityModal(false)} />
    </div>
  );
};