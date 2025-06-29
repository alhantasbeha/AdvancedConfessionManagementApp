import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';
import { useSettings } from '../../hooks/useSettings';
import { Icon } from '../ui/Icon';
import { Toggle } from '../ui/Toggle';
import { Confessor } from '../../types';

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
  const { settings } = useSettings(userId);
  
  const initialFormState: Omit<Confessor, 'id'> = {
    firstName: '', 
    fatherName: '', 
    grandFatherName: '', 
    familyName: '',
    phone1: '', 
    phone1Whatsapp: true, 
    phone2: '', 
    phone2Whatsapp: false,
    gender: 'ذكر', 
    birthDate: '', 
    socialStatus: 'أعزب', 
    marriageDate: '',
    church: '', 
    confessionStartDate: '',
    profession: '', 
    services: [], 
    personalTags: [],
    isDeacon: false, 
    isDeceased: false,
    notes: '',
    spouseName: '',
    spousePhone: '',
    children: [],
    isArchived: false,
    profileImage: ''
  };
  
  const [formData, setFormData] = useState<Omit<Confessor, 'id'>>(initialFormState);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (confessor) {
      setFormData({ 
        ...initialFormState, 
        ...confessor,
        spouseName: confessor.spouseName || '',
        spousePhone: confessor.spousePhone || '',
        children: confessor.children || [],
        profileImage: confessor.profileImage || ''
      });
      
      // Load existing image preview
      if (confessor.profileImage) {
        setImagePreview(confessor.profileImage);
      }
    } else {
      setFormData(initialFormState);
      setImagePreview('');
    }
  }, [confessor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Special handling for social status change
    if (name === 'socialStatus' && value !== 'متزوج') {
      // Clear spouse and children when not married
      setFormData(prev => ({
        ...prev,
        spouseName: '',
        spousePhone: '',
        children: [],
        marriageDate: ''
      }));
    }
  };

  const handleImageChange = async (file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, profileImage: '' }));
      setImagePreview('');
      return;
    }

    // Validate file size (5MB max)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('نوع الملف غير مدعوم. الأنواع المدعومة: JPEG, PNG, WebP');
      return;
    }

    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setFormData(prev => ({ ...prev, profileImage: base64String }));
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleMultiSelectChange = (listName: keyof Pick<Confessor, 'services' | 'personalTags'>, value: string) => {
    const currentList = formData[listName] || [];
    const newList = currentList.includes(value)
      ? currentList.filter(item => item !== value)
      : [...currentList, value];
    setFormData(prev => ({ ...prev, [listName]: newList }));
  };

  // Family management functions
  const handleAddChild = () => {
    const newChild = { name: '', birthDate: '', phone: '' };
    const updatedChildren = [...(formData.children || []), newChild];
    setFormData(prev => ({ ...prev, children: updatedChildren }));
  };

  const handleUpdateChild = (index: number, field: string, value: string) => {
    const updatedChildren = [...(formData.children || [])];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    setFormData(prev => ({ ...prev, children: updatedChildren }));
  };

  const handleRemoveChild = (index: number) => {
    const updatedChildren = (formData.children || []).filter((_: any, i: number) => i !== index);
    setFormData(prev => ({ ...prev, children: updatedChildren }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      console.error("User not logged in.");
      return;
    }

    // Validate required fields
    if (!formData.firstName?.trim()) {
      alert('الاسم الأول مطلوب');
      return;
    }
    if (!formData.fatherName?.trim()) {
      alert('اسم الأب مطلوب');
      return;
    }
    if (!formData.familyName?.trim()) {
      alert('اسم العائلة مطلوب');
      return;
    }
    if (!formData.phone1?.trim()) {
      alert('رقم الهاتف الأول مطلوب');
      return;
    }
    if (!formData.birthDate) {
      alert('تاريخ الميلاد مطلوب');
      return;
    }
    if (!formData.church?.trim()) {
      alert('الكنيسة التابع لها مطلوبة');
      return;
    }

    // Validate children names if any children are added
    if (formData.children && formData.children.length > 0) {
      for (let i = 0; i < formData.children.length; i++) {
        if (!formData.children[i].name?.trim()) {
          alert(`اسم الطفل #${i + 1} مطلوب`);
          return;
        }
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
      alert('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
    }
  };

  const renderFieldset = (legend: string, children: React.ReactNode) => (
    <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
      <legend className="px-2 font-semibold text-blue-600 dark:text-blue-400">{legend}</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </fieldset>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
          {renderFieldset('المعلومات الشخصية والاتصال', 
            <>
              {/* Profile Image */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-2">
                  الصورة الشخصية
                  <span className="text-xs text-gray-500 mr-2">(اختياري)</span>
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-200"
                  />
                  
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="الصورة الشخصية"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-purple-300 dark:border-purple-600 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageChange(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        title="حذف الصورة"
                      >
                        <Icon name="close" className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 bg-purple-50 dark:bg-purple-900 p-2 rounded">
                    <p className="flex items-center gap-1">
                      <Icon name="birthday" className="w-3 h-3" />
                      الحد الأقصى: 5 ميجابايت
                    </p>
                    <p>الأنواع المدعومة: JPEG, PNG, WebP</p>
                  </div>
                </div>
              </div>

              <input 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                placeholder="الاسم الأول*" 
                required 
                className="p-2 border rounded dark:bg-gray-700"
              />
              <input 
                name="fatherName" 
                value={formData.fatherName} 
                onChange={handleChange} 
                placeholder="اسم الأب*" 
                required 
                className="p-2 border rounded dark:bg-gray-700"
              />
              <input 
                name="grandFatherName" 
                value={formData.grandFatherName || ''} 
                onChange={handleChange} 
                placeholder="اسم الجد" 
                className="p-2 border rounded dark:bg-gray-700"
              />
              <input 
                name="familyName" 
                value={formData.familyName} 
                onChange={handleChange} 
                placeholder="اسم العائلة*" 
                required 
                className="p-2 border rounded dark:bg-gray-700"
              />
              <div className="flex items-center gap-2">
                <input 
                  name="phone1" 
                  value={formData.phone1} 
                  onChange={handleChange} 
                  placeholder="رقم الهاتف الأول*" 
                  required 
                  className="p-2 border rounded w-full dark:bg-gray-700"
                />
                <Toggle 
                  label="واتساب" 
                  checked={formData.phone1Whatsapp} 
                  onChange={(e) => setFormData(p => ({...p, phone1Whatsapp: e.target.checked}))} 
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  name="phone2" 
                  value={formData.phone2 || ''} 
                  onChange={handleChange} 
                  placeholder="رقم الهاتف الثاني" 
                  className="p-2 border rounded w-full dark:bg-gray-700"
                />
                <Toggle 
                  label="واتساب" 
                  checked={formData.phone2Whatsapp} 
                  onChange={(e) => setFormData(p => ({...p, phone2Whatsapp: e.target.checked}))} 
                />
              </div>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange} 
                className="p-2 border rounded dark:bg-gray-700"
              >
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
              <div>
                <label className="block text-sm mb-1">تاريخ الميلاد*</label>
                <input 
                  type="date" 
                  name="birthDate" 
                  value={formData.birthDate} 
                  onChange={handleChange} 
                  required 
                  className="p-2 border rounded w-full dark:bg-gray-700 dark:[color-scheme:dark]"
                />
              </div>
              <select 
                name="socialStatus" 
                value={formData.socialStatus} 
                onChange={handleChange} 
                className="p-2 border rounded dark:bg-gray-700"
              >
                <option value="أعزب">أعزب</option>
                <option value="متزوج">متزوج</option>
                <option value="أرمل">أرمل</option>
                <option value="مطلق">مطلق</option>
              </select>
              {formData.socialStatus === 'متزوج' && (
                <div>
                  <label className="block text-sm mb-1">تاريخ الزواج</label>
                  <input 
                    type="date" 
                    name="marriageDate" 
                    value={formData.marriageDate || ''} 
                    onChange={handleChange} 
                    className="p-2 border rounded w-full dark:bg-gray-700 dark:[color-scheme:dark]"
                  />
                </div>
              )}
              <input 
                name="church" 
                value={formData.church} 
                onChange={handleChange} 
                placeholder="الكنيسة التابع لها*" 
                required 
                className="p-2 border rounded dark:bg-gray-700"
              />
              <div>
                <label className="block text-sm mb-1">تاريخ بدء الاعتراف</label>
                <input 
                  type="date" 
                  name="confessionStartDate" 
                  value={formData.confessionStartDate || ''} 
                  onChange={handleChange} 
                  className="p-2 border rounded w-full dark:bg-gray-700 dark:[color-scheme:dark]"
                />
              </div>
            </>
          )}

          {/* Family Information Section - Shows when married */}
          {formData.socialStatus === 'متزوج' && (
            <div className="border border-purple-300 dark:border-purple-600 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="p-4 bg-purple-100 dark:bg-purple-800 rounded-t-lg">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Icon name="users" className="w-5 h-5" />
                  معلومات الأسرة
                  <span className="text-xs bg-purple-200 dark:bg-purple-700 px-2 py-1 rounded-full">
                    يظهر تلقائياً عند اختيار "متزوج"
                  </span>
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Spouse Information */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                  <h4 className="font-semibold mb-3 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <Icon name="users" className="w-5 h-5" />
                    معلومات الزوج / الزوجة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">اسم الزوج / الزوجة</label>
                      <input
                        type="text"
                        name="spouseName"
                        value={formData.spouseName || ''}
                        onChange={handleChange}
                        placeholder="أدخل اسم الزوج أو الزوجة"
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">رقم هاتف الزوج / الزوجة</label>
                      <input
                        type="tel"
                        name="spousePhone"
                        value={formData.spousePhone || ''}
                        onChange={handleChange}
                        placeholder="رقم الهاتف (اختياري)"
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Children Information */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      <Icon name="users" className="w-5 h-5" />
                      الأبناء
                      <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                        {(formData.children || []).length} أطفال
                      </span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddChild}
                      className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      <Icon name="add" className="w-4 h-4" />
                      إضافة طفل
                    </button>
                  </div>
                  
                  {/* Children List */}
                  <div className="space-y-3">
                    {(formData.children || []).map((child: any, index: number) => (
                      <div key={index} className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-blue-700 dark:text-blue-300">
                            الطفل #{index + 1}
                          </h5>
                          <button
                            type="button"
                            onClick={() => handleRemoveChild(index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                            title="حذف الطفل"
                          >
                            <Icon name="close" className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">الاسم *</label>
                            <input
                              type="text"
                              value={child.name || ''}
                              onChange={(e) => handleUpdateChild(index, 'name', e.target.value)}
                              placeholder="اسم الطفل"
                              required
                              className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">تاريخ الميلاد</label>
                            <input
                              type="date"
                              value={child.birthDate || ''}
                              onChange={(e) => handleUpdateChild(index, 'birthDate', e.target.value)}
                              className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:[color-scheme:dark] focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">رقم الهاتف</label>
                            <input
                              type="tel"
                              value={child.phone || ''}
                              onChange={(e) => handleUpdateChild(index, 'phone', e.target.value)}
                              placeholder="رقم الهاتف (اختياري)"
                              className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!formData.children || formData.children.length === 0) && (
                      <div className="text-center py-6 text-gray-500 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <Icon name="users" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">لم يتم إضافة أطفال بعد</p>
                        <p className="text-xs text-gray-400">اضغط "إضافة طفل" لبدء إضافة الأطفال</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {renderFieldset('الحقول القابلة للتخصيص', 
            <>
              <select 
                name="profession" 
                value={formData.profession || ''} 
                onChange={handleChange} 
                className="p-2 border rounded dark:bg-gray-700"
              >
                <option value="">اختر المهنة...</option>
                {settings.professions?.map(profession => (
                  <option key={profession} value={profession}>{profession}</option>
                ))}
              </select>
              
              <div className="md:col-span-2 lg:col-span-3">
                <p className="font-semibold mb-2">الخدمات</p>
                <div className="flex flex-wrap gap-4">
                  {settings.services?.map(service => (
                    <label key={service} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.services?.includes(service)} 
                        onChange={() => handleMultiSelectChange('services', service)} 
                        className="w-4 h-4" 
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-2 lg:col-span-3">
                <p className="font-semibold mb-2">علامات شخصية</p>
                <div className="flex flex-wrap gap-2">
                  {settings.personalTags?.map(tag => (
                    <button 
                      type="button" 
                      key={tag} 
                      onClick={() => handleMultiSelectChange('personalTags', tag)} 
                      className={`px-3 py-1 text-sm rounded-full ${
                        formData.personalTags?.includes(tag) 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {renderFieldset('معلومات إضافية', 
            <>
              <div className="flex items-center">
                <Toggle 
                  label="شماس" 
                  checked={formData.isDeacon} 
                  onChange={(e) => setFormData(p => ({...p, isDeacon: e.target.checked}))} 
                />
              </div>
              <div className="flex items-center">
                <Toggle 
                  label="متوفى" 
                  checked={formData.isDeceased} 
                  onChange={(e) => setFormData(p => ({...p, isDeceased: e.target.checked}))} 
                />
              </div>
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                placeholder="ملاحظات عامة..." 
                rows={4} 
                className="p-2 border rounded dark:bg-gray-700 md:col-span-2 lg:col-span-3"
              />
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
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