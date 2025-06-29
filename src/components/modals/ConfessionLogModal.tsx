import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';
import { Icon } from '../ui/Icon';
import { ConfessionLog, Confessor, Settings } from '../../types';

interface ConfessionLogModalProps {
  mode: 'add' | 'edit' | 'view';
  log: ConfessionLog | null;
  confessors: Confessor[];
  onClose: () => void;
  userId: string | undefined;
}

export const ConfessionLogModal: React.FC<ConfessionLogModalProps> = ({
  mode,
  log,
  confessors,
  onClose,
  userId
}) => {
  const [formData, setFormData] = useState<Omit<ConfessionLog, 'id'>>({
    confessorId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    tags: []
  });
  
  const [settings, setSettings] = useState<Settings>({
    professions: [],
    services: [],
    personalTags: [],
    confessionTags: []
  });

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  const modalTitles = {
    add: 'إضافة اعتراف جديد',
    edit: 'تعديل سجل اعتراف',
    view: 'عرض سجل اعتراف'
  };

  useEffect(() => {
    if (log) {
      setFormData({
        confessorId: log.confessorId || '',
        date: log.date || new Date().toISOString().split('T')[0],
        notes: log.notes || '',
        tags: log.tags || []
      });
    }
  }, [log]);

  useEffect(() => {
    if (!userId) return;
    const settingsDocRef = doc(db, `artifacts/${appId}/users/${userId}/settings`, 'customLists');
    const unsubscribe = onSnapshot(settingsDocRef, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as Settings);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (tag: string) => {
    if (isViewMode) return;
    
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewMode || !userId || !formData.confessorId || !formData.date) return;

    try {
      if (isEditMode && log?.id) {
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/confessionLogs`, log.id);
        await updateDoc(docRef, formData);
      } else {
        const collectionRef = collection(db, `artifacts/${appId}/users/${userId}/confessionLogs`);
        await addDoc(collectionRef, formData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving confession log:", error);
    }
  };

  const getConfessorName = (confessorId: string) => {
    const confessor = confessors.find(c => c.id === confessorId);
    return confessor ? `${confessor.firstName} ${confessor.familyName}` : 'غير معروف';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Icon name="log" className="w-6 h-6 text-blue-500" />
            {modalTitles[mode]}
          </h3>
          <button onClick={onClose}>
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Confessor Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">المعترف *</label>
            {isViewMode ? (
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="font-semibold">{getConfessorName(formData.confessorId)}</span>
              </div>
            ) : (
              <select
                name="confessorId"
                value={formData.confessorId}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" disabled>-- اختر المعترف --</option>
                {confessors
                  .filter(c => !c.isArchived && !c.isDeceased)
                  .sort((a, b) => `${a.firstName} ${a.familyName}`.localeCompare(`${b.firstName} ${b.familyName}`))
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {`${c.firstName} ${c.familyName}`}
                      {c.isDeacon && ' (شماس)'}
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">تاريخ الاعتراف *</label>
            {isViewMode ? (
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span>{new Date(formData.date).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}</span>
              </div>
            ) : (
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:[color-scheme:dark] focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              ملاحظات الاعتراف (سرية)
              {!isViewMode && <span className="text-gray-500 text-xs mr-2">اختياري</span>}
            </label>
            {isViewMode ? (
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[120px]">
                {formData.notes ? (
                  <p className="whitespace-pre-wrap">{formData.notes}</p>
                ) : (
                  <span className="text-gray-500 italic">لا توجد ملاحظات</span>
                )}
              </div>
            ) : (
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={6}
                placeholder="اكتب ملاحظات سرية عن جلسة الاعتراف..."
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              علامات الاعتراف
              {!isViewMode && <span className="text-gray-500 text-xs mr-2">اختياري</span>}
            </label>
            <div className="p-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              {settings.confessionTags && settings.confessionTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {settings.confessionTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagChange(tag)}
                      disabled={isViewMode}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.tags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      } ${isViewMode ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  لا توجد علامات متاحة. يمكنك إضافة علامات من صفحة الإعدادات.
                </p>
              )}
            </div>
            
            {formData.tags.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-500">العلامات المحددة: </span>
                <span className="text-xs font-medium">{formData.tags.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              {isViewMode ? 'إغلاق' : 'إلغاء'}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                {isEditMode ? 'حفظ التعديلات' : 'إضافة الاعتراف'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};