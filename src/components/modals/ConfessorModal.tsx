import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';
import { useFormSettings } from '../../hooks/useFormSettings';
import { useSettings } from '../../hooks/useSettings';
import { Icon } from '../ui/Icon';
import { Toggle } from '../ui/Toggle';
import { Confessor, FormField, FormGroup } from '../../types';

interface ConfessorModalProps {
  confessor: Confessor | null;
  allConfessors: Confessor[];
  onClose: () => void;
  userId: string;
}

export const ConfessorModal: React.FC<ConfessorModalProps> = ({ 
  confessor, 
  allConfessors, 
  onClose, 
  userId 
}) => {
  const { formSettings, loading: formLoading } = useFormSettings(userId);
  const { settings } = useSettings(userId);
  const [formData, setFormData] = useState<any>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [spouseSearch, setSpouseSearch] = useState('');
  const [childSearch, setChildSearch] = useState('');
  const [imagePreview, setImagePreview] = useState<Record<string, string>>({});

  const getConfessorNameById = useCallback((id: string) => {
    const found = allConfessors.find(c => c.id === id);
    return found ? `${found.firstName} ${found.familyName}` : 'غير معروف';
  }, [allConfessors]);

  // Initialize form data
  useEffect(() => {
    if (confessor) {
      setFormData({ ...confessor, customFields: confessor.customFields || {} });
      
      // Load existing image previews
      const previews: Record<string, string> = {};
      formSettings.fields.forEach(field => {
        if (field.type === 'image') {
          const imageValue = field.name.includes('.') 
            ? confessor.customFields?.[field.name.split('.')[1]]
            : confessor[field.name as keyof Confessor];
          if (imageValue) {
            previews[field.name] = imageValue as string;
          }
        }
      });
      setImagePreview(previews);
    } else {
      // Initialize with default values from form settings
      const initialData: any = { customFields: {} };
      formSettings.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          if (field.name.includes('.')) {
            // Handle nested fields (customFields)
            const [parent, child] = field.name.split('.');
            if (!initialData[parent]) initialData[parent] = {};
            initialData[parent][child] = field.defaultValue;
          } else {
            initialData[field.name] = field.defaultValue;
          }
        }
      });
      setFormData(initialData);
      setImagePreview({});
    }

    // Initialize expanded groups
    const initialExpanded: Record<string, boolean> = {};
    formSettings.groups.forEach(group => {
      initialExpanded[group.name] = group.defaultExpanded;
    });
    setExpandedGroups(initialExpanded);
  }, [confessor, formSettings]);

  const handleChange = (fieldName: string, value: any) => {
    if (fieldName.includes('.')) {
      // Handle nested fields (customFields)
      const [parent, child] = fieldName.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [fieldName]: value }));
    }
  };

  const handleImageChange = async (fieldName: string, file: File | null, field: FormField) => {
    if (!file) {
      handleChange(fieldName, '');
      setImagePreview(prev => ({ ...prev, [fieldName]: '' }));
      return;
    }

    // Validate file size
    const maxSize = (field.validation?.maxFileSize || 5) * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      alert(`حجم الملف كبير جداً. الحد الأقصى ${field.validation?.maxFileSize || 5} ميجابايت`);
      return;
    }

    // Validate file type
    const allowedTypes = field.validation?.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert(`نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedTypes.join(', ')}`);
      return;
    }

    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      handleChange(fieldName, base64String);
      setImagePreview(prev => ({ ...prev, [fieldName]: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleMultiSelectChange = (fieldName: string, value: string) => {
    const currentList = formData[fieldName] || [];
    const newList = currentList.includes(value)
      ? currentList.filter((item: string) => item !== value)
      : [...currentList, value];
    handleChange(fieldName, newList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      console.error("User not logged in.");
      return;
    }

    // Validate required fields
    const requiredFields = formSettings.fields.filter(field => field.required && field.visible);
    for (const field of requiredFields) {
      const value = field.name.includes('.') 
        ? formData[field.name.split('.')[0]]?.[field.name.split('.')[1]]
        : formData[field.name];
      
      if (!value || (Array.isArray(value) && value.length === 0)) {
        alert(`الحقل "${field.label}" مطلوب`);
        return;
      }
    }

    try {
      const collectionRef = collection(db, `artifacts/${appId}/users/${userId}/confessors`);
      if (confessor?.id) {
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/confessors`, confessor.id);
        await updateDoc(docRef, formData);
      } else {
        await addDoc(collectionRef, formData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving confessor:", error);
    }
  };

  const renderField = (field: FormField) => {
    if (!field.visible) return null;

    const value = field.name.includes('.') 
      ? formData[field.name.split('.')[0]]?.[field.name.split('.')[1]]
      : formData[field.name];

    const widthClass = {
      full: 'col-span-full',
      half: 'col-span-1 md:col-span-1',
      third: 'col-span-1 md:col-span-1 lg:col-span-1'
    }[field.width] || 'col-span-1';

    const commonProps = {
      id: field.name,
      name: field.name,
      required: field.required,
      className: "w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
    };

    const renderFieldInput = () => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'tel':
          return (
            <input
              {...commonProps}
              type={field.type}
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
          );

        case 'number':
          return (
            <input
              {...commonProps}
              type="number"
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
            />
          );

        case 'date':
          return (
            <input
              {...commonProps}
              type="date"
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`${commonProps.className} dark:[color-scheme:dark]`}
            />
          );

        case 'textarea':
          return (
            <textarea
              {...commonProps}
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={`${commonProps.className} resize-vertical`}
            />
          );

        case 'select':
          const selectOptions = getOptionsForField(field);
          return (
            <select
              {...commonProps}
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              <option value="">-- اختر {field.label} --</option>
              {selectOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          );

        case 'multiselect':
          const multiselectOptions = getOptionsForField(field);
          return (
            <div className="p-3 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              {multiselectOptions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {multiselectOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleMultiSelectChange(field.name, option)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        (value || []).includes(option)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  لا توجد خيارات متاحة. يمكنك إضافة خيارات من صفحة الإعدادات.
                </p>
              )}
            </div>
          );

        case 'checkbox':
          return (
            <div className="flex items-center">
              <input
                type="checkbox"
                id={field.name}
                name={field.name}
                checked={value || false}
                onChange={(e) => handleChange(field.name, e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor={field.name} className="mr-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                {field.label}
              </label>
            </div>
          );

        case 'radio':
          return (
            <div className="space-y-2">
              {(field.options || []).map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={field.name}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="mr-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          );

        case 'image':
          return (
            <div className="space-y-3">
              <input
                type="file"
                accept={field.validation?.allowedTypes?.join(',') || 'image/*'}
                onChange={(e) => handleImageChange(field.name, e.target.files?.[0] || null, field)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
              />
              
              {imagePreview[field.name] && (
                <div className="relative">
                  <img
                    src={imagePreview[field.name]}
                    alt={field.label}
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageChange(field.name, null, field)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="حذف الصورة"
                  >
                    <Icon name="close" className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                <p>الحد الأقصى: {field.validation?.maxFileSize || 5} ميجابايت</p>
                <p>الأنواع المدعومة: {field.validation?.allowedTypes?.join(', ') || 'جميع أنواع الصور'}</p>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div key={field.id} className={widthClass}>
        {field.type !== 'checkbox' && (
          <label className="block text-sm font-medium mb-2">
            {field.label}
            {field.required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        {renderFieldInput()}
      </div>
    );
  };

  const getOptionsForField = (field: FormField) => {
    if (field.options && field.options.length > 0) {
      return field.options;
    }

    // Get options from settings based on field name
    switch (field.name) {
      case 'profession':
        return settings.professions || [];
      case 'services':
        return settings.services || [];
      case 'personalTags':
        return settings.personalTags || [];
      case 'socialStatus':
        return ['أعزب', 'متزوج', 'أرمل', 'مطلق'];
      case 'gender':
        return ['ذكر', 'أنثى'];
      default:
        return [];
    }
  };

  const renderGroup = (group: FormGroup) => {
    const groupFields = formSettings.fields
      .filter(field => field.group === group.name && field.visible)
      .sort((a, b) => a.order - b.order);

    if (groupFields.length === 0) return null;

    const isExpanded = expandedGroups[group.name];

    return (
      <div key={group.id} className="border border-gray-300 dark:border-gray-600 rounded-lg">
        <div 
          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-t-lg cursor-pointer flex justify-between items-center"
          onClick={() => group.collapsible && setExpandedGroups(prev => ({ ...prev, [group.name]: !isExpanded }))}
        >
          <h3 className="font-semibold text-blue-600 dark:text-blue-400">{group.label}</h3>
          {group.collapsible && (
            <Icon 
              name="arrowLeft" 
              className={`w-5 h-5 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`} 
            />
          )}
        </div>
        
        {(!group.collapsible || isExpanded) && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupFields.map(renderField)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Special handling for family relationships
  const spouseSearchResults = useMemo(() => {
    if (!spouseSearch) return [];
    return allConfessors.filter(c => {
      const fullName = `${c.firstName} ${c.fatherName} ${c.familyName}`.toLowerCase();
      return c.id !== confessor?.id && fullName.includes(spouseSearch.toLowerCase());
    });
  }, [spouseSearch, allConfessors, confessor]);

  const childSearchResults = useMemo(() => {
    if (!childSearch) return [];
    return allConfessors.filter(c => {
      const fullName = `${c.firstName} ${c.fatherName} ${c.familyName}`.toLowerCase();
      const isNotSelf = c.id !== confessor?.id;
      const isNotSpouse = c.id !== formData.spouseId;
      const isNotAlreadyChild = !formData.childrenIds?.includes(c.id!);
      return isNotSelf && isNotSpouse && isNotAlreadyChild && fullName.includes(childSearch.toLowerCase());
    });
  }, [childSearch, allConfessors, confessor, formData.spouseId, formData.childrenIds]);

  if (formLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4">جاري تحميل إعدادات الاستمارة...</p>
        </div>
      </div>
    );
  }

  const sortedGroups = [...formSettings.groups].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Icon name="users" className="w-6 h-6 text-blue-500" />
            {confessor ? 'تعديل بيانات معترف' : 'إضافة معترف جديد'}
          </h3>
          <button onClick={onClose}>
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {sortedGroups.map(renderGroup)}

          {/* Special Family Relationships Section */}
          {formData.socialStatus === 'متزوج' && (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                <h3 className="font-semibold text-blue-600 dark:text-blue-400">العلاقات الأسرية</h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Spouse Selection */}
                <div>
                  <label className="block font-semibold mb-2">الزوج / الزوجة</label>
                  {formData.spouseId ? (
                    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                      <span className="font-bold text-green-600">
                        {getConfessorNameById(formData.spouseId)}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleChange('spouseId', '')} 
                        className="text-red-500 hover:text-red-700"
                      >
                        <Icon name="close" className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="text" 
                        placeholder="ابحث عن الزوج/الزوجة..." 
                        value={spouseSearch} 
                        onChange={e => setSpouseSearch(e.target.value)} 
                        className="p-2 border rounded dark:bg-gray-700 w-full mb-2" 
                      />
                      {spouseSearchResults.length > 0 && (
                        <div className="max-h-32 overflow-y-auto border rounded dark:border-gray-600">
                          {spouseSearchResults.map(c => (
                            <button 
                              type="button" 
                              key={c.id} 
                              onClick={() => {
                                handleChange('spouseId', c.id);
                                setSpouseSearch('');
                              }} 
                              className="block w-full text-right p-2 hover:bg-blue-100 dark:hover:bg-blue-800"
                            >
                              {getConfessorNameById(c.id!)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Children Selection */}
                <div>
                  <label className="block font-semibold mb-2">الأبناء</label>
                  <div className="space-y-2 mb-2">
                    {(formData.childrenIds || []).map((childId: string) => (
                      <div key={childId} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                        <span className="font-bold">{getConfessorNameById(childId)}</span>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newChildren = formData.childrenIds.filter((id: string) => id !== childId);
                            handleChange('childrenIds', newChildren);
                          }} 
                          className="text-red-500 hover:text-red-700"
                        >
                          <Icon name="close" className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <input 
                      type="text" 
                      placeholder="ابحث عن ابن/ابنة للإضافة..." 
                      value={childSearch} 
                      onChange={e => setChildSearch(e.target.value)} 
                      className="p-2 border rounded dark:bg-gray-700 w-full mb-2" 
                    />
                    {childSearchResults.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border rounded dark:border-gray-600">
                        {childSearchResults.map(c => (
                          <button 
                            type="button" 
                            key={c.id} 
                            onClick={() => {
                              const newChildren = [...(formData.childrenIds || []), c.id];
                              handleChange('childrenIds', newChildren);
                              setChildSearch('');
                            }} 
                            className="block w-full text-right p-2 hover:bg-blue-100 dark:hover:bg-blue-800"
                          >
                            {getConfessorNameById(c.id!)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};