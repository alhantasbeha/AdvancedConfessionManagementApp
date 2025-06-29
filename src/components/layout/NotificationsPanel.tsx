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
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white dark:bg-gray-800 shadow-lg rounded-l-xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold">التنبيهات ({notifications.length})</h3>
          <button onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 p-8">لا توجد تنبيهات جديدة.</p>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {notifications.map(notification => (
                <div key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.timestamp).toLocaleString('ar-EG', { 
                      day: 'numeric', 
                      month: 'long', 
                      hour: 'numeric', 
                      minute: 'numeric' 
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-2 border-t dark:border-gray-700">
          <button className="w-full text-center text-sm text-blue-500 hover:underline p-2">
            مسح الكل
          </button>
        </div>
      </div>
    </div>
  );
};