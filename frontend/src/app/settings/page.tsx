'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Gear,
  User,
  Lock,
  Bell,
  Palette,
  Shield,
  SignOut,
} from '@phosphor-icons/react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Input, Modal } from '@/components/ui';
import { profileSchema, changePasswordSchema, ProfileFormData, ChangePasswordFormData } from '@/utils/validation';
import api from '@/services/api';
import classNames from 'classnames';

type Tab = 'profile' | 'security' | 'preferences';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [user, profileForm]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await api.updateProfile(data);
      await refreshUser();
      showSuccess('Profile updated successfully');
    } catch (error) {
      showError('Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    try {
      await api.changePassword(data.currentPassword, data.newPassword);
      passwordForm.reset();
      showSuccess('Password changed successfully');
    } catch (error) {
      showError('Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implement account deletion
      await logout();
      router.push('/');
    } catch (error) {
      showError('Failed to delete account');
    }
  };

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'security' as Tab, label: 'Security', icon: Lock },
    { id: 'preferences' as Tab, label: 'Preferences', icon: Palette },
  ];

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-surface-100 flex items-center gap-3">
          <Gear className="w-8 h-8 text-primary-400" weight="fill" />
          Settings
        </h1>
        <p className="text-surface-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mb-6 p-4 bg-success-500/10 border border-success-500/30 rounded-xl text-success-400 animate-fade-in">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 p-4 bg-danger-500/10 border border-danger-500/30 rounded-xl text-danger-400 animate-fade-in">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <nav className="lg:w-64 flex-shrink-0">
          <Card padding="sm" className="lg:sticky lg:top-24">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={classNames(
                      'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      activeTab === tab.id
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800'
                    )}
                  >
                    <Icon
                      className="w-5 h-5"
                      weight={activeTab === tab.id ? 'fill' : 'regular'}
                    />
                    {tab.label}
                  </button>
                );
              })}
              <div className="border-t border-surface-700 my-2 pt-2">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-surface-400 hover:text-danger-400 hover:bg-danger-500/10 transition-all"
                >
                  <SignOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </Card>
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-lg font-semibold text-surface-100 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-surface-400" />
                Profile Information
              </h2>

              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    error={profileForm.formState.errors.firstName?.message}
                    {...profileForm.register('firstName')}
                  />
                  <Input
                    label="Last Name"
                    error={profileForm.formState.errors.lastName?.message}
                    {...profileForm.register('lastName')}
                  />
                </div>

                <Input
                  label="Email"
                  value={user?.email || ''}
                  disabled
                  hint="Contact support to change your email"
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={profileForm.formState.isSubmitting}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'security' && (
            <>
              <Card>
                <h2 className="text-lg font-semibold text-surface-100 mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-surface-400" />
                  Change Password
                </h2>

                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                  <Input
                    type="password"
                    label="Current Password"
                    error={passwordForm.formState.errors.currentPassword?.message}
                    {...passwordForm.register('currentPassword')}
                  />

                  <Input
                    type="password"
                    label="New Password"
                    error={passwordForm.formState.errors.newPassword?.message}
                    {...passwordForm.register('newPassword')}
                  />

                  <Input
                    type="password"
                    label="Confirm New Password"
                    error={passwordForm.formState.errors.confirmPassword?.message}
                    {...passwordForm.register('confirmPassword')}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      isLoading={passwordForm.formState.isSubmitting}
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-danger-400 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Danger Zone
                </h2>
                <p className="text-surface-400 text-sm mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button
                  variant="danger"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Delete Account
                </Button>
              </Card>
            </>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <h2 className="text-lg font-semibold text-surface-100 mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-surface-400" />
                Preferences
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-surface-100">Email Notifications</p>
                    <p className="text-sm text-surface-400">
                      Receive email updates about your generations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-surface-700 rounded-full peer peer-checked:bg-primary-500 peer-focus:ring-2 peer-focus:ring-primary-500/20 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-surface-100">Marketing Emails</p>
                    <p className="text-sm text-surface-400">
                      News, updates, and tips from HujesisAI
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-700 rounded-full peer peer-checked:bg-primary-500 peer-focus:ring-2 peer-focus:ring-primary-500/20 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="border-t border-surface-700 pt-6">
                  <p className="font-medium text-surface-100 mb-4">Default Generation Settings</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Default Width"
                      type="number"
                      defaultValue={512}
                    />
                    <Input
                      label="Default Height"
                      type="number"
                      defaultValue={512}
                    />
                    <Input
                      label="Default Steps"
                      type="number"
                      defaultValue={30}
                    />
                    <Input
                      label="Default CFG Scale"
                      type="number"
                      step={0.5}
                      defaultValue={7}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button>Save Preferences</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account"
        description="This action is permanent and cannot be undone."
      >
        <p className="text-surface-300 mb-6">
          Are you sure you want to delete your account? All your data, prompts, and generated images will be permanently removed.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete My Account
          </Button>
        </div>
      </Modal>
    </div>
  );
}


