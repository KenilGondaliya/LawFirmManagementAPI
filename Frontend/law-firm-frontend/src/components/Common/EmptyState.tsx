// src/components/Common/EmptyState.tsx
import React from 'react';
import { FolderOpenIcon } from 'lucide-react';
import { Button } from '../UI/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  icon,
}) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        {icon || <FolderOpenIcon className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {buttonText && onButtonClick && (
        <Button onClick={onButtonClick}>{buttonText}</Button>
      )}
    </div>
  );
};