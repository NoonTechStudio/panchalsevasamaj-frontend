// src/pages/Settings.jsx
import { useState } from "react";
import { Save, User, Lock, Bell, Database, Download } from "lucide-react";
import toast from "react-hot-toast";
import { exportFamiliesToCSV } from "../utils/export";
import { familiesAPI } from "../services/api";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    itemsPerPage: 20,
    theme: "light",
  });

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const response = await familiesAPI.getAll({ limit: 1000 });
      exportFamiliesToCSV(response.data.families);
      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem("appSettings", JSON.stringify(settings));
      setLoading(false);
      toast.success("Settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage application settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <User className="h-6 w-6 text-gray-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">
                General Settings
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600"
                    checked={settings.notifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: e.target.checked,
                      })
                    }
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable notifications
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600"
                    checked={settings.autoSave}
                    onChange={(e) =>
                      setSettings({ ...settings, autoSave: e.target.checked })
                    }
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Auto-save forms
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items per page
                </label>
                <select
                  className="form-input text-sm"
                  value={settings.itemsPerPage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      itemsPerPage: parseInt(e.target.value),
                    })
                  }
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  className="form-input text-sm"
                  value={settings.theme}
                  onChange={(e) =>
                    setSettings({ ...settings, theme: e.target.value })
                  }
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Database className="h-6 w-6 text-gray-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">
                Data Management
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <button
                  onClick={handleExport}
                  disabled={exportLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportLoading ? "Exporting..." : "Export All Data (CSV)"}
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  Export all family records to CSV format for backup.
                </p>
              </div>

              <div>
                <button className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                  <Database className="h-4 w-4 mr-2" />
                  Clear All Data
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  Warning: This will delete all records permanently.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <User className="h-6 w-6 text-gray-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">
                Your Profile
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-input text-sm"
                  defaultValue="System Administrator"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="form-input text-sm"
                  defaultValue="admin@community.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  className="form-input text-sm bg-gray-50"
                  defaultValue="Administrator"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Lock className="h-6 w-6 text-gray-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">
                Change Password
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input type="password" className="form-input text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input type="password" className="form-input text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input type="password" className="form-input text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
