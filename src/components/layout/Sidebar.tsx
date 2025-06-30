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
    description: 'نظرة عامة على الأنشطة',
    stats: '4 تنبيهات جديدة'
  },
  { 
    id: 'confessors', 
    label: 'المعترفين والأسر', 
    icon: 'users',
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    description: 'إدارة بيانات المعترفين',
    stats: '150 معترف نشط'
  },
  { 
    id: 'confession-log', 
    label: 'سجل الاعترافات', 
    icon: 'log',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    description: 'تسجيل ومتابعة الاعترافات',
    stats: '25 اعتراف هذا الشهر'
  },
  { 
    id: 'birthdays', 
    label: 'أعياد الميلاد', 
    icon: 'birthday',
    color: 'pink',
    gradient: 'from-pink-500 to-pink-600',
    description: 'تتبع أعياد الميلاد',
    stats: '8 أعياد هذا الشهر'
  },
  { 
    id: 'anniversaries', 
    label: 'أعياد الزواج', 
    icon: 'birthday',
    color: 'rose',
    gradient: 'from-rose-500 to-rose-600',
    description: 'تتبع ذكريات الزواج',
    stats: '3 ذكريات هذا الشهر'
  },
  { 
    id: 'calendar', 
    label: 'التقويم والمواعيد', 
    icon: 'calendar',
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    description: 'جدولة المواعيد والأحداث',
    stats: '12 موعد قادم'
  },
  { 
    id: 'reports', 
    label: 'التقارير والتحليلات', 
    icon: 'reports',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    description: 'إحصائيات وتقارير مفصلة',
    stats: '5 تقارير جاهزة'
  },
  { 
    id: 'messages', 
    label: 'الرسائل والقوالب', 
    icon: 'messages',
    color: 'teal',
    gradient: 'from-teal-500 to-teal-600',
    description: 'إدارة الرسائل والقوالب',
    stats: '12 قالب متاح'
  },
  { 
    id: 'settings', 
    label: 'الإعدادات', 
    icon: 'settings',
    color: 'gray',
    gradient: 'from-gray-500 to-gray-600',
    description: 'إعدادات النظام والتخصيص',
    stats: 'آخر تحديث: أمس'
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

      {/* Sidebar - Made Sticky */}
      <aside className={`
        fixed top-0 right-0 h-screen bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300 ease-in-out z-40 
        flex flex-col border-l border-gray-200 dark:border-gray-700
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
        md:relative md:translate-x-0 md:sticky md:top-0
        ${isCollapsed ? 'md:w-20' : 'md:w-72'}
      `}>
        
        {/* Header - Match main header height with enhanced styling */}
        <div className="h-[73px] p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-between relative overflow-hidden flex-shrink-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          {!isCollapsed && (
            <div className="flex items-center gap-3 relative z-10">
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
          
          <button 
            onClick={onClose} 
            className="md:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors border border-white/30 relative z-10"
          >
            <Icon name="close" className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation with enhanced tooltips - Made scrollable */}
        <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="space-y-2">
            {NAV_ITEMS.map(item => {
              const isActive = currentPage === item.id;
              
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                      ${isCollapsed ? 'justify-center' : 'justify-start'}
                      ${isActive 
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-[1.01] border border-white/20` 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:shadow-md hover:scale-[1.01]'
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full shadow-lg"></div>
                    )}
                    
                    {/* Icon Container */}
                    <div className={`
                      p-2 rounded-lg transition-all duration-300 flex-shrink-0
                      ${isActive 
                        ? 'bg-white/20 shadow-md backdrop-blur-sm border border-white/30' 
                        : `bg-${item.color}-100 dark:bg-${item.color}-900 group-hover:bg-${item.color}-200 dark:group-hover:bg-${item.color}-800 group-hover:shadow-sm`
                      }
                    `}>
                      <Icon 
                        name={item.icon} 
                        className={`w-5 h-5 transition-all duration-300 ${
                          isActive 
                            ? 'text-white' 
                            : `text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-105`
                        }`} 
                      />
                    </div>
                    
                    {/* Label and Description */}
                    {!isCollapsed && (
                      <div className="flex-1 text-right">
                        <div className="font-semibold text-sm leading-tight">
                          {item.label}
                        </div>
                        <div className={`text-xs mt-0.5 leading-relaxed ${
                          isActive 
                            ? 'text-white/80' 
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    )}
                  </button>
                  
                  {/* Enhanced Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
                      {/* Tooltip Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px] max-w-[320px]">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} shadow-lg`}>
                            <Icon name={item.icon} className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                              {item.label}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${item.color}-500`}></div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {item.stats}
                            </span>
                          </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleNavigation(item.id)}
                            className={`flex-1 px-3 py-2 bg-gradient-to-r ${item.gradient} text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all duration-200`}
                          >
                            فتح
                          </button>
                          {item.id === 'confessors' && (
                            <button className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                              إضافة
                            </button>
                          )}
                          {item.id === 'confession-log' && (
                            <button className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                              تسجيل
                            </button>
                          )}
                        </div>
                        
                        {/* Arrow */}
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-white dark:border-r-gray-800 drop-shadow-lg"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
        
        {/* Footer with user profile - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
          {/* User Profile Section */}
          {!isCollapsed && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon name="users" className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    المستخدم المحلي
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    قاعدة بيانات SQLite
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">متصل</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Stats for collapsed state with tooltip */}
          {isCollapsed && (
            <div className="space-y-2 relative group">
              <div className="text-center p-2 bg-blue-100 dark:bg-blue-900 rounded-lg cursor-pointer">
                <div className="text-sm font-bold text-blue-700 dark:text-blue-300">150</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">معترف</div>
              </div>
              <div className="text-center p-2 bg-green-100 dark:bg-green-900 rounded-lg cursor-pointer">
                <div className="text-sm font-bold text-green-700 dark:text-green-300">25</div>
                <div className="text-xs text-green-600 dark:text-green-400">اعتراف</div>
              </div>
              
              {/* Stats Tooltip */}
              <div className="absolute right-full mr-3 bottom-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[200px]">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">إحصائيات سريعة</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">المعترفين النشطين</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">150</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">اعترافات هذا الشهر</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">25</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">أعياد ميلاد قادمة</span>
                      <span className="text-sm font-bold text-pink-600 dark:text-pink-400">8</span>
                    </div>
                  </div>
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-white dark:border-r-gray-800 drop-shadow-lg"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};