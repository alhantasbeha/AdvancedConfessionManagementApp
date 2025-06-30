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
  { 
    id: 'dashboard', 
    label: 'لوحة المعلومات', 
    icon: 'dashboard',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    description: 'نظرة عامة على الأنشطة'
  },
  { 
    id: 'confessors', 
    label: 'المعترفين والأسر', 
    icon: 'users',
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    description: 'إدارة بيانات المعترفين'
  },
  { 
    id: 'confession-log', 
    label: 'سجل الاعترافات', 
    icon: 'log',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    description: 'تسجيل ومتابعة الاعترافات'
  },
  { 
    id: 'birthdays', 
    label: 'أعياد الميلاد', 
    icon: 'birthday',
    color: 'pink',
    gradient: 'from-pink-500 to-pink-600',
    description: 'تتبع أعياد الميلاد'
  },
  { 
    id: 'anniversaries', 
    label: 'أعياد الزواج', 
    icon: 'birthday',
    color: 'rose',
    gradient: 'from-rose-500 to-rose-600',
    description: 'تتبع ذكريات الزواج'
  },
  { 
    id: 'calendar', 
    label: 'التقويم والمواعيد', 
    icon: 'calendar',
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    description: 'جدولة المواعيد والأحداث'
  },
  { 
    id: 'reports', 
    label: 'التقارير والتحليلات', 
    icon: 'reports',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    description: 'إحصائيات وتقارير مفصلة'
  },
  { 
    id: 'messages', 
    label: 'الرسائل والقوالب', 
    icon: 'messages',
    color: 'teal',
    gradient: 'from-teal-500 to-teal-600',
    description: 'إدارة الرسائل والقوالب'
  },
  { 
    id: 'settings', 
    label: 'الإعدادات', 
    icon: 'settings',
    color: 'gray',
    gradient: 'from-gray-500 to-gray-600',
    description: 'إعدادات النظام والتخصيص'
  },
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar with Sticky Positioning */}
      <aside className={`
        fixed top-0 right-0 h-screen bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300 ease-in-out z-40 
        flex flex-col border-l border-gray-200 dark:border-gray-700 sticky
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
        md:relative md:translate-x-0 md:sticky md:top-0 md:h-screen
        ${isCollapsed ? 'md:w-20' : 'md:w-80'}
      `}>
        
        {/* Enhanced Header with Collapse Toggle at Top */}
        <div className="h-[73px] p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-between relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          {/* Logo and Title */}
          {!isCollapsed && (
            <div className="flex items-center gap-3 relative z-10 flex-1">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                <Icon name="users" className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">الكاهن الرقمي</h1>
                <p className="text-blue-100 text-xs font-medium">نظام إدارة الكنيسة</p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mx-auto border border-white/30 shadow-lg relative z-10">
              <Icon name="users" className="w-5 h-5 text-white" />
            </div>
          )}
          
          {/* Top Controls */}
          <div className="flex items-center gap-2 relative z-10">
            {/* Desktop Collapse Toggle - Moved to Top */}
            <button 
              onClick={onToggleCollapse} 
              className="hidden md:flex items-center justify-center p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 border border-white/30 backdrop-blur-sm group"
              title={isCollapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
            >
              <Icon 
                name={isCollapsed ? 'arrowLeft' : 'arrowRight'} 
                className="w-4 h-4 text-white group-hover:scale-110 transition-transform" 
              />
            </button>
            
            {/* Mobile Close Button */}
            <button 
              onClick={onClose} 
              className="md:hidden p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 border border-white/30 backdrop-blur-sm"
            >
              <Icon name="close" className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Navigation with Enhanced Spacing */}
        <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <div className="space-y-2">
            {NAV_ITEMS.map(item => {
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    group relative w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300
                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                    ${isActive 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-[1.02] border border-white/20` 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:shadow-md hover:scale-[1.01]'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-10 bg-white rounded-l-full shadow-lg"></div>
                  )}
                  
                  {/* Icon Container with Enhanced Size */}
                  <div className={`
                    p-2.5 rounded-xl transition-all duration-300 flex-shrink-0
                    ${isActive 
                      ? 'bg-white/20 shadow-md backdrop-blur-sm border border-white/30' 
                      : `bg-${item.color}-100 dark:bg-${item.color}-900 group-hover:bg-${item.color}-200 dark:group-hover:bg-${item.color}-800 group-hover:shadow-sm`
                    }
                  `}>
                    <Icon 
                      name={item.icon} 
                      className={`w-6 h-6 transition-all duration-300 ${
                        isActive 
                          ? 'text-white' 
                          : `text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-105`
                      }`} 
                    />
                  </div>
                  
                  {/* Label and Description with Enhanced Typography */}
                  {!isCollapsed && (
                    <div className="flex-1 text-right">
                      <div className="font-semibold text-base leading-tight">
                        {item.label}
                      </div>
                      <div className={`text-sm mt-1 leading-relaxed ${
                        isActive 
                          ? 'text-white/80' 
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute right-full mr-4 px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 shadow-xl border border-gray-700 dark:border-gray-600 min-w-max">
                      <div className="font-semibold text-base">{item.label}</div>
                      <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-[6px] border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
        
        {/* Enhanced Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {/* User Profile Section - Enhanced */}
          {!isCollapsed && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-xl border border-blue-200 dark:border-blue-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon name="users" className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    المستخدم المحلي
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    قاعدة بيانات SQLite
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">متصل ومتزامن</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Stats for collapsed state - Enhanced */}
          {isCollapsed && (
            <div className="space-y-3">
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-xl shadow-sm">
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">150</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">معترف</div>
              </div>
              <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-xl shadow-sm">
                <div className="text-lg font-bold text-green-700 dark:text-green-300">25</div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">اعتراف</div>
              </div>
              <div className="text-center p-3 bg-purple-100 dark:bg-purple-900 rounded-xl shadow-sm">
                <div className="text-lg font-bold text-purple-700 dark:text-purple-300">8</div>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">تنبيه</div>
              </div>
            </div>
          )}

          {/* Additional Info for expanded state */}
          {!isCollapsed && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">آخر تحديث</span>
                <span className="text-gray-900 dark:text-white font-medium">منذ دقيقتين</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">حجم البيانات</span>
                <span className="text-gray-900 dark:text-white font-medium">2.4 ميجابايت</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};