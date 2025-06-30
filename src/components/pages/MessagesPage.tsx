import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useSQLiteMessageTemplates } from '../../hooks/useSQLiteMessageTemplates';
import { Icon } from '../ui/Icon';
import { MessageTemplateModal } from '../modals/MessageTemplateModal';
import { MessageTemplate } from '../../types';

export const MessagesPage: React.FC = () => {
  const { user } = useAppContext();
  const { templates, loading, deleteTemplate } = useSQLiteMessageTemplates();
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const categories = ['الكل', 'عيد ميلاد', 'عيد زواج', 'تهنئة', 'تعزية', 'دعوة', 'أخرى'];

  const getTemplateCategory = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('ميلاد')) return 'عيد ميلاد';
    if (lowerTitle.includes('زواج') || lowerTitle.includes('ذكرى')) return 'عيد زواج';
    if (lowerTitle.includes('تهنئة')) return 'تهنئة';
    if (lowerTitle.includes('تعزية') || lowerTitle.includes('عزاء')) return 'تعزية';
    if (lowerTitle.includes('دعوة')) return 'دعوة';
    return 'أخرى';
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || getTemplateCategory(template.title) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    setEditingTemplate(null);
    setShowModal(true);
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setShowModal(true);
  };

  const handleDelete = async (templateId: string) => {
    await deleteTemplate(templateId);
    setShowDeleteConfirm(null);
  };

  const handleDuplicate = (template: MessageTemplate) => {
    const duplicatedTemplate = {
      ...template,
      title: `${template.title} - نسخة`,
      id: undefined
    };
    setEditingTemplate(duplicatedTemplate);
    setShowModal(true);
  };

  const previewMessage = (template: MessageTemplate) => {
    let preview = template.body;
    preview = preview.replace(/{الاسم_الأول}/g, 'أحمد');
    preview = preview.replace(/{اسم_العائلة}/g, 'محمد');
    preview = preview.replace(/{اسم_الزوج}/g, 'أحمد');
    preview = preview.replace(/{اسم_الزوجة}/g, 'فاطمة');
    return preview;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'عيد ميلاد': return 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200';
      case 'عيد زواج': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'تهنئة': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'تعزية': return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
      case 'دعوة': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default: return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
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
          <Icon name="messages" className="w-6 h-6 text-blue-500" />
          إدارة قوالب الرسائل
        </h3>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Icon name="add" className="w-5 h-5" />
          إضافة قالب جديد
        </button>
      </div>

      {/* Filters */}
      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="البحث في القوالب..." 
              className="w-full p-2 pr-10 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Icon name="search" className="w-5 h-5 absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-center">
          <Icon name="messages" className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{templates.length}</p>
          <p className="text-blue-600 dark:text-blue-300 text-sm">إجمالي القوالب</p>
        </div>
        <div className="bg-pink-50 dark:bg-pink-900 p-4 rounded-lg text-center">
          <Icon name="birthday" className="w-8 h-8 mx-auto text-pink-500 mb-2" />
          <p className="text-2xl font-bold text-pink-700 dark:text-pink-200">
            {templates.filter(t => getTemplateCategory(t.title) === 'عيد ميلاد').length}
          </p>
          <p className="text-pink-600 dark:text-pink-300 text-sm">أعياد ميلاد</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg text-center">
          <Icon name="birthday" className="w-8 h-8 mx-auto text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">
            {templates.filter(t => getTemplateCategory(t.title) === 'عيد زواج').length}
          </p>
          <p className="text-purple-600 dark:text-purple-300 text-sm">أعياد زواج</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
          <Icon name="messages" className="w-8 h-8 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-700 dark:text-green-200">
            {templates.filter(t => ['تهنئة', 'دعوة', 'أخرى'].includes(getTemplateCategory(t.title))).length}
          </p>
          <p className="text-green-600 dark:text-green-300 text-sm">أخرى</p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Icon name="messages" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">لا توجد قوالب تطابق البحث</p>
            <button 
              onClick={handleAdd}
              className="mt-4 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors mx-auto"
            >
              <Icon name="add" className="w-5 h-5" />
              إضافة قالب جديد
            </button>
          </div>
        ) : (
          filteredTemplates.map(template => {
            const category = getTemplateCategory(template.title);
            return (
              <div key={template.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2">{template.title}</h4>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                      {category}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(template)}
                      className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full"
                      title="تعديل"
                    >
                      <Icon name="edit" className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDuplicate(template)}
                      className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded-full"
                      title="نسخ"
                    >
                      <Icon name="add" className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(template.id!)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                      title="حذف"
                    >
                      <Icon name="delete" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-3 rounded border mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-4">
                    {template.body}
                  </p>
                </div>
                
                <div className="border-t pt-3">
                  <h5 className="font-semibold text-sm mb-2">معاينة:</h5>
                  <div className="bg-green-50 dark:bg-green-900 p-3 rounded text-sm">
                    <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap line-clamp-3">
                      {previewMessage(template)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>المتغيرات المستخدمة:</span>
                    <div className="flex flex-wrap gap-1">
                      {template.body.includes('{الاسم_الأول}') && (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded">الاسم الأول</span>
                      )}
                      {template.body.includes('{اسم_العائلة}') && (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded">اسم العائلة</span>
                      )}
                      {template.body.includes('{اسم_الزوج}') && (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded">اسم الزوج</span>
                      )}
                      {template.body.includes('{اسم_الزوجة}') && (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded">اسم الزوجة</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <MessageTemplateModal 
          template={editingTemplate}
          onClose={() => setShowModal(false)}
          userId={user?.uid}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <Icon name="delete" className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-bold mb-4">تأكيد الحذف</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                هل أنت متأكد من رغبتك في حذف هذا القالب؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-6 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  تأكيد الحذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};