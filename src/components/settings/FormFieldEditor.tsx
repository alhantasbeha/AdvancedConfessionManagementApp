import React, { useState } from 'react';
import { useFormSettings } from '../../hooks/useFormSettings';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../ui/Icon';
import { FormSettings, FormField, Settings } from '../../types';

interface FormFieldEditorProps {
  formSettings: FormSettings;
  settings: Settings;
}

export const FormFieldEditor: React.FC<FormFieldEditorProps> = ({ formSettings, settings }) => {
  const { user } = useAppContext();
  const { addField, updateField, deleteField } = useFormSettings(user?.uid);
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newField, setNewField] = useState<Partial<FormField>>({
    name: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: [],
    group: '',
    visible: true,
    width: 'full',
    validation: {}
  });

  const fieldTypes = [
    { value: 'text', label: 'نص' },
    { value: 'number', label: 'رقم' },
    { value: 'email', label: 'بريد إلكتروني' },
    { value: 'tel', label: 'هاتف' },
    { value: 'date', label: 'تاريخ' },
    { value: 'select', label: 'قائمة منسدلة' },
    { value: 'multiselect', label: 'اختيار متعدد' },
    { value: 'textarea', label: 'نص طويل' },
    { value: 'checkbox', label: 'مربع اختيار' },
    { value: 'radio', label: 'اختيار واحد' },
    { value: 'image', label: 'صورة' }
  ];

  const widthOptions = [
    { value: 'full', label: 'عرض كامل' },
    { value: 'half', label: 'نصف العرض' },
    { value: 'third', label: 'ثلث العرض' }
  ];

  const handleAddField = async () => {
    if (!newField.name?.trim() || !newField.label?.trim() || !newField.group) return;

    const field: FormField = {
      id: newField.name!.toLowerCase().replace(/\s+/g, '_'),
      name: newField.name!.toLowerCase().replace(/\s+/g, '_'),
      label: newField.label!,
      type: newField.type!,
      required: newField.required!,
      placeholder: newField.placeholder,
      options: newField.options,
      validation: newField.validation,
      group: newField.group!,
      order: formSettings.fields.filter(f => f.group === newField.group).length + 1,
      visible: newField.visible!,
      width: newField.width!
    };

    await addField(field);
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: [],
      group: '',
      visible: true,
      width: 'full',
      validation: {}
    });
    setShowAddField(false);
  };

  const handleUpdateField = async (fieldId: string, updates: Partial<FormField>) => {
    await updateField(fieldId, updates);
    setEditingField(null);
  };

  const handleDeleteField = async (fieldId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحقل؟')) {
      await deleteField(fieldId);
    }
  };

  const moveField = async (fieldId: string, direction: 'up' | 'down') => {
    const field = formSettings.fields.find(f => f.id === fieldId);
    if (!field) return;

    const groupFields = formSettings.fields.filter(f => f.group === field.group);
    const newOrder = direction === 'up' ? field.order - 1 : field.order + 1;
    const otherField = groupFields.find(f => f.order === newOrder);

    if (otherField) {
      await updateField(field.id, { order: newOrder });
      await updateField(otherField.id, { order: field.order });
    }
  };

  const getFieldsByGroup = (groupName: string) => {
    return formSettings.fields
      .filter(f => f.group === groupName)
      .sort((a, b) => a.order - b.order);
  };

  const getOptionsForField = (fieldType: string) => {
    switch (fieldType) {
      case 'select':
      case 'multiselect':
        if (newField.name === 'profession') return settings.professions || [];
        if (newField.name === 'services') return settings.services || [];
        if (newField.name === 'personalTags') return settings.personalTags || [];
        return [];
      default:
        return [];
    }
  };

  const filteredGroups = selectedGroup 
    ? formSettings.groups.filter(g => g.name === selectedGroup)
    : formSettings.groups.sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold flex items-center gap-2">
          <Icon name="edit" className="w-5 h-5 text-green-500" />
          حقول الاستمارة
        </h4>
        <div className="flex items-center gap-2">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">جميع المجموعات</option>
            {formSettings.groups.map(group => (
              <option key={group.id} value={group.name}>{group.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddField(true)}
            className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
          >
            <Icon name="add" className="w-4 h-4" />
            إضافة حقل
          </button>
        </div>
      </div>

      {/* Add Field Form */}
      {showAddField && (
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg mb-4">
          <h5 className="font-semibold mb-3">إضافة حقل جديد</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">اسم الحقل (بالإنجليزية)</label>
              <input
                type="text"
                value={newField.name || ''}
                onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                placeholder="field_name"
                className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تسمية الحقل</label>
              <input
                type="text"
                value={newField.label || ''}
                onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                placeholder="تسمية الحقل"
                className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">نوع الحقل</label>
              <select
                value={newField.type || 'text'}
                onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
              >
                {fieldTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المجموعة</label>
              <select
                value={newField.group || ''}
                onChange={(e) => setNewField(prev => ({ ...prev, group: e.target.value }))}
                className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">اختر المجموعة</option>
                {formSettings.groups.map(group => (
                  <option key={group.id} value={group.name}>{group.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">عرض الحقل</label>
              <select
                value={newField.width || 'full'}
                onChange={(e) => setNewField(prev => ({ ...prev, width: e.target.value as any }))}
                className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
              >
                {widthOptions.map(width => (
                  <option key={width.value} value={width.value}>{width.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">النص التوضيحي</label>
              <input
                type="text"
                value={newField.placeholder || ''}
                onChange={(e) => setNewField(prev => ({ ...prev, placeholder: e.target.value }))}
                placeholder="النص التوضيحي"
                className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Image field specific settings */}
            {newField.type === 'image' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">الحد الأقصى لحجم الملف (ميجابايت)</label>
                  <input
                    type="number"
                    value={newField.validation?.maxFileSize || 5}
                    onChange={(e) => setNewField(prev => ({ 
                      ...prev, 
                      validation: { 
                        ...prev.validation, 
                        maxFileSize: parseInt(e.target.value) 
                      } 
                    }))}
                    min="1"
                    max="50"
                    className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">أنواع الملفات المسموحة</label>
                  <select
                    multiple
                    value={newField.validation?.allowedTypes || ['image/jpeg', 'image/png', 'image/webp']}
                    onChange={(e) => {
                      const selectedTypes = Array.from(e.target.selectedOptions, option => option.value);
                      setNewField(prev => ({ 
                        ...prev, 
                        validation: { 
                          ...prev.validation, 
                          allowedTypes: selectedTypes 
                        } 
                      }));
                    }}
                    className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                    <option value="image/gif">GIF</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">اضغط Ctrl/Cmd لاختيار متعدد</p>
                </div>
              </>
            )}

            <div className="md:col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newField.required || false}
                  onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm">حقل مطلوب</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newField.visible !== false}
                  onChange={(e) => setNewField(prev => ({ ...prev, visible: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm">مرئي</span>
              </label>
            </div>
            {(newField.type === 'select' || newField.type === 'multiselect' || newField.type === 'radio') && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">الخيارات (كل خيار في سطر)</label>
                <textarea
                  value={newField.options?.join('\n') || ''}
                  onChange={(e) => setNewField(prev => ({ ...prev, options: e.target.value.split('\n').filter(o => o.trim()) }))}
                  placeholder="خيار 1&#10;خيار 2&#10;خيار 3"
                  rows={3}
                  className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddField}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
            >
              إضافة
            </button>
            <button
              onClick={() => setShowAddField(false)}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Quick Add Profile Image Button */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h5 className="font-semibold text-blue-800 dark:text-blue-200">إضافة سريعة: حقل الصورة الشخصية</h5>
            <p className="text-sm text-blue-600 dark:text-blue-300">اضغط لإضافة حقل الصورة الشخصية بإعدادات افتراضية مُحسنة</p>
          </div>
          <button
            onClick={() => {
              const profileImageField: FormField = {
                id: 'profile_image',
                name: 'profile_image',
                label: 'الصورة الشخصية',
                type: 'image',
                required: false,
                placeholder: 'اختر صورة شخصية',
                validation: {
                  maxFileSize: 5,
                  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
                },
                group: 'personal',
                order: 1,
                visible: true,
                width: 'half'
              };
              addField(profileImageField);
            }}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            <Icon name="add" className="w-4 h-4" />
            إضافة حقل الصورة
          </button>
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredGroups.map(group => {
          const groupFields = getFieldsByGroup(group.name);
          if (groupFields.length === 0) return null;

          return (
            <div key={group.id} className="border rounded-lg p-3">
              <h5 className="font-semibold text-sm mb-3 text-blue-600 dark:text-blue-400">
                {group.label} ({groupFields.length} حقل)
              </h5>
              <div className="space-y-2">
                {groupFields.map(field => (
                  <div key={field.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded border">
                    {editingField?.id === field.id ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium mb-1">تسمية الحقل</label>
                            <input
                              type="text"
                              value={editingField.label}
                              onChange={(e) => setEditingField(prev => prev ? { ...prev, label: e.target.value } : null)}
                              className="w-full p-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">النص التوضيحي</label>
                            <input
                              type="text"
                              value={editingField.placeholder || ''}
                              onChange={(e) => setEditingField(prev => prev ? { ...prev, placeholder: e.target.value } : null)}
                              className="w-full p-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500"
                            />
                          </div>
                        </div>
                        {editingField.type === 'image' && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium mb-1">حجم الملف الأقصى (MB)</label>
                              <input
                                type="number"
                                value={editingField.validation?.maxFileSize || 5}
                                onChange={(e) => setEditingField(prev => prev ? { 
                                  ...prev, 
                                  validation: { 
                                    ...prev.validation, 
                                    maxFileSize: parseInt(e.target.value) 
                                  } 
                                } : null)}
                                min="1"
                                max="50"
                                className="w-full p-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500"
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={editingField.required}
                              onChange={(e) => setEditingField(prev => prev ? { ...prev, required: e.target.checked } : null)}
                              className="w-3 h-3"
                            />
                            <span className="text-xs">مطلوب</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={editingField.visible}
                              onChange={(e) => setEditingField(prev => prev ? { ...prev, visible: e.target.checked } : null)}
                              className="w-3 h-3"
                            />
                            <span className="text-xs">مرئي</span>
                          </label>
                          <select
                            value={editingField.width}
                            onChange={(e) => setEditingField(prev => prev ? { ...prev, width: e.target.value as any } : null)}
                            className="p-1 border rounded text-xs dark:bg-gray-600 dark:border-gray-500"
                          >
                            {widthOptions.map(width => (
                              <option key={width.value} value={width.value}>{width.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdateField(field.id, editingField)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingField(null)}
                            className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <h6 className="font-medium text-sm flex items-center gap-2">
                            {field.label}
                            {field.type === 'image' && <Icon name="birthday" className="w-4 h-4 text-purple-500" />}
                          </h6>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {field.name} • {fieldTypes.find(t => t.value === field.type)?.label} • 
                            {field.required ? ' مطلوب' : ' اختياري'} • 
                            {field.visible ? ' مرئي' : ' مخفي'} • 
                            {widthOptions.find(w => w.value === field.width)?.label}
                            {field.type === 'image' && field.validation?.maxFileSize && 
                              ` • حد أقصى ${field.validation.maxFileSize}MB`
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveField(field.id, 'up')}
                            disabled={field.order === 1}
                            className="p-1 text-gray-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="تحريك لأعلى"
                          >
                            <Icon name="arrowLeft" className="w-3 h-3 transform rotate-90" />
                          </button>
                          <button
                            onClick={() => moveField(field.id, 'down')}
                            disabled={field.order === groupFields.length}
                            className="p-1 text-gray-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="تحريك لأسفل"
                          >
                            <Icon name="arrowLeft" className="w-3 h-3 transform -rotate-90" />
                          </button>
                          <button
                            onClick={() => setEditingField(field)}
                            className="p-1 text-blue-500 hover:text-blue-700"
                            title="تعديل"
                          >
                            <Icon name="edit" className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteField(field.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="حذف"
                          >
                            <Icon name="delete" className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {formSettings.fields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Icon name="edit" className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>لا توجد حقول. ابدأ بإضافة حقل جديد.</p>
        </div>
      )}
    </div>
  );
};