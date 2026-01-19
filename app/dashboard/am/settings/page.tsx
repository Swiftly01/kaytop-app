'use client';

import { useState, useEffect, useRef } from 'react';
import { userProfileService, UserProfileData, ChangePasswordData } from '@/lib/services/userProfile';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import Image from 'next/image';

type AMSettingsTab = 'account-information' | 'security-login';

export default function AMSettingsPage() {
  const { toasts, removeToast, success, error } = useToast();
  const [activeTab, setActiveTab] = useState<AMSettingsTab>('account-information');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security settings state - Keeping purely UI for now as API doesn't support 2FA toggle
  const [securitySettings, setSecuritySettings] = useState({
    smsAuthentication: true,
    emailAuthentication: false,
  });

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsPageLoading(true);
        console.log('🔍 AM Settings - Fetching user profile...');
        const data = await userProfileService.getUserProfile();
        console.log('📦 AM Settings - User profile data:', data);
        setUserProfile(data);

        // Initialize form fields
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setMobileNumber(data.mobileNumber || '');
        setEmail(data.email || '');
        
        console.log('✅ AM Settings - Form initialized:', {
          firstName: data.firstName,
          lastName: data.lastName,
          mobileNumber: data.mobileNumber,
          email: data.email
        });
      } catch (err) {
        console.error('❌ AM Settings - Failed to fetch profile:', err);
        error('Failed to load profile information');
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchProfile();
  }, [error]);

  // Tab configuration
  const tabs = [
    { id: 'account-information', label: 'Account Information' },
    { id: 'security-login', label: 'Security & Login' },
  ];

  const handleTabChange = (tabId: AMSettingsTab) => {
    setActiveTab(tabId);
  };

  // Profile handlers
  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);

      const updatedProfile = await userProfileService.updateUserProfile({
        firstName,
        lastName,
        mobileNumber,
        email
      });

      setUserProfile(updatedProfile);
      success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const updatedProfile = await userProfileService.updateProfilePicture(file);
      setUserProfile(updatedProfile);
      success('Profile picture updated successfully');
    } catch (err: any) {
      console.error(err);
      const message = err.message || 'Failed to update profile picture';
      error(message);
    } finally {
      setIsLoading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Security handlers
  const handleSecurityToggle = (setting: keyof typeof securitySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    // Note: purely local state as backend 2FA toggle endpoint is not available
    success(`${setting === 'smsAuthentication' ? 'SMS' : 'Email'} authentication settings saved locally`);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      error('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);

      await userProfileService.changePassword(passwordData);

      success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err: any) {
      console.error(err);
      const message = err.message || 'Failed to change password';
      error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F56D9]"></div>
      </div>
    );
  }

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Settings
            </h1>
            <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)', opacity: 0.5 }}>
              Manage your account preferences and security settings
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-12">
            <nav className="relative" role="tablist" aria-label="Settings tabs">
              <div className="flex items-center gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as AMSettingsTab)}
                    className={`
                      relative font-medium transition-colors duration-200 whitespace-nowrap pb-3
                      ${activeTab === tab.id
                        ? 'text-[#7F56D9] border-b-2 border-[#7F56D9]'
                        : 'text-[#667085] hover:text-[#344054]'
                      }
                    `}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg border border-[#EAECF0] p-6">
            {/* Account Information Tab */}
            {activeTab === 'account-information' && (
              <div id="account-information-panel" role="tabpanel" aria-labelledby="account-information-tab">
                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#F2F4F7] rounded-full flex items-center justify-center overflow-hidden relative">
                      {userProfile?.profilePicture ? (
                        <Image
                          src={userProfile.profilePicture}
                          alt="Profile"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                            stroke="#667085"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <button
                        onClick={handleProfilePictureClick}
                        className="text-[#7F56D9] hover:text-[#6941C6] font-medium"
                        disabled={isLoading}
                      >
                        Change Picture
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#344054]">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                      />
                    </div>

                    {/* Last Name Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#344054]">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                      />
                    </div>
                  </div>

                  {/* Phone Number Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#344054]">Phone Number</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#344054]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                    />
                  </div>

                  {/* Update Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={isLoading}
                      className="px-6 py-2 bg-[#7F56D9] text-white rounded-lg hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security & Login Tab */}
            {activeTab === 'security-login' && (
              <div id="security-login-panel" role="tabpanel" aria-labelledby="security-login-tab">
                <div className="space-y-6">
                  {/* Change Password Section */}
                  <div className="flex items-center justify-between p-4 border border-[#EAECF0] rounded-lg">
                    <div>
                      <h3 className="font-medium text-[#101828]">Change password</h3>
                      <p className="text-sm text-[#667085]">Update your password to keep your account secure</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="p-2 text-[#667085] hover:text-[#344054]"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M6 12L10 8L6 4"
                          stroke="currentColor"
                          strokeWidth="1.33333"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Two Factor Authentication */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-[#101828]">Two Factor Authentication</h3>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FEE4E2] text-[#F04438]"
                        style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                      >
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-xs text-[#667085] -mt-3">
                      Note: This feature has not been implemented on the backend yet.
                    </p>

                    {/* SMS Authentication */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#344054]">SMS Authentication</p>
                        <p className="text-sm text-[#667085]">Receive verification codes via SMS</p>
                      </div>
                      <button
                        disabled
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-not-allowed bg-[#DDDFE1] opacity-60"
                        aria-label="SMS Authentication (Not yet implemented)"
                      >
                        <span
                          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"
                        />
                      </button>
                    </div>

                    {/* Email Authentication */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#344054]">Email Authentication</p>
                        <p className="text-sm text-[#667085]">Receive verification codes via email</p>
                      </div>
                      <button
                        disabled
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-not-allowed bg-[#DDDFE1] opacity-60"
                        aria-label="Email Authentication (Not yet implemented)"
                      >
                        <span
                          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(52, 64, 84, 0.7)',
            backdropFilter: 'blur(16px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPasswordModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-[#101828] mb-4">Change Password</h3>

            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#667085]"
                  >
                    {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#667085]"
                  >
                    {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmNewPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#667085]"
                  >
                    {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 border border-[#D0D5DD] text-[#344054] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-[#7F56D9] text-white rounded-lg hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}