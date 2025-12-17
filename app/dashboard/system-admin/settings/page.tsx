'use client';

import { useState, useCallback, useEffect } from 'react';
import { userService } from '@/lib/services/users';
import { activityLogsService } from '@/lib/services/activityLogs';
import { systemSettingsService } from '@/lib/services/systemSettings';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import { Checkbox } from '@/app/_components/ui/Checkbox';
import EditRoleModal from '@/app/_components/ui/EditRoleModal';
import CreateAdminModal from '@/app/_components/ui/CreateAdminModal';
import GlobalSettingsModal from '@/app/_components/ui/GlobalSettingsModal';
import AlertRulesModal from '@/app/_components/ui/AlertRulesModal';
import ReportTemplateModal from '@/app/_components/ui/ReportTemplateModal';
import FileUpload from '@/app/_components/ui/FileUpload';
import type { ActivityLog, SystemSettings } from '@/lib/api/types';

type SettingsTab = 'account-information' | 'security-login' | 'activity-log' | 'permissions-users' | 'configuration';

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

interface RoleUserData {
  id: string;
  name: string;
  email: string;
  role: 'HQ' | 'AM' | 'CO' | 'BM';
  permissions: string[];
  avatar?: string;
  status: 'active' | 'inactive';
  lastActive?: string;
}

interface AlertRulesData {
  missedPayments: boolean;
  missedReports: boolean;
  dailyEmailSummary: boolean;
  customParameters: string[];
}

export default function SettingsPage() {
  const { toasts, removeToast, success, error } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account-information');
  const [isLoading, setIsLoading] = useState(false);
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Jackson Wallace',
    phoneNumber: '070 0000 0000',
    email: 'hello@jackson5.com',
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
  const [selectAll, setSelectAll] = useState(false);

  // Transform API ActivityLog to ActivityLogEntry format
  const transformActivityLog = (log: ActivityLog): ActivityLogEntry => ({
    id: log.id,
    fullName: log.userFullName,
    actionPerformed: log.action,
    timeAndDate: new Date(log.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }),
    selected: false
  });

  // Fetch activity logs from API
  const fetchActivityLogs = async () => {
    try {
      setActivityLogsLoading(true);
      
      const response = await activityLogsService.getActivityLogs({
        search: searchQuery || undefined,
        page: currentPage,
        limit: 10,
      });

      const transformedLogs = response.data.map(transformActivityLog);
      setActivityLogs(transformedLogs);
      setTotalActivityLogs(response.pagination.total);

    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      error('Failed to load activity logs. Please try again.');
    } finally {
      setActivityLogsLoading(false);
    }
  };

  // Load activity logs when component mounts or search/page changes
  useEffect(() => {
    if (activeTab === 'activity-log') {
      fetchActivityLogs();
    }
  }, [activeTab, searchQuery, currentPage]);

  // Configuration settings state
  const [configSettings, setConfigSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    language: 'en',
    timeZone: 'utc',
    dateFormat: 'mdy',
  });

  // Edit Role Modal state
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RoleUserData | null>(null);

  // Create Admin Modal state
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);

  // Global Settings Modal state
  const [showGlobalSettingsModal, setShowGlobalSettingsModal] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    interestRate: '5.5',
    loanDuration: '12'
  });

  // Report Template Modal state
  const [showReportTemplateModal, setShowReportTemplateModal] = useState(false);
  const [reportTemplateSettings, setReportTemplateSettings] = useState({
    thingsToReport: {
      collections: false,
      savings: false,
      customers: false,
      missedPayments: false
    },
    newParameter: ''
  });

  // Alert Rules Modal state
  const [showAlertRulesModal, setShowAlertRulesModal] = useState(false);
  
  // Profile Picture Upload Modal state
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  
  const [alertRulesSettings, setAlertRulesSettings] = useState<AlertRulesData>({
    missedPayments: false,
    missedReports: false,
    dailyEmailSummary: false,
    customParameters: []
  });

  // Users data for roles and permissions
  const [usersData, setUsersData] = useState<RoleUserData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch users data on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await userService.getAllUsers({ page: 1, limit: 100 });
        
        // Transform API users to RoleUserData format
        const transformedUsers: RoleUserData[] = response.data.map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role === 'system_admin' ? 'HQ' : user.role === 'branch_manager' ? 'BM' : 'CO',
          permissions: user.role === 'system_admin' 
            ? ['Services', 'Clients', 'Subscriptions', 'Reports', 'Analytics']
            : user.role === 'branch_manager'
            ? ['Services', 'Clients', 'Subscriptions', 'Branch Management']
            : ['Services', 'Clients'],
          status: user.verificationStatus === 'verified' ? 'active' : 'inactive',
          lastActive: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'
        }));
        
        setUsersData(transformedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        error('Failed to load users data');
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [error]);



  const tabs = [
    { id: 'account-information', label: 'Account Information' },
    { id: 'security-login', label: 'Security & Login' },
    { id: 'activity-log', label: 'Activity Log' },
    { id: 'permissions-users', label: 'Permissions and users' },
    { id: 'configuration', label: 'Configuration' },
  ];

  const handleTabChange = (tabId: SettingsTab) => {
    setActiveTab(tabId);
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Profile updated successfully!');
    } catch (err) {
      error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePictureChange = () => {
    setShowProfilePictureModal(true);
  };

  const handleProfilePictureUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      
      // Update the user profile with the new picture
      setUserProfile(prev => ({
        ...prev,
        profilePicture: previewUrl
      }));
      
      // TODO: In a real app, upload to server here
      // For now, we'll just show success message
      success('Profile picture updated successfully!');
      setShowProfilePictureModal(false);
    }
  };

  const handleProfilePictureError = (errorMessage: string) => {
    error(`Failed to upload profile picture: ${errorMessage}`);
  };

  const handleSecurityToggle = (setting: keyof SecuritySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    success(`${setting === 'smsAuthentication' ? 'SMS' : 'Email'} authentication ${securitySettings[setting] ? 'disabled' : 'enabled'}`);
  };

  const handlePasswordChange = (field: keyof PasswordChangeData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
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

  const openPasswordModal = () => {
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  // Activity log handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setActivityLogs(prev => prev.map(log => ({ ...log, selected: checked })));
  };

  const handleSelectLog = (id: string) => {
    setActivityLogs(prev => {
      const updated = prev.map(log => 
        log.id === id ? { ...log, selected: !log.selected } : log
      );
      const allSelected = updated.every(log => log.selected);
      setSelectAll(allSelected);
      return updated;
    });
  };

  // Configuration handlers
  const handleConfigToggle = (setting: 'emailNotifications' | 'pushNotifications') => {
    setConfigSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    success(`${setting === 'emailNotifications' ? 'Email' : 'Push'} notifications ${configSettings[setting] ? 'disabled' : 'enabled'}`);
  };

  const handleConfigChange = (setting: 'language' | 'timeZone' | 'dateFormat', value: string) => {
    setConfigSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveConfiguration = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Configuration saved successfully!');
    } catch (err) {
      error('Failed to save configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    success('Data export started. You will receive an email when ready.');
  };

  const handleClearCache = () => {
    success('System cache cleared successfully!');
  };

  const handleCreateAdmin = () => {
    setShowCreateAdminModal(true);
  };

  const handleCloseCreateAdminModal = () => {
    setShowCreateAdminModal(false);
  };

  const handleSaveNewAdmin = async (adminData: any) => {
    // Generate a new ID for the admin
    const newId = (usersData.length + 1).toString();
    
    // Create new admin user object
    const newAdmin = {
      id: newId,
      name: adminData.name,
      email: adminData.email,
      role: adminData.role,
      permissions: adminData.permissions,
      status: 'active' as const
    };

    // Add to users data
    setUsersData(prev => [...prev, newAdmin]);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Global Settings handlers
  const handleOpenGlobalSettings = useCallback(() => {
    setShowGlobalSettingsModal(true);
  }, []);

  const handleCloseGlobalSettings = useCallback(() => {
    setShowGlobalSettingsModal(false);
  }, []);

  const handleSaveGlobalSettings = useCallback(async (data: { interestRate: string; loanDuration: string }) => {
    setGlobalSettings(data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);

  // Report Template handlers
  const handleOpenReportTemplate = useCallback(() => {
    setShowReportTemplateModal(true);
  }, []);

  const handleCloseReportTemplate = useCallback(() => {
    setShowReportTemplateModal(false);
  }, []);

  const handleSaveReportTemplate = useCallback(async (data: { thingsToReport: { collections: boolean; savings: boolean; customers: boolean; missedPayments: boolean }; newParameter: string }) => {
    setReportTemplateSettings(data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);

  // Alert Rules handlers
  const handleOpenAlertRules = useCallback(() => {
    setShowAlertRulesModal(true);
  }, []);

  const handleCloseAlertRules = useCallback(() => {
    setShowAlertRulesModal(false);
  }, []);

  const handleSaveAlertRules = useCallback(async (data: AlertRulesData) => {
    setAlertRulesSettings(data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);

  const handleEditUser = (userId: string) => {
    const user = usersData.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowEditRoleModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditRoleModal(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (updatedUserData: RoleUserData) => {
    // Update the user in the users array
    setUsersData(prev => prev.map(user => 
      user.id === updatedUserData.id ? updatedUserData : user
    ));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalActivityLogs / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          {/* Tab Navigation */}
          <div className="mb-12">
            <nav className="relative" role="tablist" aria-label="Settings tabs">
              <div className="flex items-center gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as SettingsTab)}
                    className={`
                      relative font-medium transition-colors duration-200 whitespace-nowrap pb-3
                      focus:outline-none
                      ${activeTab === tab.id 
                        ? 'text-[#7A62EB]' 
                        : 'text-[#ABAFB3] hover:text-[#888F9B]'
                      }
                    `}
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: '16px',
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                    id={`${tab.id}-tab`}
                  >
                    {tab.label}
                    
                    {/* Active Indicator - Bottom Underline */}
                    {activeTab === tab.id && (
                      <span
                        className="absolute left-0 right-0 bottom-0 mx-auto"
                        style={{
                          width: '99px',
                          height: '2px',
                          backgroundColor: '#7A62EB',
                          borderRadius: '20px',
                          display: 'block',
                        }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Content Area */}
          <div className="relative">
            {/* Main Content Card */}
            <div 
              className="bg-white rounded-[5px]"
              style={{
                width: '941px',
                minHeight: '611px',
              }}
            >
              {/* Account Information Tab Content */}
              {activeTab === 'account-information' && (
                <div className="p-8">
                  {/* Header */}
                  <h1 
                    className="font-bold mb-8"
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      lineHeight: '32px',
                      letterSpacing: '0.011em',
                      color: '#021C3E',
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    Account Information
                  </h1>

                  {/* Profile Picture Section */}
                  <div className="mb-8">
                    <div 
                      className="bg-gray-300 rounded-full mb-4"
                      style={{
                        width: '60px',
                        height: '60px',
                        backgroundImage: userProfile.profilePicture ? `url(${userProfile.profilePicture})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <button
                      onClick={handleProfilePictureChange}
                      className="text-[#7A62EB] hover:text-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 rounded-md"
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        lineHeight: '16px',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                      }}
                    >
                      Change Picture
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-8">
                    {/* Name Field */}
                    <div>
                      <label 
                        className="block mb-2"
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '16px',
                          color: '#01112C',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      >
                        Name
                      </label>
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={userProfile.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none"
                          style={{
                            fontSize: '16px',
                            fontWeight: 400,
                            lineHeight: '16px',
                            color: '#767D94',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        />
                        <button 
                          className="ml-4 opacity-80 hover:opacity-100 transition-opacity"
                          aria-label="Edit name"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path 
                              d="M7.5 12.5L12.5 7.5M12.5 7.5L10 5L15 10L12.5 12.5M12.5 7.5L10 10"
                              stroke="#000000" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                      <div 
                        className="mt-4 opacity-10"
                        style={{
                          width: '100%',
                          height: '0.8px',
                          backgroundColor: '#000000',
                        }}
                      />
                    </div>

                    {/* Phone Number Field */}
                    <div>
                      <label 
                        className="block mb-2"
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '16px',
                          color: '#01112C',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={userProfile.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="w-full bg-transparent border-none outline-none"
                        style={{
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '16px',
                          color: '#767D94',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      />
                      <div 
                        className="mt-4 opacity-10"
                        style={{
                          width: '100%',
                          height: '0.8px',
                          backgroundColor: '#000000',
                        }}
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label 
                        className="block mb-2"
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '16px',
                          color: '#01112C',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full bg-transparent border-none outline-none"
                        style={{
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '16px',
                          color: '#767D94',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      />
                    </div>
                  </div>

                  {/* Update Button */}
                  <div className="mt-16">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={isLoading}
                      className="w-full bg-[#7F56D9] hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 shadow-sm"
                      style={{
                        height: '44px',
                        fontSize: '16px',
                        fontWeight: 600,
                        lineHeight: '24px',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                        border: '1px solid #7F56D9',
                        boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                      }}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        'Update'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Security & Login Tab Content */}
              {activeTab === 'security-login' && (
                <div className="p-8">
                  {/* Header */}
                  <h1 
                    className="font-bold mb-8"
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      lineHeight: '32px',
                      letterSpacing: '0.011em',
                      color: '#021C3E',
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    Security
                  </h1>

                  {/* Change Password Section */}
                  <div className="mb-8">
                    <button
                      onClick={openPasswordModal}
                      className="flex items-center justify-between w-full group hover:bg-gray-50 transition-colors rounded-md p-2 -m-2"
                    >
                      <div>
                        <h3 
                          className="text-left mb-2"
                          style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            lineHeight: '16px',
                            color: '#01112C',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          Change password
                        </h3>
                        <p 
                          className="text-left"
                          style={{
                            fontSize: '16px',
                            fontWeight: 400,
                            lineHeight: '16px',
                            color: '#767D94',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          Is your password compromised, change it here
                        </p>
                      </div>
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 20 20" 
                        fill="none"
                        className="opacity-80 group-hover:opacity-100 transition-opacity"
                      >
                        <path 
                          d="M7.5 15L12.5 10L7.5 5" 
                          stroke="#000000" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    
                    {/* Divider */}
                    <div 
                      className="mt-6 opacity-10"
                      style={{
                        width: '100%',
                        height: '0.8px',
                        backgroundColor: '#000000',
                      }}
                    />
                  </div>

                  {/* Two Factor Authentication Section */}
                  <div>
                    <h3 
                      className="mb-6"
                      style={{
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '16px',
                        color: '#01112C',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                      }}
                    >
                      Two Factor Authentication
                    </h3>

                    {/* SMS Authentication */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        {/* SMS Icon */}
                        <div className="w-8 h-8 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect x="5" y="4" width="14" height="16" rx="2" stroke="#767D94" strokeWidth="2"/>
                            <path d="M9 9h6M9 13h6" stroke="#767D94" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <span 
                          style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            lineHeight: '22px',
                            color: '#767D94',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          SMS Authentication
                        </span>
                      </div>
                      
                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleSecurityToggle('smsAuthentication')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 ${
                          securitySettings.smsAuthentication ? 'bg-[#7A62EB]' : 'bg-[#DDDFE1]'
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
                      <div className="flex items-center gap-4">
                        {/* Email Icon */}
                        <div className="w-8 h-8 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#767D94" strokeWidth="2"/>
                            <polyline points="22,6 12,13 2,6" stroke="#767D94" strokeWidth="2"/>
                          </svg>
                        </div>
                        <span 
                          style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            lineHeight: '22px',
                            color: '#767D94',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          Email Authentication
                        </span>
                      </div>
                      
                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleSecurityToggle('emailAuthentication')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 ${
                          securitySettings.emailAuthentication ? 'bg-[#7A62EB]' : 'bg-[#DDDFE1]'
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
              )}

              {/* Activity Log Tab Content */}
              {activeTab === 'activity-log' && (
                <div className="p-8">
                  {/* Header */}
                  <h1 
                    className="font-bold mb-8"
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      lineHeight: '32px',
                      letterSpacing: '0.011em',
                      color: '#021C3E',
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    Activity log
                  </h1>

                  {/* Search Bar */}
                  <div className="mb-6 relative">
                    <div className="flex items-center">
                      <svg 
                        width="17" 
                        height="17" 
                        viewBox="0 0 17 17" 
                        fill="none"
                        className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      >
                        <path 
                          d="M7.5 13.5C10.8137 13.5 13.5 10.8137 13.5 7.5C13.5 4.18629 10.8137 1.5 7.5 1.5C4.18629 1.5 1.5 4.18629 1.5 7.5C1.5 10.8137 4.18629 13.5 7.5 13.5Z" 
                          stroke="#464A53" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                        <path 
                          d="M13.5 13.5L15.5 15.5" 
                          stroke="#464A53" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-64 bg-transparent border-none outline-none"
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '16px',
                          color: '#464A53',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      />
                    </div>
                    <div 
                      className="w-64 h-px mt-2"
                      style={{
                        backgroundColor: 'rgba(221, 223, 225, 0.5)',
                      }}
                    />
                  </div>

                  {/* Table */}
                  <div className="border border-[#DDDFE1] rounded-sm">
                    {/* Table Header */}
                    <div 
                      className="flex items-center px-5 py-3 border-b border-[#DDDFE1]"
                      style={{
                        backgroundColor: 'rgba(106, 112, 126, 0.0001)',
                      }}
                    >
                      <div className="flex items-center w-8">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                        />
                      </div>
                      <div className="w-56 ml-4">
                        <span 
                          style={{
                            fontSize: '14.4px',
                            fontWeight: 500,
                            lineHeight: '43px',
                            color: '#464A53',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          Full Name
                        </span>
                      </div>
                      <div className="flex-1 px-4">
                        <span 
                          style={{
                            fontSize: '14.4px',
                            fontWeight: 500,
                            lineHeight: '43px',
                            color: '#464A53',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          Action Performed
                        </span>
                      </div>
                      <div className="w-64">
                        <span 
                          style={{
                            fontSize: '14.4px',
                            fontWeight: 500,
                            lineHeight: '43px',
                            color: '#464A53',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          Time & Date
                        </span>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div>
                      {activityLogsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7F56D9]"></div>
                        </div>
                      ) : activityLogs.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                          <span 
                            style={{
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#6A707E',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                            }}
                          >
                            No activity logs found
                          </span>
                        </div>
                      ) : (
                        activityLogs.map((log, index) => (
                          <div key={log.id}>
                            <div className="flex items-center px-5 py-3">
                              <div className="flex items-center w-8">
                                <Checkbox
                                  checked={log.selected || false}
                                  onCheckedChange={() => handleSelectLog(log.id)}
                                />
                              </div>
                              <div className="w-56 ml-4">
                                <span 
                                  style={{
                                    fontSize: '12.8px',
                                    fontWeight: 700,
                                    lineHeight: '19px',
                                    color: '#6A707E',
                                    fontFamily: 'Open Sauce Sans, sans-serif',
                                  }}
                                >
                                  {log.fullName}
                                </span>
                              </div>
                              <div className="flex-1 px-4">
                                <span 
                                  style={{
                                    fontSize: '12.8px',
                                    fontWeight: 500,
                                    lineHeight: '19px',
                                    color: '#6A707E',
                                    fontFamily: 'Open Sauce Sans, sans-serif',
                                  }}
                                >
                                  {log.actionPerformed}
                                </span>
                              </div>
                              <div className="w-64">
                                <span 
                                  style={{
                                    fontSize: '12.8px',
                                    fontWeight: 500,
                                    lineHeight: '19px',
                                    color: '#ABAFB3',
                                    fontFamily: 'Open Sauce Sans, sans-serif',
                                  }}
                                >
                                  {log.timeAndDate}
                                </span>
                              </div>
                            </div>
                            {index < activityLogs.length - 1 && (
                              <div 
                                className="h-px mx-5"
                                style={{ backgroundColor: '#DDDFE1' }}
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center border border-[#D0D5DD] rounded-lg shadow-sm">
                      {/* Previous Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-r border-[#D0D5DD] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          lineHeight: '20px',
                          color: '#344054',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M12.5 15L7.5 10L12.5 5" stroke="#344054" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Previous
                      </button>

                      {/* Page Numbers */}
                      {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => {
                        const pageNum = i + 1;
                        const isActive = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 border-r border-[#D0D5DD] transition-colors ${
                              isActive 
                                ? 'bg-[#F9FAFB] text-[#1D2939]' 
                                : 'bg-white text-[#344054] hover:bg-gray-50'
                            }`}
                            style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              lineHeight: '20px',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Next Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          lineHeight: '20px',
                          color: '#344054',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      >
                        Next
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M7.5 15L12.5 10L7.5 5" stroke="#344054" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Tab Contents - Placeholder */}

              {activeTab === 'permissions-users' && (
                <div 
                  style={{
                    padding: '32px',
                    width: '941px',
                    minHeight: '611px',
                  }}
                >
                  {/* Header Section */}
                  <div 
                    className="flex items-center justify-between" 
                    style={{ marginBottom: '48px' }}
                  >
                    <div>
                      <h1 
                        style={{
                          fontSize: '24px',
                          fontWeight: 700,
                          lineHeight: '32px',
                          letterSpacing: '0.011em',
                          color: '#021C3E',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                          marginBottom: '8px',
                        }}
                      >
                        Roles & Permission
                      </h1>
                      <p 
                        style={{
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '20px',
                          color: '#767D94',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                          width: '382px',
                          height: '40px',
                        }}
                      >
                        These are the accounts with access to LAAS admin and their roles as provided by the super admin
                      </p>
                    </div>
                    <button
                      onClick={handleCreateAdmin}
                      className="hover:bg-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2"
                      style={{
                        width: '120.45px',
                        height: '34px',
                        background: '#7A62EB',
                        border: '0.5px solid #7A62EB',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        lineHeight: '16px',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      Create Admin
                    </button>
                  </div>

                  {/* Users List */}
                  <div>
                    {/* Initial Divider Line */}
                    <div 
                      style={{
                        width: '588px',
                        height: '0px',
                        opacity: 0.1,
                        border: '0.8px solid #000000',
                      }}
                    />

                    {/* User 1 - Tarry Benzar */}
                    <div 
                      className="flex items-center justify-between" 
                      style={{ paddingTop: '32px', paddingBottom: '32px' }}
                    >
                      <div className="flex items-center" style={{ gap: '16px' }}>
                        <div 
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#237385',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            fontWeight: 500,
                            lineHeight: '16px',
                            letterSpacing: '0.03em',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                            color: '#FFFFFF',
                          }}
                        >
                          TB
                        </div>
                        <div>
                          <div className="flex items-center" style={{ gap: '8px', marginBottom: '3px' }}>
                            <span 
                              style={{
                                fontSize: '16px',
                                fontWeight: 500,
                                lineHeight: '16px',
                                color: '#000000',
                                opacity: 0.9,
                                fontFamily: 'Open Sauce Sans, sans-serif',
                              }}
                            >
                              Tarry Benzar
                            </span>
                            <div
                              style={{
                                padding: '3px 6px',
                                background: '#FBEFF8',
                                borderRadius: '3px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 400,
                                  lineHeight: '10px',
                                  fontFamily: 'Open Sauce Sans, sans-serif',
                                  color: '#AB659C',
                                }}
                              >
                                HQ
                              </span>
                            </div>
                          </div>
                          <p 
                            style={{
                              fontSize: '14px',
                              fontWeight: 400,
                              lineHeight: '16px',
                              color: '#767D94',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                              marginBottom: '7px',
                            }}
                          >
                            example@acumen.com
                          </p>
                          <p 
                            style={{
                              fontSize: '14px',
                              fontWeight: 500,
                              lineHeight: '17px',
                              color: '#767D94',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                              marginBottom: '8px',
                            }}
                          >
                            Services, Clients, Subscriptions
                          </p>
                          <p 
                            style={{
                              fontSize: '12px',
                              fontWeight: 400,
                              lineHeight: '15px',
                              color: '#000000',
                              opacity: 0.6,
                              fontFamily: 'Open Sauce Sans, sans-serif',
                            }}
                          >
                            Last Active on January 2, 2022
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditUser('1')}
                        className="hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2"
                        style={{
                          width: '78px',
                          height: '38px',
                          border: '1px solid rgba(124, 134, 161, 0.4)',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: 400,
                          lineHeight: '16px',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000000',
                          opacity: 0.7,
                          background: 'transparent',
                        }}
                      >
                        Edit
                      </button>
                    </div>

                    {/* Divider Line */}
                    <div 
                      style={{
                        width: '588px',
                        height: '0px',
                        opacity: 0.1,
                        border: '0.8px solid #000000',
                      }}
                    />

                    {/* User 2 - Arlene McCoy */}
                    <div 
                      className="flex items-center justify-between" 
                      style={{ paddingTop: '32px', paddingBottom: '32px' }}
                    >
                      <div className="flex items-center" style={{ gap: '16px' }}>
                        <div 
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'url(.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div>
                          <div className="flex items-center" style={{ gap: '8px', marginBottom: '3px' }}>
                            <span 
                              style={{
                                fontSize: '16px',
                                fontWeight: 500,
                                lineHeight: '16px',
                                color: '#000000',
                                opacity: 0.9,
                                fontFamily: 'Open Sauce Sans, sans-serif',
                              }}
                            >
                              Arlene McCoy
                            </span>
                            <div
                              style={{
                                padding: '3px 6px',
                                background: '#ECF0D9',
                                borderRadius: '3px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 400,
                                  lineHeight: '10px',
                                  fontFamily: 'Open Sauce Sans, sans-serif',
                                  color: '#4C5F00',
                                }}
                              >
                                AM
                              </span>
                            </div>
                          </div>
                          <p 
                            style={{
                              fontSize: '14px',
                              fontWeight: 400,
                              lineHeight: '16px',
                              color: '#767D94',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                              marginBottom: '7px',
                            }}
                          >
                            example@acumen.com
                          </p>
                          <p 
                            style={{
                              fontSize: '14px',
                              fontWeight: 500,
                              lineHeight: '17px',
                              color: '#767D94',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                              marginBottom: '8px',
                            }}
                          >
                            Services, Clients, Subscriptions
                          </p>
                          <p 
                            style={{
                              fontSize: '12px',
                              fontWeight: 400,
                              lineHeight: '15px',
                              color: '#00BE63',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                            }}
                          >
                            Active Now
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditUser('2')}
                        className="hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2"
                        style={{
                          width: '78px',
                          height: '38px',
                          border: '1px solid rgba(124, 134, 161, 0.4)',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: 400,
                          lineHeight: '16px',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000000',
                          opacity: 0.7,
                          background: 'transparent',
                        }}
                      >
                        Edit
                      </button>
                    </div>

                    {/* Divider Line */}
                    <div 
                      style={{
                        width: '588px',
                        height: '0px',
                        opacity: 0.1,
                        border: '0.8px solid #000000',
                      }}
                    />

                    {/* User 3 - Annette Black */}
                    <div 
                      className="flex items-center justify-between" 
                      style={{ paddingTop: '32px', paddingBottom: '32px' }}
                    >
                      <div className="flex items-center" style={{ gap: '16px' }}>
                        <div 
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'url(.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div>
                          <div className="flex items-center" style={{ gap: '8px', marginBottom: '3px' }}>
                            <span 
                              style={{
                                fontSize: '16px',
                                fontWeight: 500,
                                lineHeight: '16px',
                                color: '#000000',
                                opacity: 0.9,
                                fontFamily: 'Open Sauce Sans, sans-serif',
                              }}
                            >
                              Annette Black
                            </span>
                            <div
                              style={{
                                padding: '3px 6px',
                                background: '#DEDAF3',
                                borderRadius: '3px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 400,
                                  lineHeight: '10px',
                                  fontFamily: 'Open Sauce Sans, sans-serif',
                                  color: '#462ACD',
                                }}
                              >
                                CO
                              </span>
                            </div>
                          </div>
                          <p 
                            style={{
                              fontSize: '14px',
                              fontWeight: 400,
                              lineHeight: '16px',
                              color: '#767D94',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                              marginBottom: '7px',
                            }}
                          >
                            example@acumen.com
                          </p>
                          <p 
                            style={{
                              fontSize: '14px',
                              fontWeight: 500,
                              lineHeight: '17px',
                              color: '#767D94',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                              marginBottom: '8px',
                            }}
                          >
                            Services, Clients, Subscriptions
                          </p>
                          <p 
                            style={{
                              fontSize: '12px',
                              fontWeight: 400,
                              lineHeight: '15px',
                              color: '#000000',
                              opacity: 0.6,
                              fontFamily: 'Open Sauce Sans, sans-serif',
                            }}
                          >
                            Last Active on January 2, 2022
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditUser('3')}
                        className="hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2"
                        style={{
                          width: '78px',
                          height: '38px',
                          border: '1px solid rgba(124, 134, 161, 0.4)',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: 400,
                          lineHeight: '16px',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000000',
                          opacity: 0.7,
                          background: 'transparent',
                        }}
                      >
                        Edit
                      </button>
                    </div>

                    {/* Divider Line */}
                    <div 
                      style={{
                        width: '588px',
                        height: '0px',
                        opacity: 0.1,
                        border: '0.8px solid #000000',
                      }}
                    />

                    {/* User 4 - Jenny Wilson */}
                    <div 
                      className="flex items-center justify-between" 
                      style={{ paddingTop: '32px', paddingBottom: '32px' }}
                    >
                      <div className="flex items-center" style={{ gap: '16px' }}>
                        <div 
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'url(.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div>
                          <div className="flex items-center" style={{ gap: '8px', marginBottom: '3px' }}>
                            <span 
                              style={{
                                fontSize: '16px',
                                fontWeight: 500,
                                lineHeight: '16px',
                                color: '#000000',
                                opacity: 0.9,
                                fontFamily: 'Open Sauce Sans, sans-serif',
                              }}
                            >
                              Jenny Wilson
                            </span>
                            <div
                              style={{
                                padding: '3px 6px',
                                background: '#FBEFF8',
                                borderRadius: '3px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 400,
                                  lineHeight: '10px',
                                  fontFamily: 'Open Sauce Sans, sans-serif',
                                  color: '#AB659C',
                                }}
                              >
                                BM
                              </span>
                            </div>
                          </div>
                          <p 
                            style={{
                              fontSize: '14px',
                              fontWeight: 400,
                              lineHeight: '16px',
                              color: '#767D94',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                              marginBottom: '7px',
                            }}
                          >
                            example@acumen.com
                          </p>
                          <p 
                            style={{
                              fontSize: '14px',
                              fontWeight: 500,
                              lineHeight: '17px',
                              color: '#767D94',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                              marginBottom: '8px',
                            }}
                          >
                            Services, Clients, Subscriptions
                          </p>
                          <p 
                            style={{
                              fontSize: '12px',
                              fontWeight: 400,
                              lineHeight: '15px',
                              color: '#00BE63',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                            }}
                          >
                            Active Now
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditUser('4')}
                        className="hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2"
                        style={{
                          width: '78px',
                          height: '38px',
                          border: '1px solid rgba(124, 134, 161, 0.4)',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: 400,
                          lineHeight: '16px',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000000',
                          opacity: 0.7,
                          background: 'transparent',
                        }}
                      >
                        Edit
                      </button>
                    </div>

                    {/* Divider Line */}
                    <div 
                      style={{
                        width: '588px',
                        height: '0px',
                        opacity: 0.1,
                        border: '0.8px solid #000000',
                      }}
                    />

                    {/* User 5 - Theresa Webb */}
                    <div 
                      className="flex items-center justify-between" 
                      style={{ paddingTop: '32px', paddingBottom: '32px' }}
                    >
                      <div className="flex items-center" style={{ gap: '16px' }}>
                        <div 
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#237385',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            fontWeight: 500,
                            lineHeight: '16px',
                            letterSpacing: '0.03em',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                            color: '#FFFFFF',
                          }}
                        >
                          TW
                        </div>
                        <div>
                          <div className="flex items-center" style={{ gap: '8px', marginBottom: '3px' }}>
                            <span 
                              style={{
                                fontSize: '16px',
                                fontWeight: 500,
                                lineHeight: '16px',
                                color: '#000000',
                                opacity: 0.9,
                                fontFamily: 'Open Sauce Sans, sans-serif',
                              }}
                            >
                              Theresa Webb
                            </span>
                            <div
                              style={{
                                padding: '3px 6px',
                                background: '#DEDAF3',
                                borderRadius: '3px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 400,
                                  lineHeight: '10px',
                                  fontFamily: 'Open Sauce Sans, sans-serif',
                                  color: '#462ACD',
                                }}
                              >
                                CO
                              </span>
                            </div>
                          </div>
                          <p 
                            style={{
                              fontSize: '14px',
                              fontWeight: 400,
                              lineHeight: '16px',
                              color: '#767D94',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                              marginBottom: '7px',
                            }}
                          >
                            example@acumen.com
                          </p>
                          <p 
                            style={{
                              fontSize: '14px',
                              fontWeight: 500,
                              lineHeight: '17px',
                              color: '#767D94',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                              marginBottom: '8px',
                            }}
                          >
                            Services, Clients, Subscriptions
                          </p>
                          <p 
                            style={{
                              fontSize: '12px',
                              fontWeight: 400,
                              lineHeight: '15px',
                              color: '#00BE63',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                            }}
                          >
                            Active Now
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditUser('5')}
                        className="hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2"
                        style={{
                          width: '78px',
                          height: '38px',
                          border: '1px solid rgba(124, 134, 161, 0.4)',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: 400,
                          lineHeight: '16px',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000000',
                          opacity: 0.7,
                          background: 'transparent',
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'configuration' && (
                <div 
                  style={{
                    padding: '32px',
                    width: '941px',
                    minHeight: '611px',
                  }}
                >
                  {/* Header */}
                  <h1 
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      lineHeight: '32px',
                      letterSpacing: '0.011em',
                      color: '#021C3E',
                      fontFamily: 'Open Sauce Sans, sans-serif',
                      marginBottom: '48px',
                    }}
                  >
                    Configurations
                  </h1>

                  {/* Configuration Sections */}
                  <div>
                    {/* Set Global Defaults Section */}
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors rounded-md p-2 -m-2"
                      onClick={handleOpenGlobalSettings}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenGlobalSettings();
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label="Open global settings configuration"
                      style={{ paddingTop: '32px', paddingBottom: '32px' }}
                    >
                      <div className="flex-1 max-w-[244px]">
                        <h3 
                          style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            lineHeight: '16px',
                            color: '#01112C',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                            marginBottom: '8px',
                          }}
                        >
                          Set Global Defaults
                        </h3>
                        <p 
                          style={{
                            fontSize: '16px',
                            fontWeight: 400,
                            lineHeight: '16px',
                            color: '#767D94',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          Set interest rate and loan terms
                        </p>
                      </div>
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 20 20" 
                        fill="none"
                        style={{ opacity: 0.8 }}
                      >
                        <path 
                          d="M7.5 15L12.5 10L7.5 5" 
                          stroke="#000000" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* Divider Line */}
                    <div 
                      style={{
                        width: '469px',
                        height: '0px',
                        opacity: 0.1,
                        border: '0.8px solid #000000',
                      }}
                    />

                    {/* Report Template Section */}
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors rounded-md p-2 -m-2"
                      onClick={handleOpenReportTemplate}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenReportTemplate();
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label="Open report template configuration"
                      style={{ paddingTop: '32px', paddingBottom: '32px' }}
                    >
                      <div className="flex-1 max-w-[244px]">
                        <h3 
                          style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            lineHeight: '16px',
                            color: '#01112C',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                            marginBottom: '8px',
                          }}
                        >
                          Report Template
                        </h3>
                        <p 
                          style={{
                            fontSize: '16px',
                            fontWeight: 400,
                            lineHeight: '16px',
                            color: '#767D94',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          Set interest rate and loan terms
                        </p>
                      </div>
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 20 20" 
                        fill="none"
                        style={{ opacity: 0.8 }}
                      >
                        <path 
                          d="M7.5 15L12.5 10L7.5 5" 
                          stroke="#000000" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* Divider Line */}
                    <div 
                      style={{
                        width: '469px',
                        height: '0px',
                        opacity: 0.1,
                        border: '0.8px solid #000000',
                      }}
                    />

                    {/* Alert Rules Section */}
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors rounded-md p-2 -m-2"
                      onClick={handleOpenAlertRules}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenAlertRules();
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label="Open alert rules configuration"
                      style={{ paddingTop: '32px', paddingBottom: '32px' }}
                    >
                      <div className="flex-1 max-w-[244px]">
                        <h3 
                          style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            lineHeight: '16px',
                            color: '#01112C',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                            marginBottom: '8px',
                          }}
                        >
                          Alert rules
                        </h3>
                        <p 
                          style={{
                            fontSize: '16px',
                            fontWeight: 400,
                            lineHeight: '16px',
                            color: '#767D94',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          Set interest rate and loan terms
                        </p>
                      </div>
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 20 20" 
                        fill="none"
                        style={{ opacity: 0.8 }}
                      >
                        <path 
                          d="M7.5 15L12.5 10L7.5 5" 
                          stroke="#000000" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-[rgba(52,64,84,0.7)] backdrop-blur-[8px] flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-lg shadow-lg"
            style={{
              width: '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={closePasswordModal}
                  className="flex items-center gap-2 text-[#858D96] hover:text-[#6B7280] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span 
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: '17px',
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    Back
                  </span>
                </button>
              </div>
              
              <h2 
                className="mb-2"
                style={{
                  fontSize: '20px',
                  fontWeight: 500,
                  lineHeight: '32px',
                  color: '#021C3E',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Password Information
              </h2>
              <p 
                style={{
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  color: '#021C3E',
                  opacity: 0.5,
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Change your password below
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '22px',
                      color: '#01112C',
                      opacity: 0.5,
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    Current password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full px-4 py-4 bg-[#F9FAFC] border border-[#BCC7D3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:border-transparent"
                      style={{
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '16px',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                      }}
                      placeholder="••••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9097A5] hover:text-[#6B7280] transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '22px',
                      color: '#01112C',
                      opacity: 0.5,
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-4 py-4 bg-[#F9FAFC] border border-[#BCC7D3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:border-transparent"
                      style={{
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '16px',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                      }}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9097A5] hover:text-[#6B7280] transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '22px',
                      color: '#01112C',
                      opacity: 0.5,
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    Confirm New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-4 bg-[#F9FAFC] border border-[#BCC7D3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:border-transparent"
                      style={{
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '16px',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                      }}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9097A5] hover:text-[#6B7280] transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={closePasswordModal}
                  className="text-[#7A62EB] hover:text-[#6941C6] transition-colors focus:outline-none"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '17px',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                  }}
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleChangePassword}
                  disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="bg-[#7F56D9] hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 shadow-sm px-6 py-3"
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '24px',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                    border: '1px solid #7F56D9',
                    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Changing Password...
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {selectedUser && (
        <EditRoleModal
          isOpen={showEditRoleModal}
          onClose={handleCloseEditModal}
          onSave={handleSaveUser}
          userData={selectedUser}
        />
      )}

      {/* Create Admin Modal */}
      <CreateAdminModal
        isOpen={showCreateAdminModal}
        onClose={handleCloseCreateAdminModal}
        onSave={handleSaveNewAdmin}
      />

      {/* Global Settings Modal */}
      <GlobalSettingsModal
        isOpen={showGlobalSettingsModal}
        onClose={handleCloseGlobalSettings}
        onSave={handleSaveGlobalSettings}
        initialData={globalSettings}
      />

      {/* Report Template Modal */}
      <ReportTemplateModal
        isOpen={showReportTemplateModal}
        onClose={handleCloseReportTemplate}
        onSave={handleSaveReportTemplate}
        initialData={reportTemplateSettings}
      />

      {/* Alert Rules Modal */}
      <AlertRulesModal
        isOpen={showAlertRulesModal}
        onClose={handleCloseAlertRules}
        onSave={handleSaveAlertRules}
        alertData={alertRulesSettings}
      />

      {/* Profile Picture Upload Modal */}
      {showProfilePictureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#021C3E]">
                Upload Profile Picture
              </h3>
              <button
                onClick={() => setShowProfilePictureModal(false)}
                className="text-[#667085] hover:text-[#344054] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <FileUpload
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
              maxFiles={1}
              onFileSelect={handleProfilePictureUpload}
              onError={handleProfilePictureError}
              showPreview={true}
              placeholder="Click to upload or drag and drop your profile picture"
              className="mb-4"
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowProfilePictureModal(false)}
                className="px-4 py-2 text-[#344054] border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                Cancel
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