import React from 'react';
import { Icon } from '../ui/Icon';
import { Notification } from '../../types';

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  notifications, 
  onClose 
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'birthday': return 'birthday';
      case 'anniversary': return 'birthday';
      case 'overdue': return 'alert-circle';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'birthday': return 'pink';
      case 'anniversary': return 'purple';
      case 'overdue': return 'red';
      default: return 'blue';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full border-l border-gray-200 dark:border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Icon name="bell" className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">التنبيهات</h3>
                <p className="text-blue-100 text-sm">{notifications.length} تنبيه جديد</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Icon name="close" className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Icon name="bell" className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد تنبيهات
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                ستظهر هنا جميع التنبيهات المهمة والتذكيرات
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map(notification => {
                const color = getNotificationColor(notification.type);
                const icon = getNotificationIcon(notification.type);
                
                return (
                  <div 
                    key={notification.id} 
                    className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900 group-hover:scale-110 transition-transform`}>
                        <Icon name={icon} className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Icon name="calendar" className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(notification.timestamp).toLocaleString('ar-EG', { 
                              day: 'numeric', 
                              month: 'long', 
                              hour: 'numeric', 
                              minute: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        <Icon name="x" className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex gap-3">
              <button className="flex-1 text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors">
                تحديد الكل كمقروء
              </button>
              <button className="flex-1 text-center text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors">
                مسح الكل
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};