import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../apiClient';
import { InlineSpinner } from '../components/LoadingSpinner';
export default function Settings() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const updateData = {};

      if (name !== user.name) {
        updateData.name = name;
      }

      if (email !== user.email) {
        updateData.email = email;
      }

      if (password) {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        updateData.password = password;
      }

      if (Object.keys(updateData).length === 0) {
        setError('No changes to save');
        setLoading(false);
        return;
      }

      const result = await apiClient.updateProfile(updateData);

      if (updateData.name || updateData.email) {
        updateUser({
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.email && { email: updateData.email })
        });
      }

      setMessage('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:bg-white dark:focus:bg-neutral-700 transition-colors";

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-6xl text-neutral-900 dark:text-neutral-100">Settings</h1>
        </div>
        <button
          onClick={() => navigate('/classrooms')}
          className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
        >
          <span className="text-base leading-none">&lsaquo;</span>
          <span>Back to Classrooms</span>
        </button>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleUpdateProfile}>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                minLength="6"
                className={inputClasses}
              />
            </div>

            {password && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  className={inputClasses}
                />
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors disabled:opacity-40"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Saving...</span> : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Logout */}
        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">Sign Out</h2>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-4">
            Sign out of your account on this device.
          </p>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
