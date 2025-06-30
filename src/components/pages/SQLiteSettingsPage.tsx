import React, { useState } from 'react';
import { useSQLiteSettings } from '../../hooks/useSQLiteSettings';
import { exportDatabase, importDatabase } from '../../config/sqlite';
import { Icon } from '../ui/Icon';

export const SQLiteSettingsPage: React.FC = () => {
  const { settings, loading, updateSettings } = useSQLiteSettings();
  const [newItems, setNewItems] = useState({
    professions: '',
    services: '',
    personalTags: '',
    confessionTags: ''
  });

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
      window.location.reload(); // إعادة تحميل الصفحة لتحديث البيانات
    } catch (error) {
      alert('خطأ في استيراد قاعدة البيانات');
      console.error(error);
    }
  };

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
          إعدادات SQLite
        </h3>
      </div>

      {/* Database Management */}
      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
        <h4 className="font-bold mb-4">إدارة قاعدة البيانات</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-semibold mb-2">تصدير قاعدة البيانات</h5>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              احفظ نسخة احتياطية من جميع بياناتك
            </p>
            <button 
              onClick={handleExportData}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Icon name="export" className="w-5 h-5" />
              تصدير قاعدة البيانات
            </button>
          </div>
          
          <div>
            <h5 className="font-semibold mb-2">استيراد قاعدة البيانات</h5>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              استعادة البيانات من نسخة احتياطية
            </p>
            <input
              type="file"
              accept=".db"
              onChange={handleImportData}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
          </div>
        </div>
      </div>

      {/* Settings Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {listConfigs.map(config => {
          const { key, title, description, icon, color } = config;
          const items = settings[key] || [];

          return (
            <div key={key} className={`p-6 rounded-lg border bg-${color}-50 dark:bg-${color}-900 border-${color}-200 dark:border-${color}-700`}>
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
                          className={`bg-${color}-100 dark:bg-${color}-800 text-${color}-800 dark:text-${color}-200 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2`}
                        >
                          {item}
                          <button 
                            onClick={() => handleRemoveItem(key, item)}
                            className="text-red-500 hover:text-red-700"
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
        })}
      </div>
    </div>
  );
};