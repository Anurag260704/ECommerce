import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Lock, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Check,
  Mail,
  Smartphone,
  Globe,
  Download,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const SettingsTab = () => {
  const { user, changePassword, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('password');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    security: true
  });

  const [pushNotifications, setPushNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newArrivals: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    showOrderHistory: false,
    shareData: false,
    marketing: false
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
    watch
  } = useForm();

  const newPassword = watch('newPassword');

  const sections = [
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'account', label: 'Account Management', icon: AlertTriangle }
  ];

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      if (result.success) {
        resetPasswordForm();
        toast.success('Password changed successfully');
      } else {
        toast.error(result.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleNotificationChange = (type, setting, value) => {
    if (type === 'email') {
      setEmailNotifications(prev => ({ ...prev, [setting]: value }));
    } else if (type === 'push') {
      setPushNotifications(prev => ({ ...prev, [setting]: value }));
    }
    toast.success('Notification preferences updated');
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
    toast.success('Privacy settings updated');
  };

  const handleExportData = () => {
    toast.success('Data export request submitted. You will receive an email with your data within 24 hours.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your data. Type "DELETE" to confirm.')) {
        // Handle account deletion
        toast.error('Account deletion is not implemented yet. Please contact support.');
      }
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return { text: 'Weak', color: 'text-red-600' };
      case 2:
        return { text: 'Fair', color: 'text-yellow-600' };
      case 3:
        return { text: 'Good', color: 'text-blue-600' };
      case 4:
      case 5:
        return { text: 'Strong', color: 'text-green-600' };
      default:
        return { text: '', color: '' };
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
        <p className="text-gray-600">Manage your password, notifications, and privacy settings</p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-3">
          <nav className="space-y-1 mb-6 lg:mb-0">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-9">
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Change Password Section */}
            {activeSection === 'password' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Ensure your account is using a long, random password to stay secure.
                </p>

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('currentPassword', { required: 'Current password is required' })}
                        type={showPasswords.current ? 'text' : 'password'}
                        className="input pr-10"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('newPassword', { 
                          required: 'New password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' }
                        })}
                        type={showPasswords.new ? 'text' : 'password'}
                        className="input pr-10"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full transition-all duration-300 ${
                                getPasswordStrength(newPassword) <= 2 ? 'bg-red-500' :
                                getPasswordStrength(newPassword) === 3 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${(getPasswordStrength(newPassword) / 5) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${getPasswordStrengthText(getPasswordStrength(newPassword)).color}`}>
                            {getPasswordStrengthText(getPasswordStrength(newPassword)).text}
                          </span>
                        </div>
                      </div>
                    )}
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('confirmPassword', { 
                          required: 'Please confirm your new password',
                          validate: value => value === newPassword || 'Passwords do not match'
                        })}
                        type={showPasswords.confirm ? 'text' : 'password'}
                        className="input pr-10"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button type="submit" className="btn btn-primary">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Choose how you want to be notified about account activity.
                </p>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Notifications
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(emailNotifications).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleNotificationChange('email', key, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Push Notifications
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(pushNotifications).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleNotificationChange('push', key, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security Section */}
            {activeSection === 'privacy' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy & Security</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Manage your privacy settings and data sharing preferences.
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Profile Visibility</h4>
                    <div className="space-y-2">
                      {['private', 'public'].map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="profileVisibility"
                            value={option}
                            checked={privacySettings.profileVisibility === option}
                            onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                            className="text-primary-600 border-gray-300 focus:ring-primary-200"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(privacySettings)
                      .filter(([key]) => key !== 'profileVisibility')
                      .map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {key === 'showOrderHistory' && 'Allow others to see your order history'}
                              {key === 'shareData' && 'Share anonymized data for product improvements'}
                              {key === 'marketing' && 'Receive personalized marketing based on your activity'}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handlePrivacyChange(key, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200"
                          />
                        </label>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Account Management Section */}
            {activeSection === 'account' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Management</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Export your data or delete your account.
                </p>

                <div className="space-y-6">
                  {/* Export Data */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Export Account Data
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Download a copy of your account data including orders, preferences, and profile information.
                        </p>
                      </div>
                      <button
                        onClick={handleExportData}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Request Export
                      </button>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-red-900 flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </h4>
                        <p className="text-sm text-red-700 mt-1">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        className="btn btn-error btn-sm"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Security Tips</h4>
                        <ul className="text-sm text-blue-800 mt-2 space-y-1">
                          <li>• Use a strong, unique password for your account</li>
                          <li>• Keep your email address up to date for security notifications</li>
                          <li>• Log out of your account when using public computers</li>
                          <li>• Review your order history regularly for unauthorized activity</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
