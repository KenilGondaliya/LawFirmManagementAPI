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
  const { connectEmail, disconnectEmail, emailStatus } = useCommunicationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [formData, setFormData] = useState({
    emailAddress: user?.email || '',
    provider: 'google',
    accessToken: '',
    refreshToken: '',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const handleConnect = async () => {
    if (!formData.emailAddress) {
      toast.error('Email address is required');
      return;
    }

    setIsLoading(true);
    try {
      // For demo purposes, you would normally get these tokens from OAuth flow
      // This is a placeholder - implement actual OAuth flow
      const mockTokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
      };
      
      await connectEmail({
        ...formData,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
      toast.success('Email connected successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to connect email:', error);
      toast.error(error.response?.data?.message || 'Failed to connect email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectEmail();
      toast.success('Email disconnected');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to disconnect email:', error);
      toast.error('Failed to disconnect email');
    } finally {
      setIsDisconnecting(false);
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
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Your email is currently connected. You can:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Send and receive emails directly from the platform</li>
                <li>Sync emails automatically</li>
                <li>Use templates for quick replies</li>
              </ul>
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
              Connect your email account to send and receive messages directly from the platform.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, provider: 'google' })}
                    className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-all ${
                      formData.provider === 'google'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Google
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, provider: 'outlook' })}
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
                placeholder="you@example.com"
                value={formData.emailAddress}
                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                icon={<MailIcon className="w-4 h-4" />}
              />
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> For production use, you'll need to implement OAuth 2.0 flow with your email provider.
                  This is a demonstration of the integration flow.
                </p>
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