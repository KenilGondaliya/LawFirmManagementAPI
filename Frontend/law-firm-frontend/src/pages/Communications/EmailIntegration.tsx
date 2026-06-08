// src/pages/Communications/modals/ComposeMessageModal.tsx
import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { useCommunicationStore } from '../../stores/communicationStore';
import { useMatterStore } from '../../stores/matterStore';
import { useContactStore } from '../../stores/contactStore';
import { useAuthStore } from '../../stores/authStore';
import { Modal } from '../../components/UI/Modal';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import toast from 'react-hot-toast';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  replyTo?: {
    messageId: number;
    subject: string;
    fromEmail: string;
    fromName: string;
  };
}

export const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  replyTo 
}) => {
  const { user } = useAuthStore();
  const { sendMessage, replyToMessage } = useCommunicationStore();
  const { matters, fetchMatters } = useMatterStore();
  const { contacts, fetchContacts } = useContactStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    to: [''],
    cc: [''] as string[],
    bcc: [''] as string[],
    subject: '',
    body: '',
    matterId: undefined as number | undefined,
    contactId: undefined as number | undefined,
  });

  useEffect(() => {
    fetchMatters({});
    fetchContacts({});
    
    if (replyTo) {
      setFormData(prev => ({
        ...prev,
        subject: replyTo.subject.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`,
        to: [replyTo.fromEmail],
        body: `\n\n\n-------- Original Message --------\nFrom: ${replyTo.fromName} <${replyTo.fromEmail}>\nSubject: ${replyTo.subject}\n`,
      }));
    }
  }, [replyTo]);

  const handleAddRecipient = (type: 'to' | 'cc' | 'bcc') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ''],
    }));
  };

  const handleRemoveRecipient = (type: 'to' | 'cc' | 'bcc', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleRecipientChange = (type: 'to' | 'cc' | 'bcc', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((v, i) => i === index ? value : v),
    }));
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const toEmails = formData.to.filter(e => e.trim());
    if (toEmails.length === 0) {
      toast.error('Please enter at least one recipient');
      return;
    }
    if (!formData.body.trim()) {
      toast.error('Message body cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      if (replyTo) {
        await replyToMessage(replyTo.messageId, {
          originalMessageId: replyTo.messageId,
          body: formData.body,
          fromEmail: user?.email || '',
          fromName: user?.fullName || user?.firstName || '',
          subject: formData.subject,
          to: toEmails,
          cc: formData.cc.filter(e => e.trim()),
          attachments: attachments,
        });
      } else {
        await sendMessage({
          subject: formData.subject,
          body: formData.body,
          fromEmail: user?.email || '',
          fromName: user?.fullName || user?.firstName || '',
          to: toEmails,
          cc: formData.cc.filter(e => e.trim()),
          bcc: formData.bcc.filter(e => e.trim()),
          matterId: formData.matterId,
          contactId: formData.contactId,
          attachments: attachments,
        });
      }
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        to: [''],
        cc: [''],
        bcc: [''],
        subject: '',
        body: '',
        matterId: undefined,
        contactId: undefined,
      });
      setAttachments([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={replyTo ? 'Reply to Message' : 'New Message'} size="lg">
      <div className="space-y-4">
        {/* To Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
          {formData.to.map((email, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => handleRecipientChange('to', index, e.target.value)}
                placeholder="recipient@example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {formData.to.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRecipient('to', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddRecipient('to')}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-1"
          >
            <PlusIcon className="w-4 h-4" />
            Add recipient
          </button>
        </div>

        {/* Cc and Bcc Toggle */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowCc(!showCc)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showCc ? 'Hide Cc' : 'Show Cc'}
          </button>
          <button
            type="button"
            onClick={() => setShowBcc(!showBcc)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showBcc ? 'Hide Bcc' : 'Show Bcc'}
          </button>
        </div>

        {/* Cc Field */}
        {showCc && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cc</label>
            {formData.cc.map((email, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleRecipientChange('cc', index, e.target.value)}
                  placeholder="cc@example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {formData.cc.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient('cc', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddRecipient('cc')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-1"
            >
              <PlusIcon className="w-4 h-4" />
              Add Cc
            </button>
          </div>
        )}

        {/* Bcc Field */}
        {showBcc && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bcc</label>
            {formData.bcc.map((email, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleRecipientChange('bcc', index, e.target.value)}
                  placeholder="bcc@example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {formData.bcc.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient('bcc', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddRecipient('bcc')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-1"
            >
              <PlusIcon className="w-4 h-4" />
              Add Bcc
            </button>
          </div>
        )}

        {/* Subject */}
        <Input
          label="Subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Enter subject"
        />

        {/* Related Matter & Contact */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Matter</label>
            <select
              value={formData.matterId || ''}
              onChange={(e) => setFormData({ ...formData, matterId: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">None</option>
              {matters.map((matter) => (
                <option key={matter.id} value={matter.id}>
                  {matter.matterNumber} - {matter.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Contact</label>
            <select
              value={formData.contactId || ''}
              onChange={(e) => setFormData({ ...formData, contactId: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">None</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Write your message here..."
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
              <PaperClipIcon className="w-4 h-4 inline mr-2" />
              Add Files
              <input
                type="file"
                multiple
                onChange={handleAttachmentChange}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-500">{attachments.length} file(s) selected</span>
          </div>
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            {replyTo ? 'Send Reply' : 'Send Message'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};