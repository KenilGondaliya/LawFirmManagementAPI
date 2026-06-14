// src/pages/Settings/Preferences.tsx
import React, { useEffect, useState } from 'react';
import { settingsService, UserPreferences } from '../../services/settings.service';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { BellIcon, GlobeIcon, CalendarIcon, PaletteIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const Preferences: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.getUserPreferences();
      setPreferences(data);
    } catch (error) {
      toast.error('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;
    setIsSaving(true);
    try {
      await settingsService.updateUserPreferences(preferences);
      toast.success('Preferences updated successfully');
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!preferences) {
    return <div>Failed to load preferences</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
        <p className="text-gray-500 mt-1">Customize your experience</p>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Theme */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <PaletteIcon className="w-4 h-4 text-primary-500" />
              Appearance
            </h3>
            <div className="flex gap-3">
              {['light', 'dark', 'system'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => setPreferences({ ...preferences, theme })}
                  className={`px-4 py-2 border rounded-lg capitalize transition-colors ${
                    preferences.theme === theme
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <GlobeIcon className="w-4 h-4 text-primary-500" />
              Language
            </h3>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          {/* Calendar View */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary-500" />
              Calendar Default View
            </h3>
            <div className="flex gap-3">
              {['month', 'week', 'day', 'agenda'].map((view) => (
                <button
                  key={view}
                  onClick={() => setPreferences({ ...preferences, calendarView: view })}
                  className={`px-4 py-2 border rounded-lg capitalize transition-colors ${
                    preferences.calendarView === view
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BellIcon className="w-4 h-4 text-primary-500" />
              Notifications
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Enable notifications</span>
                <input
                  type="checkbox"
                  checked={preferences.notificationsEnabled}
                  onChange={(e) => setPreferences({ ...preferences, notificationsEnabled: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Email notifications</span>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Push notifications</span>
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button onClick={handleSave} isLoading={isSaving}>
              Save Preferences
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};