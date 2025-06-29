import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';
import { Icon } from '../ui/Icon';
import { MessageTemplate } from '../../types';

interface MessageTemplateModalProps {
  template: MessageTemplate | null;
  onClose: () => void;
  userId: string | undefined;
}

export const MessageTemplateModal: React.FC<MessageTemplateModalProps> = ({
  template,
  onClose,
  userId
}) => {
  const [formData, setFormData] = useState<Omit<MessageTemplate, 'id'>>({
    title: '',
    body: ''
  });

  const [previewText, setPreviewText] = useState('');

  const availableVariables = [
    { key: '{الاسم_الأول}', description: 'الاسم الأول للشخص', example: 'أحمد' },
    { key: '{اسم_العائلة}', description: 'اسم العائلة', example: 'محمد' },
    { key: '{اسم_الزوج}', description: 'اسم الزوج (للأزواج)', example: 'أحمد' },
    { key: '{اسم_الزوجة}', description: 'اسم الزوجة (للأزواج)', example: 'فاطمة' }
  ];

  const templateSuggestions = [
    {
      category: 'عيد ميلاد',
      templates: [
        {
          title: 'تهنئة عيد ميلاد بسيطة',
          body: 'كل عام وأنت بخير يا {الاسم_الأول}! أسأل الله أن يبارك في عمرك ويحفظك من كل شر. عيد ميلاد سعيد! 🎉'
        },
        {
          title: 'تهنئة عيد ميلاد مفصلة',
          body: 'أبارك لك يا {الاسم_الأول} {اسم_العائلة} بمناسبة عيد ميلادك، وأسأل الله العلي القدير أن يمنحك الصحة والعافية والسعادة، وأن يبارك في عمرك ويجعل كل أيامك خيراً وبركة. كل عام وأنت بألف خير! 🎂🎉'
        }
      ]
    },
    {
      category: 'عيد زواج',
      templates: [
        {
          title: 'تهنئة عيد زواج',
          body: 'بارك الله لكما يا {اسم_الزوج} و {اسم_الزوجة} بمناسبة ذكرى زواجكما، وأدام عليكما المحبة والوئام، وبارك في بيتكما وأولادكما. كل عام وأنتما بخير! 💕'
        },
        {
          title: 'تهنئة ذكرى زواج مفصلة',
          body: 'أهنئكما يا {اسم_الزوج} و {اسم_الزوجة} بمناسبة ذكرى زواجكما السعيد، وأسأل الله أن يديم عليكما نعمة المحبة والتفاهم، وأن يبارك في بيتكما ويرزقكما السعادة والهناء. كل عام وأنتما بألف خير! 🌹💍'
        }
      ]
    }
  ];

  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title,
        body: template.body
      });
    } else {
      setFormData({
        title: '',
        body: ''
      });
    }
  }, [template]);

  useEffect(() => {
    // Generate preview with sample data
    let preview = formData.body;
    preview = preview.replace(/{الاسم_الأول}/g, 'أحمد');
    preview = preview.replace(/{اسم_العائلة}/g, 'محمد');
    preview = preview.replace(/{اسم_الزوج}/g, 'أحمد');
    preview = preview.replace(/{اسم_الزوجة}/g, 'فاطمة');
    setPreviewText(preview);
  }, [formData.body]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !formData.title.trim() || !formData.body.trim()) return;

    try {
      const collectionRef = collection(db, `artifacts/${appId}/users/${userId}/messageTemplates`);
      if (template?.id) {
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/messageTemplates`, template.id);
        await updateDoc(docRef, formData);
      } else {
        await addDoc(collectionRef, formData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving message template:", error);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.querySelector('textarea[name="body"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = formData.body.substring(0, start) + variable + formData.body.substring(end);
      setFormData(prev => ({ ...prev, body: newValue }));
      
      // Reset cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const useSuggestion = (suggestion: { title: string; body: string }) => {
    setFormData(suggestion);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Icon name="messages" className="w-6 h-6 text-blue-500" />
            {template ? 'تعديل قالب الرسالة' : 'إضافة قالب رسالة جديد'}
          </h3>
          <button onClick={onClose}>
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">عنوان القالب *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="مثال: تهنئة عيد ميلاد"
                    required
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">نص الرسالة *</label>
                  <textarea
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    placeholder="اكتب نص الرسالة هنا... يمكنك استخدام المتغيرات مثل {الاسم_الأول}"
                    rows={8}
                    required
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    {template ? 'حفظ التعديلات' : 'إضافة القالب'}
                  </button>
                </div>
              </form>

              {/* Variables Section */}
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="settings" className="w-5 h-5 text-blue-500" />
                  المتغيرات المتاحة
                </h4>
                <div className="space-y-2">
                  {availableVariables.map(variable => (
                    <div key={variable.key} className="flex items-center justify-between">
                      <div>
                        <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-sm">
                          {variable.key}
                        </code>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {variable.description} (مثال: {variable.example})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => insertVariable(variable.key)}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                      >
                        إدراج
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview and Suggestions Section */}
            <div className="space-y-6">
              {/* Preview */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="search" className="w-5 h-5 text-green-500" />
                  معاينة الرسالة
                </h4>
                <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg border min-h-[120px]">
                  {previewText ? (
                    <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
                      {previewText}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">اكتب نص الرسالة لرؤية المعاينة</p>
                  )}
                </div>
              </div>

              {/* Template Suggestions */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="messages" className="w-5 h-5 text-purple-500" />
                  قوالب جاهزة
                </h4>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {templateSuggestions.map(category => (
                    <div key={category.category}>
                      <h5 className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {category.category}
                      </h5>
                      <div className="space-y-2">
                        {category.templates.map((suggestion, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded border">
                            <div className="flex justify-between items-start mb-2">
                              <h6 className="font-medium text-sm">{suggestion.title}</h6>
                              <button
                                type="button"
                                onClick={() => useSuggestion(suggestion)}
                                className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors"
                              >
                                استخدام
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                              {suggestion.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};