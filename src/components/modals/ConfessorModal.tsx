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
      setFormData({ 
        ...confessor, 
        customFields: confessor.customFields || {},
        spouseId: confessor.spouseId || '',
        childrenIds: confessor.childrenIds || []
      });
      
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
      const initialData: any = { 
        customFields: {},
        spouseId: '',
        childrenIds: [],
        socialStatus: 'أعزب' // Default value
      };
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

    // Special handling for social status change
    if (fieldName === 'socialStatus') {
      if (value !== 'متزوج') {
        // Clear spouse and children when not married
        setFormData((prev: any) => ({
          ...prev,
          spouseId: '',
          childrenIds: [],
          marriageDate: ''
        }));
        setSpouseSearch('');
        setChildSearch('');
      }
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

  const handleSetSpouse = (spouseId: string) => {
    handleChange('spouseId', spouseId);
    setSpouseSearch('');
  };

  const handleAddChild = (childId: string) => {
    if (!formData.childrenIds?.includes(childId)) {
      const newChildren = [...(formData.childrenIds || []), childId];
      handleChange('childrenIds', newChildren);
    }
    setChildSearch('');
  };
  
  const handleRemoveChild = (childId: string) => {
    const newChildren = (formData.childrenIds || []).filter((id: string) => id !== childId);
    handleChange('childrenIds', newChildren);
  };

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

          {/* Dynamic Family Relationships Section - Shows when married */}
          {formData.socialStatus === 'متزوج' && (
            <div className="border border-purple-300 dark:border-purple-600 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="p-4 bg-purple-100 dark:bg-purple-800 rounded-t-lg">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Icon name="users" className="w-5 h-5" />
                  العلاقات الأسرية
                  <span className="text-xs bg-purple-200 dark:bg-purple-700 px-2 py-1 rounded-full">
                    يظهر تلقائياً عند اختيار "متزوج"
                  </span>
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Spouse Selection */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                  <label className="block font-semibold mb-3 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <Icon name="users" className="w-5 h-5" />
                    الزوج / الزوجة
                  </label>
                  {formData.spouseId ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900 p-3 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2">
                        <Icon name="users" className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-700 dark:text-green-300">
                          {getConfessorNameById(formData.spouseId)}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleChange('spouseId', '')} 
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                        title="إزالة الزوج/الزوجة"
                      >
                        <Icon name="close" className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="ابحث عن الزوج/الزوجة بالاسم..." 
                          value={spouseSearch} 
                          onChange={e => setSpouseSearch(e.target.value)} 
                          className="w-full p-3 pr-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500" 
                        />
                        <Icon name="search" className="w-5 h-5 absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
                      </div>
                      {spouseSearchResults.length > 0 && (
                        <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg dark:border-gray-600 bg-white dark:bg-gray-700">
                          {spouseSearchResults.map(c => (
                            <button 
                              type="button" 
                              key={c.id} 
                              onClick={() => handleSetSpouse(c.id!)} 
                              className="block w-full text-right p-3 hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors border-b last:border-b-0 dark:border-gray-600"
                            >
                              <div className="flex items-center gap-2">
                                <Icon name="users" className="w-4 h-4 text-purple-500" />
                                <span className="font-medium">{getConfessorNameById(c.id!)}</span>
                                <span className="text-sm text-gray-500">({c.gender})</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {spouseSearch && spouseSearchResults.length === 0 && (
                        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                            لم يتم العثور على نتائج. تأكد من إضافة الزوج/الزوجة كمعترف منفصل أولاً.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Children Selection */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                  <label className="block font-semibold mb-3 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <Icon name="users" className="w-5 h-5" />
                    الأبناء
                    <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                      {formData.childrenIds?.length || 0} أطفال
                    </span>
                  </label>
                  
                  {/* Current Children */}
                  <div className="space-y-2 mb-4">
                    {(formData.childrenIds || []).map((childId: string) => (
                      <div key={childId} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2">
                          <Icon name="users" className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-700 dark:text-blue-300">
                            {getConfessorNameById(childId)}
                          </span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveChild(childId)} 
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                          title="إزالة من قائمة الأطفال"
                        >
                          <Icon name="close" className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(!formData.childrenIds || formData.childrenIds.length === 0) && (
                      <div className="text-center py-4 text-gray-500 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <Icon name="users" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">لم يتم إضافة أطفال بعد</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Add Children */}
                  <div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="ابحث عن ابن/ابنة للإضافة..." 
                        value={childSearch} 
                        onChange={e => setChildSearch(e.target.value)} 
                        className="w-full p-3 pr-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500" 
                      />
                      <Icon name="search" className="w-5 h-5 absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    {childSearchResults.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg dark:border-gray-600 bg-white dark:bg-gray-700">
                        {childSearchResults.map(c => (
                          <button 
                            type="button" 
                            key={c.id} 
                            onClick={() => handleAddChild(c.id!)} 
                            className="block w-full text-right p-3 hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors border-b last:border-b-0 dark:border-gray-600"
                          >
                            <div className="flex items-center gap-2">
                              <Icon name="add" className="w-4 h-4 text-green-500" />
                              <span className="font-medium">{getConfessorNameById(c.id!)}</span>
                              <span className="text-sm text-gray-500">({c.gender})</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {childSearch && childSearchResults.length === 0 && (
                      <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                          لم يتم العثور على نتائج. تأكد من إضافة الأطفال كمعترفين منفصلين أولاً.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Family Tips */}
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <Icon name="birthday" className="w-5 h-5" />
                    نصائح إدارة الأسرة
                  </h4>
                  <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                    <li>• يجب إضافة الزوج/الزوجة والأطفال كمعترفين منفصلين أولاً</li>
                    <li>• سيتم ربط العلاقات الأسرية تلقائياً في كلا الاتجاهين</li>
                    <li>• يمكن تعديل العلاقات الأسرية في أي وقت</li>
                    <li>• ستظهر أعياد الميلاد والزواج للأسرة في التقويم</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Icon name="users" className="w-5 h-5" />
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};