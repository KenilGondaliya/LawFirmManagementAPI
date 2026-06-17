// src/pages/Documents/modals/UploadDocumentModal.tsx - Complete Version

import React, { useState, useEffect } from 'react';
import { useDocumentStore } from '../../stores/documentStore';
import { useMatterStore } from '../../stores/matterStore';
import { useContactStore } from '../../stores/contactStore';
import { Modal } from '../../components/UI/Modal';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { DocumentIcon, DocumentDuplicateIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
  const [dragActive, setDragActive] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);
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
      // Reset form when modal opens
      setSelectedFile(null);
      setIsTemplate(false);
      setFormData({
        title: '',
        description: '',
        matterId: undefined,
        contactId: undefined,
        documentTypeId: undefined,
      });
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.split('.')[0] }));
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, title: '' }));
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await uploadDocument({
        file: selectedFile,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        matterId: formData.matterId,
        contactId: formData.contactId,
        documentTypeId: formData.documentTypeId,
        folderId: currentFolderId || undefined,
        isTemplate: isTemplate,
      });
      
      if (result) {
        toast.success(isTemplate ? 'Template created successfully' : 'Document uploaded successfully');
        onSuccess();
        onClose();
        // Reset form
        setSelectedFile(null);
        setIsTemplate(false);
        setFormData({
          title: '',
          description: '',
          matterId: undefined,
          contactId: undefined,
          documentTypeId: undefined,
        });
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Document" size="lg">
      <div className="space-y-4">
        {/* File Selection with Drag and Drop */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File *
          </label>
          <div
            className={`flex items-center justify-center w-full transition-colors ${
              dragActive ? 'border-primary-500 bg-primary-50' : ''
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              dragActive 
                ? 'border-primary-500 bg-primary-50' 
                : selectedFile 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:bg-gray-50'
            }`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                {selectedFile ? (
                  <>
                    <DocumentIcon className="w-10 h-10 text-green-500 mb-2" />
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="mt-2 text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Remove file
                    </button>
                  </>
                ) : (
                  <>
                    <DocumentIcon className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Click to select or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supported: PDF, Word, Excel, Images, and more
                    </p>
                  </>
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
          label="Title *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter document title"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            placeholder="Enter document description (optional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={formData.documentTypeId || ''}
              onChange={(e) => setFormData({ ...formData, documentTypeId: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">None</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Save as Template Option */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="isTemplate"
            checked={isTemplate}
            onChange={(e) => setIsTemplate(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="isTemplate" className="flex items-center gap-2 cursor-pointer">
            <DocumentDuplicateIcon className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium text-gray-700">Save as Template</span>
            <span className="text-xs text-gray-400">(Makes this document reusable as a template)</span>
          </label>
        </div>

        {/* Current Folder Info */}
        {currentFolderId && (
          <div className="text-xs text-gray-400">
            Will be saved in current folder: <span className="font-medium text-gray-600">Folder #{currentFolderId}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            isLoading={isSubmitting} 
            disabled={!selectedFile || !formData.title.trim()}
          >
            {isTemplate ? 'Create Template' : 'Upload Document'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};