import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Icon } from '../ui/Icon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('كلمات المرور غير متطابقة');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
        resetForm();
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('البريد الإلكتروني غير مسجل');
          break;
        case 'auth/wrong-password':
          setError('كلمة المرور غير صحيحة');
          break;
        case 'auth/email-already-in-use':
          setError('البريد الإلكتروني مستخدم بالفعل');
          break;
        case 'auth/invalid-email':
          setError('البريد الإلكتروني غير صالح');
          break;
        case 'auth/weak-password':
          setError('كلمة المرور ضعيفة جداً');
          break;
        case 'auth/too-many-requests':
          setError('تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى لاحقاً');
          break;
        default:
          setError('حدث خطأ غير متوقع. حاول مرة أخرى');
      }
    }
    setLoading(false);
  };

  const switchMode = (newMode: 'login' | 'register' | 'reset') => {
    setMode(newMode);
    resetForm();
  };

  if (!isOpen) return null;

  const titles = {
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب جديد',
    reset: 'إعادة تعيين كلمة المرور'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Icon name="users" className="w-6 h-6 text-blue-500" />
            {titles[mode]}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-200 text-sm flex items-center gap-2">
                <Icon name="close" className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3">
              <p className="text-green-800 dark:text-green-200 text-sm flex items-center gap-2">
                <Icon name="users" className="w-4 h-4" />
                {success}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium mb-2">كلمة المرور *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                جاري المعالجة...
              </>
            ) : (
              <>
                <Icon name="users" className="w-5 h-5" />
                {mode === 'login' && 'تسجيل الدخول'}
                {mode === 'register' && 'إنشاء الحساب'}
                {mode === 'reset' && 'إرسال رابط الإعادة'}
              </>
            )}
          </button>

          <div className="text-center space-y-2">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  نسيت كلمة المرور؟
                </button>
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  ليس لديك حساب؟{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-blue-500 hover:text-blue-700 font-medium"
                  >
                    إنشاء حساب جديد
                  </button>
                </div>
              </>
            )}

            {mode === 'register' && (
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-blue-500 hover:text-blue-700 font-medium"
                >
                  تسجيل الدخول
                </button>
              </div>
            )}

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                العودة لتسجيل الدخول
              </button>
            )}
          </div>
        </form>

        {mode === 'register' && (
          <div className="px-6 pb-6">
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">معلومات مهمة:</h4>
              <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                <li>• استخدم بريد إلكتروني صحيح للتحقق</li>
                <li>• كلمة المرور يجب أن تكون 6 أحرف على الأقل</li>
                <li>• بياناتك ستكون محفوظة بشكل دائم</li>
                <li>• يمكنك الوصول لحسابك من أي جهاز</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};