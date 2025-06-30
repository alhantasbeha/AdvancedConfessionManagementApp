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
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 backdrop-blur-md bg-white/95 dark:bg-gray-900/95">
        <div className="flex items-center justify-between p-4 lg:px-6">
          {/* Left Section - Mobile Menu & Page Title */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onMenuClick} 
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Icon name="menu" className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="hidden md:block">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentPageLabel}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                إدارة شؤون الكنيسة والمعترفين
              </p>
            </div>
          </div>

          {/* Center Section - Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className={`
              relative w-full transition-all duration-200
              ${isSearchFocused ? 'transform scale-105' : ''}
            `}>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="البحث في النظام..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button (Mobile) */}
            <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Icon name="search" className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(prev => !prev)} 
                className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                title="التنبيهات"
              >
                <Icon name="bell" className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <div className="flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center font-bold">
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
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              title={isDarkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            >
              <Icon 
                name={isDarkMode ? 'sun' : 'moon'} 
                className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" 
              />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Icon name="users" className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  المستخدم المحلي
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SQLite Database
                </p>
              </div>
            </div>

            {/* Settings Quick Access */}
            <button 
              onClick={() => window.location.href = '#settings'}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              title="الإعدادات السريعة"
            >
              <Icon name="settings" className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Mobile Page Title */}
        <div className="md:hidden px-4 pb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {currentPageLabel}
          </h2>
        </div>

        {/* Quick Stats Bar (Optional) */}
        <div className="hidden xl:flex items-center justify-center gap-8 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">النظام متصل</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="users" className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">80 معترف نشط</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="log" className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">200 سجل اعتراف</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="bell" className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{notifications.length} تنبيه</span>
          </div>
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