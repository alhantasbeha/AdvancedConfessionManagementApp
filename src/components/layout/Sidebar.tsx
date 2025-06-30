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
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-30 md:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300 ease-in-out z-40 
        flex flex-col border-l-2 border-gray-200 dark:border-gray-700
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
        md:relative md:translate-x-0 
        ${isCollapsed ? 'md:w-20' : 'md:w-80'}
      `}>
        
        {/* Enhanced Header - Match main header height with premium styling */}
        <div className="h-24 p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-600 via-purple-600 via-indigo-600 to-violet-700 flex items-center justify-between relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-indigo-600/30 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.15%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%223%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
          
          {!isCollapsed && (
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-lg border-2 border-white/40 shadow-2xl">
                <Icon name="users" className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white leading-tight tracking-tight">الكاهن الرقمي</h1>
                <p className="text-blue-100 text-base font-bold leading-relaxed">نظام إدارة الكنيسة المتطور</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-green-200 text-sm font-bold">نظام متقدم</span>
                </div>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-lg mx-auto border-2 border-white/40 shadow-2xl relative z-10">
              <Icon name="users" className="w-7 h-7 text-white" />
            </div>
          )}
          
          <button 
            onClick={onClose} 
            className="md:hidden p-3 rounded-xl bg-white/25 hover:bg-white/35 transition-colors border-2 border-white/40 relative z-10 shadow-xl"
          >
            <Icon name="close" className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Navigation with enhanced spacing and typography */}
        <nav className="flex-1 p-5 overflow-y-auto">
          <div className="space-y-3">
            {NAV_ITEMS.map(item => {
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    group relative w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300
                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                    ${isActive 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl transform scale-[1.02] border-2 border-white/30` 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:shadow-xl hover:scale-[1.01]'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-10 bg-white rounded-l-full shadow-xl"></div>
                  )}
                  
                  {/* Icon Container */}
                  <div className={`
                    p-3 rounded-xl transition-all duration-300 flex-shrink-0
                    ${isActive 
                      ? 'bg-white/25 shadow-xl backdrop-blur-lg border-2 border-white/40' 
                      : `bg-${item.color}-100 dark:bg-${item.color}-900 group-hover:bg-${item.color}-200 dark:group-hover:bg-${item.color}-800 group-hover:shadow-lg`
                    }
                  `}>
                    <Icon 
                      name={item.icon} 
                      className={`w-6 h-6 transition-all duration-300 ${
                        isActive 
                          ? 'text-white' 
                          : `text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110`
                      }`} 
                    />
                  </div>
                  
                  {/* Label and Description */}
                  {!isCollapsed && (
                    <div className="flex-1 text-right">
                      <div className="font-black text-base leading-tight">
                        {item.label}
                      </div>
                      <div className={`text-sm mt-1 leading-relaxed font-semibold ${
                        isActive 
                          ? 'text-white/90' 
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute right-full mr-4 px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 shadow-2xl border-2 border-gray-700 dark:border-gray-600">
                      <div className="font-black text-base">{item.label}</div>
                      <div className="text-sm text-gray-300 mt-1 font-semibold">{item.description}</div>
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
        
        {/* Enhanced Footer */}
        <div className="p-5 border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {/* User Profile Section */}
          {!isCollapsed && (
            <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900 rounded-2xl border-2 border-blue-200 dark:border-blue-700 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Icon name="users" className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-black text-gray-900 dark:text-white leading-tight">
                    المستخدم المحلي
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">
                    قاعدة بيانات SQLite
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-green-600 dark:text-green-400 font-black">متصل ونشط</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Collapse Toggle */}
          <button 
            onClick={onToggleCollapse} 
            className="hidden md:flex items-center justify-center w-full p-4 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 group shadow-xl hover:shadow-2xl"
          >
            <Icon 
              name={isCollapsed ? 'arrowLeft' : 'arrowRight'} 
              className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" 
            />
            {!isCollapsed && (
              <span className="mr-3 text-base font-black text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                طي الشريط الجانبي
              </span>
            )}
          </button>
          
          {/* Enhanced Quick Stats for collapsed state */}
          {isCollapsed && (
            <div className="mt-4 space-y-3">
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-xl shadow-lg">
                <div className="text-lg font-black text-blue-700 dark:text-blue-300">150</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-bold">معترف</div>
              </div>
              <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-xl shadow-lg">
                <div className="text-lg font-black text-green-700 dark:text-green-300">25</div>
                <div className="text-xs text-green-600 dark:text-green-400 font-bold">اعتراف</div>
              </div>
              <div className="text-center p-3 bg-purple-100 dark:bg-purple-900 rounded-xl shadow-lg">
                <div className="text-lg font-black text-purple-700 dark:text-purple-300">8</div>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-bold">تنبيه</div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};