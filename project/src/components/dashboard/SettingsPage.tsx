import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Save, Upload } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updates = {
        fullName: formData.get('fullName') as string,
        company: formData.get('company') as string,
        preferences: {
          ...user?.preferences,
          currency: {
            code: formData.get('currency') as string,
            symbol: getCurrencySymbol(formData.get('currency') as string),
            name: getCurrencyName(formData.get('currency') as string)
          }
        },
        branding: {
          ...user?.branding,
          color: formData.get('brandColor') as string,
          font: formData.get('font') as string
        }
      };

      await updateUser(updates);
      setSuccess(true);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (code: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹'
    };
    return symbols[code] || '$';
  };

  const getCurrencyName = (code: string) => {
    const names: Record<string, string> = {
      USD: 'US Dollar',
      EUR: 'Euro',
      GBP: 'British Pound',
      INR: 'Indian Rupee'
    };
    return names[code] || 'US Dollar';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
          {/* Profile Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Profile Information
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  defaultValue={user?.fullName}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  defaultValue={user?.company}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Preferences
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Default Currency
                </label>
                <select
                  name="currency"
                  defaultValue={user?.preferences.currency.code}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Font Family
                </label>
                <select
                  name="font"
                  defaultValue={user?.branding?.font}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="Inter">Inter</option>
                  <option value="system-ui">System Default</option>
                </select>
              </div>
            </div>
          </div>

          {/* Branding Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Branding</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Brand Color
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="color"
                    name="brandColor"
                    defaultValue={user?.branding?.color || '#4F46E5'}
                    className="h-8 w-8 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    name="brandColorHex"
                    defaultValue={user?.branding?.color || '#4F46E5'}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logo
                </label>
                <div className="mt-1 flex items-center">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
            {success && (
              <p className="text-sm text-green-600">Settings saved successfully!</p>
            )}
            <div className="flex-shrink-0">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}