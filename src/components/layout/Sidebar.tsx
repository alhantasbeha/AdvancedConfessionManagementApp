import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../ui/Icon';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'لوحة المعلومات', icon: 'dashboard' },
  { id: 'confessors', label: 'المعترفين والأسر', icon: 'users' },
  { id: 'confession-log', label: 'سجل الاعترافات', icon: 'log' },
  { id: 'birthdays', label: 'أعياد الميلاد', icon: 'birthday' },
  { id: 'anniversaries', label: 'أعياد الزواج', icon: 'birthday' },
  { id: 'calendar', label: 'التقويم والمواعيد', icon: 'calendar' },
  { id: 'reports', label: 'التقارير والتحليلات', icon: 'reports' },
  { id: 'messages', label: 'الرسائل والقوالب', icon: 'messages' },
  { id: 'settings', label: 'الإعدادات', icon: 'settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  isCollapsed, 
  onClose, 
  onToggleCollapse 
}) => {
  const { currentPage, setCurrentPage } = useAppContext();

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    onClose();
  };

  return (
    <aside className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out z-40 flex flex-col
      ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
      md:relative md:translate-x-0 
      ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
      
      <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
        <h1 className={`text-xl font-bold text-blue-600 dark:text-blue-400 overflow-hidden ${
          isCollapsed ? 'md:hidden' : ''
        }`}>
          الكاهن الرقمي
        </h1>
        <button 
          onClick={onClose} 
          className={`md:hidden ${isCollapsed ? 'hidden' : ''}`}
        >
          <Icon name="close" />
        </button>
      </div>

      <nav className="p-2 flex-1">
        <ul>
          {NAV_ITEMS.map(item => (
            <li key={item.id}>
              <button
                onClick={() => handleNavigation(item.id)}
                className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 w-full text-left
                ${isCollapsed ? 'md:justify-center' : ''}
                ${currentPage === item.id 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                <Icon name={item.icon} className="w-6 h-6" />
                <span className={`mr-3 ${isCollapsed ? 'md:hidden' : ''}`}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-2 border-t dark:border-gray-700">
        <button 
          onClick={onToggleCollapse} 
          className="hidden md:flex items-center justify-center w-full p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Icon name={isCollapsed ? 'arrowRight' : 'arrowLeft'} />
        </button>
      </div>
    </aside>
  );
};