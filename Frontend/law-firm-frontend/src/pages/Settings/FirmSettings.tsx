// src/pages/Settings/FirmSettings.tsx
import React, { useEffect, useState } from 'react';
import { settingsService, type FirmSettings as FirmSettingsModel, type Branding } from '../../services/settings.service';
import { usePermissions } from '../../hooks/usePermissions';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { BuildingIcon, MailIcon, PhoneIcon, MapPinIcon, GlobeIcon, UploadIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const FirmSettings: React.FC = () => {
  const { isAdmin } = usePermissions();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<FirmSettingsModel | null>(null);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [settingsData, brandingData] = await Promise.all([
        settingsService.getFirmSettings(),
        settingsService.getBranding(),
      ]);
      setSettings(settingsData);
      setBranding(brandingData);
    } catch (error) {
      toast.error('Failed to load firm settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await settingsService.updateFirmSettings(settings);
      toast.success('Firm settings updated successfully');
    } catch (error) {
      toast.error('Failed to update firm settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('logo', file);
    if (branding?.primaryColor) formData.append('primaryColor', branding.primaryColor);
    if (branding?.secondaryColor) formData.append('secondaryColor', branding.secondaryColor);
    
    try {
      const updated = await settingsService.updateBranding(formData);
      setBranding(updated);
      toast.success('Logo updated successfully');
    } catch (error) {
      toast.error('Failed to update logo');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!settings) {
    return <div>Failed to load settings</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Firm Settings</h1>
        <p className="text-gray-500 mt-1">Manage your firm's information and branding</p>
      </div>

      {/* Firm Information */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BuildingIcon className="w-5 h-5 text-primary-500" />
          Firm Information
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Firm Name"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              required
              disabled={!isAdmin}
            />
            <Input
              label="Legal Name"
              value={settings.legalName || ''}
              onChange={(e) => setSettings({ ...settings, legalName: e.target.value })}
              disabled={!isAdmin}
            />
            <Input
              label="Email"
              type="email"
              value={settings.email || ''}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              icon={<MailIcon className="w-4 h-4" />}
              disabled={!isAdmin}
            />
            <Input
              label="Phone"
              value={settings.phone || ''}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              icon={<PhoneIcon className="w-4 h-4" />}
              disabled={!isAdmin}
            />
            <Input
              label="Website"
              value={settings.website || ''}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              icon={<GlobeIcon className="w-4 h-4" />}
              disabled={!isAdmin}
            />
            <Input
              label="Registration Number"
              value={settings.registrationNumber || ''}
              onChange={(e) => setSettings({ ...settings, registrationNumber: e.target.value })}
              disabled={!isAdmin}
            />
            <Input
              label="Tax Number"
              value={settings.taxNumber || ''}
              onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
              disabled={!isAdmin}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">Address</h3>
            <Input
              label="Address Line 1"
              value={settings.addressLine1 || ''}
              onChange={(e) => setSettings({ ...settings, addressLine1: e.target.value })}
              icon={<MapPinIcon className="w-4 h-4" />}
              disabled={!isAdmin}
            />
            <Input
              label="Address Line 2"
              value={settings.addressLine2 || ''}
              onChange={(e) => setSettings({ ...settings, addressLine2: e.target.value })}
              disabled={!isAdmin}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                value={settings.city || ''}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                disabled={!isAdmin}
              />
              <Input
                label="State"
                value={settings.state || ''}
                onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                disabled={!isAdmin}
              />
              <Input
                label="Postal Code"
                value={settings.postalCode || ''}
                onChange={(e) => setSettings({ ...settings, postalCode: e.target.value })}
                disabled={!isAdmin}
              />
              <Input
                label="Country"
                value={settings.country || ''}
                onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
          </div>
          
          {isAdmin() && (
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Branding */}
      {isAdmin() && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Firm Logo</label>
              <div className="flex items-center gap-4">
                {branding?.logoUrl && (
                  <img src={branding.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <UploadIcon className="w-4 h-4" />
                    <span>Upload Logo</span>
                  </div>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Primary Color"
                type="color"
                value={branding?.primaryColor || '#4F46E5'}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
              />
              <Input
                label="Secondary Color"
                type="color"
                value={branding?.secondaryColor || '#10B981'}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};