import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../ui/Icon';

export const DashboardPage: React.FC = () => {
  const { notifications, setCurrentPage } = useAppContext();

  const stats = [
    { 
      label: 'مواعيد اليوم', 
      value: 3, 
      icon: 'calendar', 
      color: 'blue',
      onClick: () => setCurrentPage('calendar')
    },
    { 
      label: 'أعياد ميلاد اليوم', 
      value: notifications.filter(n => n.type === 'birthday').length, 
      icon: 'birthday', 
      color: 'pink',
      onClick: () => setCurrentPage('birthdays')
    },
    { 
      label: 'طلبات جديدة', 
      value: 2, 
      icon: 'add', 
      color: 'green',
      onClick: () => setCurrentPage('confessors')
    },
    { 
      label: 'تحتاج متابعة', 
      value: notifications.filter(n => n.type === 'overdue').length, 
      icon: 'log', 
      color: 'yellow',
      onClick: () => setCurrentPage('confession-log')
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'border-blue-500 bg-blue-100 dark:bg-blue-900 text-blue-500',
      pink: 'border-pink-500 bg-pink-100 dark:bg-pink-900 text-pink-500',
      green: 'border-green-500 bg-green-100 dark:bg-green-900 text-green-500',
      yellow: 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900 text-yellow-500',
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div 
            key={stat.label} 
            className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center justify-between border-r-4 cursor-pointer hover:shadow-lg transition-shadow ${getColorClasses(stat.color).split(' ')[0]}`}
            onClick={stat.onClick}
          >
            <div>
              <p className="text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${getColorClasses(stat.color).split(' ').slice(1).join(' ')}`}>
              <Icon name={stat.icon} className="w-8 h-8"/>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="font-bold text-lg mb-4">آخر التنبيهات</h3>
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.slice(0, 3).map(notification => (
              <div key={notification.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString('ar-EG')}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">لا توجد تنبيهات حالياً.</p>
          )}
        </div>
        
        {notifications.length > 3 && (
          <button 
            onClick={() => setCurrentPage('notifications')}
            className="mt-4 text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            عرض جميع التنبيهات ({notifications.length})
          </button>
        )}
      </div>
    </div>
  );
};