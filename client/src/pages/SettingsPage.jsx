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
  Sun,
  Moon,
  Sparkles,
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

  // Notification Form State
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-warm-900 dark:text-warm-100">
          Profile & Preferences
        </h1>
        <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
          Manage your personal account, timezone calculations, wellness appearance, and data exports.
        </p>
      </div>

      {/* 1. Profile Information */}
      <Card className="rounded-[26px] p-6">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-coral" />
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
      <Card className="rounded-[26px] p-6">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-coral" />
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
      <Card className="rounded-[26px] p-6">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-coral" />
            <CardTitle>Appearance & Calendar Display</CardTitle>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-xs font-bold text-warm-800 dark:text-warm-200 mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={cn(
                  'p-3 rounded-2xl border text-xs font-bold text-center transition-all flex items-center justify-center space-x-2',
                  theme === 'dark'
                    ? 'bg-coral text-white border-coral shadow-xs'
                    : 'bg-warm-100 dark:bg-surface-800 text-warm-600 dark:text-warm-300 border-warm-200 dark:border-surface-700'
                )}
              >
                <Moon className="w-4 h-4" />
                <span>Dark Theme</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={cn(
                  'p-3 rounded-2xl border text-xs font-bold text-center transition-all flex items-center justify-center space-x-2',
                  theme === 'light'
                    ? 'bg-coral text-white border-coral shadow-xs'
                    : 'bg-warm-100 text-warm-700 border-warm-200'
                )}
              >
                <Sun className="w-4 h-4" />
                <span>Light Theme</span>
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
      <Card className="rounded-[26px] p-6">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-coral" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-peach-light/40 dark:bg-surface-700/40 border border-coral/15">
            <div>
              <span className="text-xs font-bold text-warm-900 dark:text-warm-100">
                Daily Habit Reminders
              </span>
              <p className="text-[11px] text-warm-500 dark:text-warm-400">
                Receive browser notifications at your scheduled habit reminder times.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-5 h-5 accent-coral rounded-md cursor-pointer"
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

      {/* 5. Data Export & Portability */}
      <Card className="rounded-[26px] p-6">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-coral" />
            <CardTitle>Data Portability (CSV Export)</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-3 mt-2">
          <p className="text-xs text-warm-500 dark:text-warm-400 leading-relaxed">
            Download your raw behavioral tracking data as formatted CSV files. You own your data.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <Button variant="secondary" size="sm" onClick={handleExportLogsCSV}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Habit Logs (CSV)
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportJournalCSV}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Journal Reflections (CSV)
            </Button>
          </div>
        </div>
      </Card>

      {/* 6. Danger Zone */}
      <Card className="rounded-[26px] p-6 border-red-200/80 dark:border-red-950/60 bg-red-50/20 dark:bg-red-950/10">
        <CardHeader>
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </div>
        </CardHeader>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h4 className="text-xs font-bold text-warm-900 dark:text-warm-100">
              Delete Account & All Behavioral Data
            </h4>
            <p className="text-[11px] text-warm-500 dark:text-warm-400 mt-0.5">
              Permanently purges habits, check-in history, journal entries, and achievements.
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
        title="Permanently Delete Account?"
        description="This action is irreversible. All your habits, streaks, and data will be destroyed."
      >
        <div className="space-y-4">
          <p className="text-xs text-warm-600 dark:text-warm-400">
            To confirm deletion, please type <strong className="text-red-600">DELETE</strong> below:
          </p>
          <Input
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            placeholder="Type DELETE"
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
