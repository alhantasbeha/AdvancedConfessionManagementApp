import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../ui/Icon';
import { NotificationsPanel } from './NotificationsPanel';

interface HeaderProps {
  onMenuClick: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'لوحة المعلومات' },
  { id: 'confessors', label: 'المعترفين والأسر' },
  { id: 'confession-log', label: 'سجل الاعترافات' },
  { id: 'birthdays', label: 'أعياد الميلاد' },
  { id: 'anniversaries', label: 'أعياد الزواج' },
  { id: 'calendar', label: 'التقويم والمواعيد' },
  { id: 'reports', label: 'التقارير والتحليلات' },
  { id: 'messages', label: 'الرسائل والقوالب' },
  { id: 'settings', label: 'الإعدادات' },
];

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentPage, isDarkMode, setIsDarkMode, notifications, user } = useAppContext();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const currentPageLabel = NAV_ITEMS.find(item => item.id === currentPage)?.label || 'لوحة المعلومات';

  const handleThemeToggle = () => {
    setIsDarkMode();
  };

  return (
    <>
      <header className="h-24 bg-white dark:bg-gray-900 shadow-xl border-b-2 border-gray-200 dark:border-gray-700 sticky top-0 z-30 backdrop-blur-lg bg-white/95 dark:bg-gray-900/95">
        <div className="flex items-center justify-between h-full px-8 lg:px-12">
          {/* Left Section - Mobile Menu & Page Title */}
          <div className="flex items-center gap-8">
            <button 
              onClick={onMenuClick} 
              className="md:hidden p-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group shadow-lg hover:shadow-xl"
            >
              <Icon name="menu" className="w-8 h-8 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
            </button>
            
            <div className="hidden md:block">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                {currentPageLabel}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-semibold mt-2 leading-relaxed">
                إدارة شؤون الكنيسة والمعترفين بكفاءة عالية ومتقدمة
              </p>
            </div>
          </div>

          {/* Center Section - Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-12">
            <div className={`
              relative w-full transition-all duration-300
              ${isSearchFocused ? 'transform scale-105' : ''}
            `}>
              <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                <Icon name="search" className="w-7 h-7 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="البحث في النظام... (Ctrl+K)"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-8 pr-16 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg font-medium shadow-lg hover:shadow-xl focus:shadow-2xl"
              />
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-flex items-center px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 shadow-md">
                  Ctrl K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-4">
            {/* Search Button (Mobile) */}
            <button className="lg:hidden p-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group shadow-lg hover:shadow-xl">
              <Icon name="search" className="w-7 h-7 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(prev => !prev)} 
                className="relative p-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group shadow-lg hover:shadow-xl"
                title="التنبيهات"
              >
                <Icon name="bell" className="w-7 h-7 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <div className="flex h-7 w-7">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-7 w-7 bg-red-500 text-white text-sm items-center justify-center font-black shadow-xl">
                        {notifications.length > 9 ? '9+' : notifications.length}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={handleThemeToggle}
              className="p-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group shadow-lg hover:shadow-xl"
              title={isDarkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            >
              <Icon 
                name={isDarkMode ? 'sun' : 'moon'} 
                className="w-7 h-7 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" 
              />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-5 px-6 py-4 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900 rounded-3xl border-2 border-blue-200 dark:border-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Icon name="users" className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                  المستخدم المحلي
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400 font-bold">
                  قاعدة بيانات SQLite
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-base text-green-600 dark:text-green-400 font-black">متصل</span>
              </div>
            </div>

            {/* Settings Quick Access */}
            <button 
              onClick={() => window.location.href = '#settings'}
              className="p-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group shadow-lg hover:shadow-xl"
              title="الإعدادات السريعة"
            >
              <Icon name="settings" className="w-7 h-7 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Mobile Page Title */}
        <div className="md:hidden px-8 pb-6">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
            {currentPageLabel}
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 font-bold mt-2">
            إدارة شؤون الكنيسة والمعترفين
          </p>
        </div>
      </header>
      
      {/* Notifications Panel */}
      {isNotificationsOpen && (
        <NotificationsPanel 
          notifications={notifications} 
          onClose={() => setIsNotificationsOpen(false)} 
        />
      )}
    </>
  );
};