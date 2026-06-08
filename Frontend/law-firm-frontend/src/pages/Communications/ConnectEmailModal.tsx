// src/pages/Communications/modals/ConnectEmailModal.tsx
import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useCommunicationStore } from '../../stores/communicationStore';
import { Modal } from '../../components/UI/Modal';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { MailIcon, LockIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ConnectEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ConnectEmailModal: React.FC<ConnectEmailModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuthStore();
  const { connectEmail, disconnectEmail, emailStatus, syncEmails } = useCommunicationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [formData, setFormData] = useState({
    emailAddress: user?.email || '',
    password: '',
    provider: 'gmail',
    imapHost: 'imap.gmail.com',
    imapPort: 993,
  });

  const handleConnect = async () => {
    // Validation
    if (!formData.emailAddress) {
      toast.error('Email address is required');
      return;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }

    setIsLoading(true);
    try {
      await connectEmail({
        emailAddress: formData.emailAddress,
        password: formData.password,
        provider: formData.provider,
        imapHost: formData.imapHost,
        imapPort: formData.imapPort,
      });
      
      toast.success('Email connected successfully');
      
      // Auto sync after connection
      try {
        await syncEmails();
      } catch (syncError) {
        console.warn('Auto-sync failed:', syncError);
        // Don't show error for auto-sync, just notify user
        toast('Email connected but initial sync failed. Click "Sync Now" to fetch emails.');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to connect email:', error);
      const errorMsg = error.response?.data?.message || 'Failed to connect email. Check your credentials.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectEmail();
      toast.success('Email disconnected successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to disconnect email:', error);
      toast.error(error.response?.data?.message || 'Failed to disconnect email');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleProviderChange = (provider: string) => {
    if (provider === 'gmail') {
      setFormData({
        ...formData,
        provider: 'gmail',
        imapHost: 'imap.gmail.com',
        imapPort: 993,
      });
    } else if (provider === 'outlook') {
      setFormData({
        ...formData,
        provider: 'outlook',
        imapHost: 'outlook.office365.com',
        imapPort: 993,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Email Integration" size="md">
      <div className="space-y-4">
        {emailStatus?.isConnected ? (
          // Connected View
          <div>
            <div className="p-4 bg-green-50 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="font-medium text-gray-900">Connected</p>
                  <p className="text-sm text-gray-600">{emailStatus.emailAddress}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Provider: {emailStatus.provider?.toUpperCase() || 'Custom'}
                  </p>
                  {emailStatus.lastSyncAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last sync: {new Date(emailStatus.lastSyncAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Your email is connected. Click "Sync Now" on the main page to fetch new emails.
              </p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>📧 Gmail Users:</strong> Use an <strong>App Password</strong> instead of your regular password.
                  <br />
                  <a 
                    href="https://myaccount.google.com/apppasswords" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 underline mt-1 inline-block"
                  >
                    Generate App Password →
                  </a>
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button 
                variant="danger" 
                onClick={handleDisconnect} 
                isLoading={isDisconnecting}
                fullWidth
              >
                Disconnect Email
              </Button>
            </div>
          </div>
        ) : (
          // Disconnected View - Connect Form
          <div>
            <p className="text-gray-600 mb-4">
              Connect your email account to sync messages. Your credentials are encrypted and secure.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleProviderChange('gmail')}
                    className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-all ${
                      formData.provider === 'gmail'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MailIcon className="w-5 h-5" />
                    <span>Gmail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderChange('outlook')}
                    className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-all ${
                      formData.provider === 'outlook'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MailIcon className="w-5 h-5" />
                    <span>Outlook</span>
                  </button>
                </div>
              </div>
              
              <Input
                label="Email Address"
                type="email"
                placeholder="you@gmail.com"
                value={formData.emailAddress}
                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                icon={<MailIcon className="w-4 h-4" />}
                required
              />
              
              <Input
                label="Password / App Password"
                type="password"
                placeholder="Enter your password or app password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                icon={<LockIcon className="w-4 h-4" />}
                required
              />
              
              {/* IMAP Settings (Advanced) */}
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                  Advanced IMAP Settings
                </summary>
                <div className="mt-3 space-y-3 pt-2">
                  <Input
                    label="IMAP Host"
                    placeholder="imap.gmail.com"
                    value={formData.imapHost}
                    onChange={(e) => setFormData({ ...formData, imapHost: e.target.value })}
                  />
                  <Input
                    label="IMAP Port"
                    type="number"
                    placeholder="993"
                    value={formData.imapPort}
                    onChange={(e) => setFormData({ ...formData, imapPort: parseInt(e.target.value) || 993 })}
                  />
                </div>
              </details>
              
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Important Notes:</strong>
                </p>
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                  <li>For Gmail, you MUST enable IMAP in Gmail Settings first</li>
                  <li>Then create an <strong>App Password</strong> at myaccount.google.com/apppasswords</li>
                  <li>Use the 16-character App Password here, not your regular password</li>
                  <li>For Outlook, use your regular password or an app password if 2FA is enabled</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleConnect} isLoading={isLoading}>
                Connect Email
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};