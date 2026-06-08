// src/pages/Documents/modals/UploadDocumentModal.tsx
import React, { useState, useEffect } from 'react';
import { useDocumentStore } from '../../stores/documentStore';
import { useMatterStore } from '../../stores/matterStore';
import { useContactStore } from '../../stores/contactStore';
import { Modal } from '../../components/UI/Modal';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { DocumentIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentFolderId?: number | null;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  currentFolderId 
}) => {
  const { uploadDocument, documentTypes, fetchDocumentTypes } = useDocumentStore();
  const { matters, fetchMatters } = useMatterStore();
  const { contacts, fetchContacts } = useContactStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    matterId: undefined as number | undefined,
    contactId: undefined as number | undefined,
    documentTypeId: undefined as number | undefined,
  });

  useEffect(() => {
    if (isOpen) {
      fetchDocumentTypes();
      fetchMatters({});
      fetchContacts({});
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.split('.')[0] }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsSubmitting(true);
    try {
      await uploadDocument({
        file: selectedFile,
        title: formData.title,
        description: formData.description,
        matterId: formData.matterId,
        contactId: formData.contactId,
        documentTypeId: formData.documentTypeId,
        folderId: currentFolderId || undefined,
      });
      onSuccess();
      onClose();
      // Reset form
      setSelectedFile(null);
      setFormData({
        title: '',
        description: '',
        matterId: undefined,
        contactId: undefined,
        documentTypeId: undefined,
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Document" size="lg">
      <div className="space-y-4">
        {/* File Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File *
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <DocumentIcon className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop'}
                </p>
                {selectedFile && (
                  <p className="text-xs text-gray-400 mt-1">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {/* Document Details */}
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter document title"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            placeholder="Enter document description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={formData.documentTypeId || ''}
              onChange={(e) => setFormData({ ...formData, documentTypeId: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Type</option>
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Matter</label>
            <select
              value={formData.matterId || ''}
              onChange={(e) => setFormData({ ...formData, matterId: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">None</option>
              {matters.map((matter) => (
                <option key={matter.id} value={matter.id}>
                  {matter.matterNumber} - {matter.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Related Contact</label>
          <select
            value={formData.contactId || ''}
            onChange={(e) => setFormData({ ...formData, contactId: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">None</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!selectedFile}>
            Upload
          </Button>
        </div>
      </div>
    </Modal>
  );
};