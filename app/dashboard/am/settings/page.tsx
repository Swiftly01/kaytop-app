'use client';

import { useState, useCallback, useEffect } from 'react';
import { unifiedDashboardService } from '@/lib/services/unifiedDashboard';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import { Checkbox } from '@/app/_components/ui/Checkbox';
import Pagination from '@/app/_components/ui/Pagination';

type AMSettingsTab = 'account-information' | 'security-login' | 'activity-log';

interface UserProfile {
  name: string;
  phoneNumber: string;
  email: string;
  profilePicture?: string;
}

interface SecuritySettings {
  smsAuthentication: boolean;
  emailAuthentication: boolean;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ActivityLogEntry {
  id: string;
  fullName: string;
  actionPerformed: string;
  timeAndDate: string;
  selected?: boolean;
}

export default function AMSettingsPage() {
  const { toasts, removeToast, success, error } = useToast();
  const [activeTab, setActiveTab] = useState<AMSettingsTab>('account-information');
  const [isLoading, setIsLoading] = useState(false);
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'John Doe',
    phoneNumber: '+234 801 234 5678',
    email: 'john.doe@example.com',
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    smsAuthentication: true,
    emailAuthentication: false,
  });

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Activity log state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [totalActivityLogs, setTotalActivityLogs] = useState(0);
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);
  const [selectedActivityLogs, setSelectedActivityLogs] = useState<string[]>([]);

  const itemsPerPage = 10;

  // Tab configuration for AM (only 3 tabs)
  const tabs = [
    { id: 'account-information', label: 'Account Information' },
    { id: 'security-login', label: 'Security & Login' },
    { id: 'activity-log', label: 'Activity Log' },
  ];

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async () => {
    try {
      setActivityLogsLoading(true);
      
      // Mock activity logs data - in real implementation, this would call AM API
      const mockActivityLogs: ActivityLogEntry[] = [
        {
          id: '1',
          fullName: 'John Doe',
          actionPerformed: 'Approved loan application LN-001',
          timeAndDate: '2024-12-23 10:30 AM'
        },
        {
          id: '2',
          fullName: 'John Doe',
          actionPerformed: 'Reviewed branch report RPT-002',
          timeAndDate: '2024-12-23 09:15 AM'
        },
        {
          id: '3',
          fullName: 'John Doe',
          actionPerformed: 'Updated customer profile CUS-003',
          timeAndDate: '2024-12-22 04:45 PM'
        },
        {
          id: '4',
          fullName: 'John Doe',
          actionPerformed: 'Declined report RPT-004',
          timeAndDate: '2024-12-22 02:20 PM'
        },
        {
          id: '5',
          fullName: 'John Doe',
          actionPerformed: 'Logged into system',
          timeAndDate: '2024-12-22 08:00 AM'
        }
      ];

      // Filter by search query
      const filteredLogs = searchQuery 
        ? mockActivityLogs.filter(log => 
            log.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.actionPerformed.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : mockActivityLogs;

      setActivityLogs(filteredLogs);
      setTotalActivityLogs(filteredLogs.length);
      
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      error('Failed to load activity logs. Please try again.');
    } finally {
      setActivityLogsLoading(false);
    }
  }, [searchQuery, error]);

  // Load activity logs when tab changes or search query changes
  useEffect(() => {
    if (activeTab === 'activity-log') {
      fetchActivityLogs();
    }
  }, [activeTab, searchQuery, currentPage, fetchActivityLogs]);

  const handleTabChange = (tabId: AMSettingsTab) => {
    setActiveTab(tabId);
  };

  // Profile handlers
  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success('Profile updated successfully!');
    } catch (err) {
      error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Security handlers
  const handleSecurityToggle = (setting: keyof SecuritySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    success(`${setting === 'smsAuthentication' ? 'SMS' : 'Email'} authentication ${securitySettings[setting] ? 'disabled' : 'enabled'}`);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      error('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      error('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Activity log handlers
  const handleActivityLogSelection = (logId: string) => {
    setSelectedActivityLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const handleSelectAllActivityLogs = () => {
    const currentPageLogs = activityLogs.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    
    if (selectedActivityLogs.length === currentPageLogs.length) {
      setSelectedActivityLogs([]);
    } else {
      setSelectedActivityLogs(currentPageLogs.map(log => log.id));
    }
  };

  // Pagination for activity logs
  const totalPages = Math.ceil(totalActivityLogs / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActivityLogs = activityLogs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
                    <div className="w-16 h-16 bg-[#F2F4F7] rounded-full flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                          stroke="#667085"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <button className="text-[#7F56D9] hover:text-[#6941C6] font-medium">
                      Change Picture
                    </button>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#344054]">Name</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={userProfile.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                      />
                      <button className="p-2 text-[#667085] hover:text-[#344054]">
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
                  </div>

                  {/* Phone Number Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#344054]">Phone Number</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={userProfile.phoneNumber}
                        onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                      />
                      <button className="p-2 text-[#667085] hover:text-[#344054]">
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
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#344054]">Email</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                      />
                      <button className="p-2 text-[#667085] hover:text-[#344054]">
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
                    <h3 className="font-medium text-[#101828]">Two Factor Authentication</h3>
                    
                    {/* SMS Authentication */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#344054]">SMS Authentication</p>
                        <p className="text-sm text-[#667085]">Receive verification codes via SMS</p>
                      </div>
                      <button
                        onClick={() => handleSecurityToggle('smsAuthentication')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 ${
                          securitySettings.smsAuthentication ? 'bg-[#7F56D9]' : 'bg-[#DDDFE1]'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings.smsAuthentication ? 'translate-x-6' : 'translate-x-1'
                          }`}
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
                        onClick={() => handleSecurityToggle('emailAuthentication')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 ${
                          securitySettings.emailAuthentication ? 'bg-[#7F56D9]' : 'bg-[#DDDFE1]'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            securitySettings.emailAuthentication ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity-log' && (
              <div id="activity-log-panel" role="tabpanel" aria-labelledby="activity-log-tab">
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search activity logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#667085]"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
                        stroke="currentColor"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Activity Table */}
                  <div className="border border-[#EAECF0] rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#F9FAFB] border-b border-[#EAECF0]">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <Checkbox
                              checked={selectedActivityLogs.length === paginatedActivityLogs.length && paginatedActivityLogs.length > 0}
                              onCheckedChange={handleSelectAllActivityLogs}
                              aria-label="Select all activity logs"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#667085] uppercase tracking-wider">
                            Full Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#667085] uppercase tracking-wider">
                            Action Performed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#667085] uppercase tracking-wider">
                            Time & Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#EAECF0]">
                        {activityLogsLoading ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-[#667085]">
                              Loading activity logs...
                            </td>
                          </tr>
                        ) : paginatedActivityLogs.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-[#667085]">
                              No activity logs found
                            </td>
                          </tr>
                        ) : (
                          paginatedActivityLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-[#F9FAFB]">
                              <td className="px-6 py-4">
                                <Checkbox
                                  checked={selectedActivityLogs.includes(log.id)}
                                  onCheckedChange={() => handleActivityLogSelection(log.id)}
                                  aria-label={`Select activity log for ${log.fullName}`}
                                />
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-[#101828]">
                                {log.fullName}
                              </td>
                              <td className="px-6 py-4 text-sm text-[#667085]">
                                {log.actionPerformed}
                              </td>
                              <td className="px-6 py-4 text-sm text-[#667085]">
                                {log.timeAndDate}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center">
                      <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
              >
                {isLoading ? 'Changing...' : 'Change Password'}
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