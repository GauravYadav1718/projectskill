import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Shield, Key, User, Save, Lock, HelpCircle, Loader2, CheckCircle, Trash2 } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await axios.delete('/api/auth/delete-account');
      toast.success('Account deleted successfully');
      logout(); // Use the logout function from context to clean up state
      window.location.href = '/';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  // Security Question state
  const [securityData, setSecurityData] = useState({
    securityQuestion: user?.securityQuestion || '',
    securityAnswer: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    securityAnswer: ''
  });

  const [requireSecurity, setRequireSecurity] = useState(user?.passwordChangeCount >= 3);

  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    setSecurityLoading(true);
    try {
      await axios.post('/api/auth/update-security', securityData);
      toast.success('Security info updated successfully');
      setSecurityData(prev => ({ ...prev, securityAnswer: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update security info');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setPasswordLoading(true);
    try {
      const response = await axios.post('/api/auth/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        securityAnswer: passwordData.securityAnswer
      });
      
      toast.success('Password changed successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '', securityAnswer: '' });
      setRequireSecurity(user?.passwordChangeCount + 1 >= 3);
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requireSecurity) {
        setRequireSecurity(true);
        toast.error('Security answer required for frequent changes');
      } else {
        toast.error(err.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const securityQuestions = [
    'What was your first pet name?',
    'What is your mother\'s maiden name?',
    'What was the name of your elementary school?',
    'In what city were you born?',
    'What is your favorite book?'
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 font-medium">Manage your security preferences and account information.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar / Info */}
          <div className="space-y-6">
            <div className="glass-card p-6 border-white/40 shadow-xl text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-primary-500/20">
                {user?.name?.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
              <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between text-left">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Changes</p>
                  <p className="text-sm font-bold text-slate-700">{user?.passwordChangeCount || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                  <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Secure</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border-white/40 shadow-xl bg-primary-600 text-white">
              <Shield className="w-8 h-8 mb-4 opacity-80" />
              <h4 className="text-lg font-bold mb-2">Security Level</h4>
              <p className="text-xs opacity-90 leading-relaxed font-medium">
                Your account is protected by industry-standard encryption. Enable a security question for extra protection during password recovery.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Security Question Section */}
            <div className="glass-card p-8 border-white/40 shadow-xl">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Security Question</h3>
              </div>

              <form onSubmit={handleSecurityUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Choose a Question</label>
                  <select
                    value={securityData.securityQuestion}
                    onChange={(e) => setSecurityData({ ...securityData, securityQuestion: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="">Select a security question...</option>
                    {securityQuestions.map((q, i) => (
                      <option key={i} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Your Answer</label>
                  <input
                    type="text"
                    value={securityData.securityAnswer}
                    onChange={(e) => setSecurityData({ ...securityData, securityAnswer: e.target.value })}
                    className="form-input"
                    placeholder="Case-insensitive answer..."
                    required
                  />
                  <p className="text-[10px] font-bold text-slate-400 mt-2 ml-1 uppercase tracking-widest">
                    This answer will be used to verify your identity if you change your password frequently.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={securityLoading}
                  className="btn-primary w-full flex items-center justify-center space-x-2 py-3 shadow-lg shadow-primary-500/10"
                >
                  {securityLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>{securityLoading ? 'Saving...' : 'Save Security Settings'}</span>
                </button>
              </form>
            </div>

            {/* Password Change Section */}
            <div className="glass-card p-8 border-white/40 shadow-xl">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-primary-50 rounded-xl">
                  <Key className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    className="form-input"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="form-input"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="form-input"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {requireSecurity && (
                  <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center space-x-2 mb-3">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Enhanced Security Check</span>
                    </div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {user?.securityQuestion || 'Security Answer'}
                    </label>
                    <input
                      type="text"
                      value={passwordData.securityAnswer}
                      onChange={(e) => setPasswordData({ ...passwordData, securityAnswer: e.target.value })}
                      className="form-input bg-white border-amber-200 focus:ring-amber-500"
                      placeholder="Enter your security answer..."
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-primary w-full flex items-center justify-center space-x-2 py-3 shadow-lg shadow-primary-500/10"
                >
                  {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="glass-card p-8 border-red-100 bg-red-50/30 shadow-xl mt-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-900">Danger Zone</h3>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Delete Account</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Permanently remove your account and all your data. This action is irreversible.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Are you absolutely sure? This will permanently delete your account, all your skills, messages, and requests. This cannot be undone.')) {
                      handleDeleteAccount();
                    }
                  }}
                  className="btn-outline !border-red-200 !text-red-600 hover:!bg-red-600 hover:!text-white !py-3 !px-8 transition-all font-bold text-sm shadow-lg shadow-red-500/5"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
