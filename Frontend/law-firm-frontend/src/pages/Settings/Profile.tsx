// src/pages/Settings/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { settingsService } from '../../services/settings.service';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import { UserIcon, MailIcon, PhoneIcon, CameraIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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
      setAvatarPreview(user.profileImageUrl || null);
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
    if (file) {
      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
      
      // Upload immediately
      setIsLoading(true);
      try {
        await settingsService.uploadAvatar(file);
        toast.success('Avatar updated successfully');
        // Refresh user data
        const updatedProfile = await settingsService.getProfile();
        useAuthStore.setState({ user: updatedProfile });
      } catch (error) {
        toast.error('Failed to upload avatar');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setIsLoading(true);
    try {
      await settingsService.removeAvatar();
      setAvatarPreview(null);
      setAvatarFile(null);
      toast.success('Avatar removed successfully');
      const updatedProfile = await settingsService.getProfile();
      useAuthStore.setState({ user: updatedProfile });
    } catch (error) {
      toast.error('Failed to remove avatar');
    } finally {
      setIsLoading(false);
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
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-12 h-12 text-primary-600" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-1 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50">
              <CameraIcon className="w-4 h-4 text-gray-600" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          {avatarPreview && (
            <Button variant="outline" onClick={handleRemoveAvatar} disabled={isLoading}>
              <TrashIcon className="w-4 h-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
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