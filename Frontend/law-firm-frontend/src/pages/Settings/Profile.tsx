// src/pages/Settings/Profile.tsx - Fixed version

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { settingsService } from '../../services/settings.service';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import { UserIcon, MailIcon, PhoneIcon, CameraIcon, TrashIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user, updateProfile, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
      });
      // ✅ Set avatar URL from user data
      setAvatarUrl(user.profileImageUrl || null);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // ✅ Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // ✅ Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    try {
      // ✅ Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);
      
      // ✅ Upload to server
      const uploadedUrl = await settingsService.uploadAvatar(file);
      
      // ✅ Update with server URL
      setAvatarUrl(uploadedUrl);
      
      // ✅ Update user in store
      if (user) {
        const updatedUser = { ...user, profileImageUrl: uploadedUrl };
        setUser(updatedUser);
      }
      
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
      // ✅ Revert preview on error
      setAvatarUrl(user?.profileImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    
    setIsUploading(true);
    try {
      await settingsService.removeAvatar();
      setAvatarUrl(null);
      
      // ✅ Update user in store
      if (user) {
        const updatedUser = { ...user, profileImageUrl: undefined };
        setUser(updatedUser);
      }
      
      toast.success('Avatar removed successfully');
    } catch (error) {
      toast.error('Failed to remove avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your personal information</p>
      </div>

      {/* Avatar Section */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              ) : avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // ✅ Handle image load error
                    console.error('Failed to load image:', avatarUrl);
                    e.currentTarget.style.display = 'none';
                    setAvatarUrl(null);
                  }}
                />
              ) : (
                <UserIcon className="w-12 h-12 text-primary-600" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-colors">
              <CameraIcon className="w-4 h-4 text-gray-600" />
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/jpg,image/gif" 
                onChange={handleAvatarChange} 
                disabled={isUploading}
                className="hidden" 
              />
            </label>
          </div>
          {avatarUrl && (
            <Button 
              variant="outline" 
              onClick={handleRemoveAvatar} 
              disabled={isUploading}
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Supported formats: JPEG, PNG, GIF. Max size: 5MB.
        </p>
      </Card>

      {/* Profile Form */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              icon={<UserIcon className="w-4 h-4" />}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              icon={<UserIcon className="w-4 h-4" />}
              required
            />
            <Input
              label="Email"
              value={user?.email || ''}
              disabled
              icon={<MailIcon className="w-4 h-4" />}
              className="bg-gray-50"
            />
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              icon={<PhoneIcon className="w-4 h-4" />}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};