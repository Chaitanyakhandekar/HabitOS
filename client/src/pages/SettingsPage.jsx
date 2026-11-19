import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  User,
  KeyRound,
  Palette,
  Clock,
  Bell,
  Download,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useThemeStore } from '../store/themeStore.js';
import settingsApi from '../services/settings.api.js';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn.js';

const TIMEZONES = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
];

export const SettingsPage = () => {
  const { user, setUser, clearUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Preference Form State
  const [weekStartsOn, setWeekStartsOn] = useState(
    user?.settings?.weekStartsOn || 'monday'
  );

  // Notification State
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notifications?.enabled ?? true
  );
  const [reminderTime, setReminderTime] = useState(
    user?.notifications?.reminderTime || '09:00'
  );
  const [quietHoursStart, setQuietHoursStart] = useState(
    user?.notifications?.quietHoursStart || '22:00'
  );
  const [quietHoursEnd, setQuietHoursEnd] = useState(
    user?.notifications?.quietHoursEnd || '07:00'
  );

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: () => settingsApi.updateProfile({ name, email, timezone }),
    onSuccess: (res) => {
      setUser(res.data.user);
      toast.success('Profile updated successfully');
    },
    onError: (err) => toast.error(err.message || 'Failed to update profile'),
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: () =>
      settingsApi.updatePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    },
    onError: (err) => toast.error(err.message || 'Failed to change password'),
  });

  // Update Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data) => settingsApi.updateSettings(data),
    onSuccess: () => {
      toast.success('Preferences saved');
    },
    onError: (err) => toast.error(err.message || 'Failed to save settings'),
  });

  // Update Notifications Mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: () =>
      settingsApi.updateNotifications({
        enabled: notificationsEnabled,
        reminderTime,
        quietHoursStart,
        quietHoursEnd,
      }),
    onSuccess: () => {
      toast.success('Notification preferences updated');
    },
    onError: (err) => toast.error(err.message || 'Failed to update notifications'),
  });

  // Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    try {
      await settingsApi.deleteAccount();
      clearUser();
      toast.success('Account deleted successfully');
      navigate('/register');
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
    }
  };

  // CSV Export Triggers
  const handleExportLogsCSV = async () => {
    try {
      const res = await settingsApi.exportLogs('csv');
      const blob = new Blob([res], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habitos-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast.success('Logs CSV exported!');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const handleExportJournalCSV = async () => {
    try {
      const res = await settingsApi.exportJournal('csv');
      const blob = new Blob([res], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habitos-journal-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast.success('Journal CSV exported!');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-text-primary">
          Account & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-text-muted mt-1">
          Manage your personal identity, timezone calculations, theme, and data exports.
        </p>
      </div>

      {/* 1. Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-indigo-500" />
            <CardTitle>Profile Details</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Select
            label="Default Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            helperText="Habit schedules and midnight thresholds are evaluated in this timezone."
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </Select>

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              onClick={() => updateProfileMutation.mutate()}
              isLoading={updateProfileMutation.isPending}
            >
              Save Profile
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Security: Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-indigo-500" />
            <CardTitle>Security & Password</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-3.5 mt-2">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => changePasswordMutation.mutate()}
              isLoading={changePasswordMutation.isPending}
            >
              Update Password
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Appearance & Calendar Format */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-indigo-500" />
            <CardTitle>Appearance & Calendar Display</CardTitle>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={cn(
                  'p-3 rounded-xl border text-xs font-bold text-center transition-all',
                  theme === 'dark'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-surface-800 text-slate-400 border-surface-700'
                )}
              >
                Dark Theme
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={cn(
                  'p-3 rounded-xl border text-xs font-bold text-center transition-all',
                  theme === 'light'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                )}
              >
                Light Theme
              </button>
            </div>
          </div>

          <div>
            <Select
              label="First Day of Week"
              value={weekStartsOn}
              onChange={(e) => {
                setWeekStartsOn(e.target.value);
                updateSettingsMutation.mutate({ weekStartsOn: e.target.value });
              }}
            >
              <option value="monday">Monday (Standard)</option>
              <option value="sunday">Sunday</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* 4. Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-surface-700/40">
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-text-primary">
                Daily Habit Reminders
              </span>
              <p className="text-[11px] text-slate-500 dark:text-text-muted">
                Receive local browser notifications at your scheduled habit reminder times.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Default Reminder Time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
            <Input
              label="Quiet Hours Start"
              type="time"
              value={quietHoursStart}
              onChange={(e) => setQuietHoursStart(e.target.value)}
            />
            <Input
              label="Quiet Hours End"
              type="time"
              value={quietHoursEnd}
              onChange={(e) => setQuietHoursEnd(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              onClick={() => updateNotificationsMutation.mutate()}
              isLoading={updateNotificationsMutation.isPending}
            >
              Save Notification Preferences
            </Button>
          </div>
        </div>
      </Card>

      {/* 5. Data Export (CSV / JSON) */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-indigo-500" />
            <CardTitle>Personal Data Export</CardTitle>
          </div>
        </CardHeader>

        <p className="text-xs text-slate-500 dark:text-text-muted mt-1 mb-4">
          Export your complete behavioral records for personal archival or spreadsheet analysis.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={handleExportLogsCSV}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Habit Check-in Logs (CSV)
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportJournalCSV}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Journal Entries (CSV)
          </Button>
        </div>
      </Card>

      {/* 6. Danger Zone: Account Deletion */}
      <Card className="border-rose-200 dark:border-rose-950/60 bg-rose-50/20 dark:bg-rose-950/10">
        <CardHeader>
          <div className="flex items-center space-x-2 text-rose-600">
            <AlertTriangle className="w-4 h-4" />
            <CardTitle className="text-rose-600">Danger Zone</CardTitle>
          </div>
        </CardHeader>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-text-primary">
              Delete Account & All Behavioral Data
            </span>
            <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">
              Permanently purges habits, historical logs, reflections, goals, and badges.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        description="This action is irreversible and purges all personal tracking data."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            Type <strong className="font-mono">DELETE</strong> in the field below to confirm:
          </p>
          <Input
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            placeholder="DELETE"
          />
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-surface-700">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Confirm Permanent Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
