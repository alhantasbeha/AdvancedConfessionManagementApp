import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useSQLiteSettings } from '../../hooks/useSQLiteSettings';
import { exportDatabase, importDatabase, clearDatabase } from '../../config/sqlite';
import { Icon } from '../ui/Icon';

export const SettingsPage: React.FC = () => {
  const { user } = useAppContext();
  const { settings, loading, updateSettings } = useSQLiteSettings();
  const [newItems, setNewItems] = useState({
    professions: '',
    services: '',
    personalTags: '',
    confessionTags: ''
  });
  const [activeTab, setActiveTab] = useState('lists');

  const tabs = [
    { id: 'lists', label: 'القوائم المخصصة', icon: 'settings' },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: 'archive' },
    { id: 'preferences', label: 'التفضيلات', icon: 'settings' }
  ];

  const listConfigs = [
    {
      key: 'professions' as keyof typeof settings,
      title: 'المهن',
      description: 'قائمة المهن المتاحة للاختيار',
      icon: 'users',
      color: 'blue'
    },
    {
      key: 'services' as keyof typeof settings,
      title: 'الخدمات',
      description: 'الخدمات الكنسية المختلفة',
      icon: 'settings',
      color: 'green'
    },
    {
      key: 'personalTags' as keyof typeof settings,
      title: 'العلامات الشخصية',
      description: 'علامات لتصنيف المعترفين',
      icon: 'birthday',
      color: 'purple'
    },
    {
      key: 'confessionTags' as keyof typeof settings,
      title: 'علامات الاعتراف',
      description: 'علامات لتصنيف جلسات الاعتراف',
      icon: 'log',
      color: 'orange'
    }
  ];

  const handleAddItem = async (listKey: keyof typeof settings) => {
    const newValue = newItems[listKey].trim();
    if (!newValue) return;

    const currentList = settings[listKey] || [];
    if (currentList.includes(newValue)) {
      alert('هذا العنصر موجود بالفعل في القائمة');
      return;
    }

    const updatedList = [...currentList, newValue];
    await updateSettings({ [listKey]: updatedList });
    setNewItems(prev => ({ ...prev, [listKey]: '' }));
  };

  const handleRemoveItem = async (listKey: keyof typeof settings, itemToRemove: string) => {
    const currentList = settings[listKey] || [];
    const updatedList = currentList.filter(item => item !== itemToRemove);
    await updateSettings({ [listKey]: updatedList });
  };

  const handleExportData = () => {
    exportDatabase();
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importDatabase(file);
      alert('تم استيراد قاعدة البيانات بنجاح');
      window.location.reload();
    } catch (error) {
      alert('خطأ في استيراد قاعدة البيانات');
      console.error(error);
    }
  };

  const handleClearDatabase = async () => {
    const success = await clearDatabase();
    if (success) {
      alert('تم مسح قاعدة البيانات بنجاح');
      window.location.reload();
    }
  };

  const resetToDefaults = async () => {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟')) {
      const defaultSettings = {
        professions: ['مهندس', 'طبيب', 'محاسب', 'صيدلي', 'محامي', 'مدرس', 'موظف', 'ربة منزل'],
        services: ['خدمة مدارس الأحد', 'خدمة شباب', 'كورال', 'خدمة اجتماعية'],
        personalTags: ['طالب', 'مغترب'],
        confessionTags: ['نمو روحي', 'مشاكل أسرية', 'مشاكل شخصية', 'ضعف عام']
      };
      await updateSettings(defaultSettings);
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 dark:bg-blue-800/30 border-blue-200 dark:border-blue-600',
      green: 'bg-green-50 dark:bg-green-800/30 border-green-200 dark:border-green-600',
      purple: 'bg-purple-50 dark:bg-purple-800/30 border-purple-200 dark:border-purple-600',
      orange: 'bg-orange-50 dark:bg-orange-800/30 border-orange-200 dark:border-orange-600'
    };
    return colorMap[color] || colorMap.blue;
  };

  const renderListManager = (config: typeof listConfigs[0]) => {
    const { key, title, description, icon, color } = config;
    const items = settings[key] || [];

    return (
      <div key={key} className={`p-6 rounded-lg border ${getColorClasses(color)}`}>
        <div className="flex items-center gap-3 mb-4">
          <Icon name={icon} className={`w-6 h-6 text-${color}-500`} />
          <div>
            <h4 className="font-bold text-lg">{title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder={`إضافة ${title.slice(0, -1)} جديد...`}
            value={newItems[key]}
            onChange={(e) => setNewItems(prev => ({ ...prev, [key]: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem(key)}
            className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <button 
            onClick={() => handleAddItem(key)}
            className={`px-4 py-2 bg-${color}-500 text-white rounded hover:bg-${color}-600 transition-colors`}
          >
            إضافة
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">العناصر ({items.length})</span>
            {items.length > 0 && (
              <button
                onClick={() => confirm(`هل تريد حذف جميع ${title}؟`) && updateSettings({ [key]: [] })}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                حذف الكل
              </button>
            )}
          </div>
          
          <div className="max-h-40 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">لا توجد عناصر</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <span 
                    key={item} 
                    className={`bg-${color}-100 dark:bg-${color}-700/50 text-${color}-800 dark:text-${color}-100 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2 border border-${color}-200 dark:border-${color}-500`}
                  >
                    {item}
                    <button 
                      onClick={() => handleRemoveItem(key, item)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <Icon name="x" className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBackupTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Icon name="export" className="w-6 h-6 text-blue-500" />
          تصدير قاعدة البيانات
        </h4>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          قم بتصدير جميع بياناتك لحفظها كنسخة احتياطية
        </p>
        <button 
          onClick={handleExportData}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Icon name="export" className="w-5 h-5" />
          تصدير قاعدة البيانات
        </button>
      </div>

      <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg">
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Icon name="archive" className="w-6 h-6 text-green-500" />
          استيراد قاعدة البيانات
        </h4>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          استيراد قاعدة بيانات محفوظة مسبقاً
        </p>
        <input
          type="file"
          accept=".db"
          onChange={handleImportData}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
      </div>

      <div className="bg-red-50 dark:bg-red-900 p-6 rounded-lg">
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Icon name="delete" className="w-6 h-6 text-red-500" />
          مسح قاعدة البيانات
        </h4>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          مسح جميع البيانات وإعادة إنشاء قاعدة بيانات جديدة
        </p>
        <button 
          onClick={handleClearDatabase}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          <Icon name="delete" className="w-5 h-5" />
          مسح قاعدة البيانات
        </button>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900 p-6 rounded-lg">
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Icon name="settings" className="w-6 h-6 text-yellow-500" />
          إعادة تعيين الإعدادات
        </h4>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          إعادة تعيين جميع الإعدادات إلى القيم الافتراضية
        </p>
        <button 
          onClick={resetToDefaults}
          className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
        >
          <Icon name="settings" className="w-5 h-5" />
          إعادة تعيين الإعدادات
        </button>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
        <h4 className="font-bold text-lg mb-4">تفضيلات التطبيق</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium">إشعارات أعياد الميلاد</h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">تلقي إشعارات عند اقتراب أعياد الميلاد</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium">إشعارات أعياد الزواج</h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">تلقي إشعارات عند اقتراب أعياد الزواج</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium">تذكير الاعترافات المتأخرة</h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">تذكير بالمعترفين المتأخرين عن الاعتراف</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
        <h4 className="font-bold text-lg mb-4">إعدادات التذكير</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">فترة التذكير للاعتراف (بالأيام)</label>
            <select className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500" defaultValue="60">
              <option value="30">30 يوم</option>
              <option value="45">45 يوم</option>
              <option value="60">60 يوم</option>
              <option value="90">90 يوم</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">تذكير أعياد الميلاد مسبقاً</label>
            <select className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500" defaultValue="7">
              <option value="1">يوم واحد</option>
              <option value="3">3 أيام</option>
              <option value="7">أسبوع</option>
              <option value="14">أسبوعين</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
        <h4 className="font-bold text-lg mb-4">معلومات النظام</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>نوع قاعدة البيانات:</span>
            <span className="font-medium">SQLite (محلي)</span>
          </div>
          <div className="flex justify-between">
            <span>حالة الاتصال:</span>
            <span className="font-medium text-green-600">متصل</span>
          </div>
          <div className="flex justify-between">
            <span>إصدار التطبيق:</span>
            <span className="font-medium">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Icon name="settings" className="w-6 h-6 text-blue-500" />
          الإعدادات (SQLite)
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            <Icon name={tab.icon} className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'lists' && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <h4 className="font-bold mb-2">إدارة القوائم المخصصة</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                يمكنك إضافة وإدارة القوائم المخصصة التي تظهر في نماذج إدخال البيانات. البيانات محفوظة محلياً في متصفحك.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {listConfigs.map(renderListManager)}
            </div>
          </div>
        )}

        {activeTab === 'backup' && renderBackupTab()}
        {activeTab === 'preferences' && renderPreferencesTab()}
      </div>
    </div>
  );
};