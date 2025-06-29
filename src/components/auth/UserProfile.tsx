import React, { useState } from 'react';
import { signOut, updatePassword, updateEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Icon } from '../ui/Icon';

interface UserProfileProps {
  user: any;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onClose }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await updatePassword(user, newPassword);
      setMessage('تم تغيير كلمة المرور بنجاح');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setError('فشل في تغيير كلمة المرور. قد تحتاج لتسجيل الدخول مرة أخرى');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Icon name="users" className="w-6 h-6 text-blue-500" />
            الملف الشخصي
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {message && (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3">
              <p className="text-green-800 dark:text-green-200 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* User Info */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">معلومات الحساب</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="messages" className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  البريد الإلكتروني: {user.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="calendar" className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  تاريخ الإنشاء: {new Date(user.metadata.creationTime).toLocaleDateString('ar-EG')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="users" className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  آخر دخول: {new Date(user.metadata.lastSignInTime).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div>
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Icon name="settings" className="w-5 h-5" />
                تغيير كلمة المرور
              </span>
              <Icon name={showChangePassword ? "close" : "arrowLeft"} className="w-5 h-5" />
            </button>

            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                </button>
              </form>
            )}
          </div>

          {/* Account Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              <Icon name="close" className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>

          {/* Account Security */}
          <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">نصائح الأمان</h4>
            <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
              <li>• لا تشارك كلمة المرور مع أحد</li>
              <li>• استخدم كلمة مرور قوية ومعقدة</li>
              <li>• سجل الخروج عند استخدام أجهزة عامة</li>
              <li>• احتفظ بنسخة احتياطية من بياناتك</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};