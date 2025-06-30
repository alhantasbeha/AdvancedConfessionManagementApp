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

  const currentPageLabel = NAV_ITEMS.find(item => item.id === currentPage)?.label || 'لوحة المعلومات';

  const handleThemeToggle = () => {
    setIsDarkMode();
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={onMenuClick} 
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Icon name="menu" className="w-6 h-6" />
        </button>
        
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {currentPageLabel}
        </h2>
        
        <div className="flex items-center gap-2">
          {/* Notifications Button */}
          <button 
            onClick={() => setIsNotificationsOpen(prev => !prev)} 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            title="التنبيهات"
          >
            <Icon name="bell" className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center font-bold">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              </span>
            )}
          </button>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={handleThemeToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isDarkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
          >
            <Icon 
              name={isDarkMode ? 'sun' : 'moon'} 
              className="w-6 h-6 text-gray-600 dark:text-gray-300" 
            />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <Icon name="users" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              SQLite المحلي
            </span>
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