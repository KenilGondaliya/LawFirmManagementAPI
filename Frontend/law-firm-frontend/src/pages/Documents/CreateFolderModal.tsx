// src/pages/Documents/modals/CreateFolderModal.tsx
import React, { useState } from 'react';
import { useDocumentStore } from '../../stores/documentStore';
import { Modal } from '../../components/UI/Modal';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import toast from 'react-hot-toast';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentFolderId?: number | null;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  parentFolderId 
}) => {
  const { createFolder } = useDocumentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Folder name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await createFolder({
        name: name.trim(),
        description: description.trim() || undefined,
        parentFolderId: parentFolderId || undefined,
      });
      onSuccess();
      onClose();
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create folder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Folder" size="md">
      <div className="space-y-4">
        <Input
          label="Folder Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter folder name"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            placeholder="Enter folder description (optional)"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Create Folder
          </Button>
        </div>
      </div>
    </Modal>
  );
};