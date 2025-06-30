import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useSQLiteConfessors } from '../../hooks/useSQLiteConfessors';
import { useSQLiteConfessionLogs } from '../../hooks/useSQLiteConfessionLogs';
import { Icon } from '../ui/Icon';

export const DashboardPage: React.FC = () => {
  const { notifications, setCurrentPage } = useAppContext();
  const { confessors } = useSQLiteConfessors();
  const { logs } = useSQLiteConfessionLogs();
  const [selectedPeriod, setSelectedPeriod] = useState('هذا الشهر');

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    // Active confessors (not archived or deceased)
    const activeConfessors = confessors.filter(c => !c.isArchived && !c.isDeceased);
    
    // This month's confessions
    const thisMonthLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === thisMonth && logDate.getFullYear() === thisYear;
    });

    // Last month's confessions
    const lastMonthLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === lastMonth && logDate.getFullYear() === lastMonthYear;
    });

    // Birthdays this month
    const birthdaysThisMonth = activeConfessors.filter(c => {
      if (!c.birthDate) return false;
      const birthDate = new Date(c.birthDate);
      return birthDate.getMonth() === thisMonth;
    }).length;

    // Anniversaries this month
    const anniversariesThisMonth = activeConfessors.filter(c => {
      if (!c.marriageDate || c.socialStatus !== 'متزوج') return false;
      const marriageDate = new Date(c.marriageDate);
      return marriageDate.getMonth() === thisMonth;
    }).length;

    // Overdue confessions (more than 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);
    
    const overdueCount = activeConfessors.filter(c => {
      const lastConfession = logs
        .filter(log => log.confessorId === c.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (!lastConfession) return true;
      return new Date(lastConfession.date) < sixtyDaysAgo;
    }).length;

    // Calculate growth percentages
    const confessionGrowth = lastMonthLogs.length > 0 
      ? ((thisMonthLogs.length - lastMonthLogs.length) / lastMonthLogs.length * 100).toFixed(1)
      : '0';

    return {
      totalConfessors: activeConfessors.length,
      thisMonthConfessions: thisMonthLogs.length,
      lastMonthConfessions: lastMonthLogs.length,
      confessionGrowth: parseFloat(confessionGrowth),
      birthdaysThisMonth,
      anniversariesThisMonth,
      overdueCount,
      maleCount: activeConfessors.filter(c => c.gender === 'ذكر').length,
      femaleCount: activeConfessors.filter(c => c.gender === 'أنثى').length,
      marriedCount: activeConfessors.filter(c => c.socialStatus === 'متزوج').length,
      deaconsCount: activeConfessors.filter(c => c.isDeacon).length
    };
  }, [confessors, logs]);

  // Generate chart data for the last 6 months
  const chartData = useMemo(() => {
    const months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getMonth() === date.getMonth() && logDate.getFullYear() === date.getFullYear();
      });
      
      months.push({
        month: date.toLocaleDateString('ar-EG', { month: 'short' }),
        confessions: monthLogs.length
      });
    }
    
    return months;
  }, [logs]);

  const mainStats = [
    {
      title: 'إجمالي المعترفين',
      value: stats.totalConfessors.toLocaleString(),
      change: '+150',
      changeText: 'آخر 30 يوم',
      icon: 'users',
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      onClick: () => setCurrentPage('confessors')
    },
    {
      title: 'اعترافات هذا الشهر',
      value: stats.thisMonthConfessions.toLocaleString(),
      change: stats.confessionGrowth > 0 ? `+${stats.confessionGrowth}%` : `${stats.confessionGrowth}%`,
      changeText: 'مقارنة بالشهر الماضي',
      icon: 'log',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      onClick: () => setCurrentPage('confession-log')
    },
    {
      title: 'أعياد ميلاد هذا الشهر',
      value: stats.birthdaysThisMonth.toLocaleString(),
      change: '+12',
      changeText: 'آخر 30 يوم',
      icon: 'birthday',
      color: 'pink',
      bgGradient: 'from-pink-500 to-pink-600',
      onClick: () => setCurrentPage('birthdays')
    },
    {
      title: 'يحتاجون متابعة',
      value: stats.overdueCount.toLocaleString(),
      change: '-5',
      changeText: 'آخر 30 يوم',
      icon: 'alert-circle',
      color: 'red',
      bgGradient: 'from-red-500 to-red-600',
      onClick: () => setCurrentPage('confession-log')
    }
  ];

  const secondaryStats = [
    { label: 'ذكور', value: stats.maleCount, color: 'blue' },
    { label: 'إناث', value: stats.femaleCount, color: 'pink' },
    { label: 'متزوجون', value: stats.marriedCount, color: 'green' },
    { label: 'شمامسة', value: stats.deaconsCount, color: 'purple' }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'confession',
      title: 'اعتراف جديد',
      description: 'أحمد محمد - منذ ساعتين',
      time: '2 ساعات',
      icon: 'log',
      color: 'blue'
    },
    {
      id: 2,
      type: 'birthday',
      title: 'عيد ميلاد اليوم',
      description: 'فاطمة علي - 25 سنة',
      time: 'اليوم',
      icon: 'birthday',
      color: 'pink'
    },
    {
      id: 3,
      type: 'new_member',
      title: 'عضو جديد',
      description: 'مريم يوسف - انضمت للكنيسة',
      time: '3 ساعات',
      icon: 'users',
      color: 'green'
    },
    {
      id: 4,
      type: 'anniversary',
      title: 'عيد زواج',
      description: 'جورج وماريا - الذكرى الـ10',
      time: 'أمس',
      icon: 'birthday',
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">لوحة المعلومات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">مرحباً بك، إليك نظرة عامة على أنشطة الكنيسة</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="اليوم">اليوم</option>
            <option value="هذا الأسبوع">هذا الأسبوع</option>
            <option value="هذا الشهر">هذا الشهر</option>
            <option value="هذا العام">هذا العام</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Icon name="export" className="w-4 h-4" />
            تصدير
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <div 
            key={index}
            onClick={stat.onClick}
            className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100 dark:border-gray-700"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} shadow-lg`}>
                  <Icon name={stat.icon} className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    stat.change.startsWith('+') ? 'text-green-600' : 
                    stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {stat.changeText}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Confessions Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">إحصائيات الاعترافات</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">آخر 6 أشهر</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.thisMonthConfessions}
              </span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                stats.confessionGrowth >= 0 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {stats.confessionGrowth >= 0 ? '+' : ''}{stats.confessionGrowth}%
              </span>
            </div>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="relative h-64">
            <div className="flex items-end justify-between h-full gap-3">
              {chartData.map((data, index) => {
                const maxValue = Math.max(...chartData.map(d => d.confessions));
                const height = maxValue > 0 ? (data.confessions / maxValue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500 relative group"
                      style={{ height: `${height}%`, minHeight: '8px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {data.confessions}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
                      {data.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Demographics Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">التوزيع الديموغرافي</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">إحصائيات المعترفين</p>
          </div>
          
          {/* Simple Donut Chart Representation */}
          <div className="relative w-40 h-40 mx-auto mb-6">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 p-2">
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalConfessors}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    إجمالي
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {secondaryStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${stat.color}-500`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">الأنشطة الأخيرة</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              عرض الكل
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className={`p-2 rounded-lg bg-${activity.color}-100 dark:bg-${activity.color}-900`}>
                  <Icon name={activity.icon} className={`w-4 h-4 text-${activity.color}-600 dark:text-${activity.color}-400`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {activity.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">إجراءات سريعة</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">المهام الأكثر استخداماً</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setCurrentPage('confessors')}
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800 dark:hover:to-blue-700 transition-all duration-200 group"
            >
              <Icon name="add" className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                إضافة معترف
              </div>
            </button>
            
            <button 
              onClick={() => setCurrentPage('confession-log')}
              className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800 dark:hover:to-purple-700 transition-all duration-200 group"
            >
              <Icon name="log" className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                تسجيل اعتراف
              </div>
            </button>
            
            <button 
              onClick={() => setCurrentPage('messages')}
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl hover:from-green-100 hover:to-green-200 dark:hover:from-green-800 dark:hover:to-green-700 transition-all duration-200 group"
            >
              <Icon name="messages" className="w-6 h-6 text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-semibold text-green-900 dark:text-green-100">
                إرسال رسالة
              </div>
            </button>
            
            <button 
              onClick={() => setCurrentPage('reports')}
              className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-xl hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-800 dark:hover:to-orange-700 transition-all duration-200 group"
            >
              <Icon name="reports" className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                عرض التقارير
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icon name="bell" className="w-5 h-5 text-yellow-500" />
              التنبيهات المهمة
            </h3>
            <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full font-medium">
              {notifications.length}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notifications.slice(0, 3).map(notification => (
              <div key={notification.id} className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-xl border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-start gap-3">
                  <Icon name="alert-circle" className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                      {notification.message}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      {new Date(notification.timestamp).toLocaleString('ar-EG', { 
                        day: 'numeric', 
                        month: 'short', 
                        hour: 'numeric', 
                        minute: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {notifications.length > 3 && (
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                عرض جميع التنبيهات ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};