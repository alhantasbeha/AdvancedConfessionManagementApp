import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../ui/Icon';
import NotificationsPanel from './NotificationsPanel';

interface HeaderProps {
  onMenuClick: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const { currentPage, isDarkMode, setIsDarkMode, notifications, user } = useAppContext();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const currentPageLabel = NAV_ITEMS.find(item => item.id === currentPage)?.label || 'لوحة المعلومات';

  const handleThemeToggle = () => {
    setIsDarkMode();
  };

  return (
    <>
      <header className="h-[73px] bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 backdrop-blur-md bg-white/95 dark:bg-gray-900/95">
        <div className="flex items-center justify-between h-full px-6 lg:px-8">
          {/* Left Section - Mobile Menu, App Name & Collapse Toggle */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={onMenuClick} 
              className="md:hidden p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
            >
              <Icon name="menu" className="w-7 h-7 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
            </button>

            {/* App Name & Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="users" className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  الكاهن الرقمي
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  نظام إدارة الكنيسة
                </p>
              </div>
            </div>

            {/* Desktop Sidebar Collapse Toggle */}
            {onToggleCollapse && (
              <button 
                onClick={onToggleCollapse}
                className="hidden md:flex items-center gap-2 p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                title={isCollapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
              >
                <Icon 
                  name={isCollapsed ? 'arrowLeft' : 'arrowRight'} 
                  className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" 
                />
                {!isCollapsed && (
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                    طي الشريط
                  </span>
                )}
              </button>
            )}

            {/* Divider */}
            <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

            {/* Page Title */}
            <div className="hidden md:block">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                {currentPageLabel}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                إدارة شؤون الكنيسة والمعترفين بكفاءة عالية
              </p>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(prev => !prev)} 
                className="relative p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                title="التنبيهات"
              >
                <Icon name="bell" className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <div className="flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 text-white text-xs items-center justify-center font-bold shadow-lg">
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
              className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              title={isDarkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            >
              <Icon 
                name={isDarkMode ? 'sun' : 'moon'} 
                className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" 
              />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-4 px-5 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-2xl border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="users" className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                  المستخدم المحلي
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  قاعدة بيانات SQLite
                </p>
              </div>
              <div className="hidden lg:flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium mr-2">متصل</span>
              </div>
            </div>

            {/* Settings Quick Access */}
            <button 
              onClick={() => window.location.href = '#settings'}
              className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              title="الإعدادات السريعة"
            >
              <Icon name="settings" className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Mobile Page Title */}
        <div className="md:hidden px-6 pb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {currentPageLabel}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
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