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
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    contact: true,
    family: true,
    church: true,
    additional: false
  });

  const steps = [
    { id: 1, title: 'المعلومات الأساسية', icon: 'users', color: 'blue' },
    { id: 2, title: 'الاتصال والعائلة', icon: 'messages', color: 'green' },
    { id: 3, title: 'المعلومات الكنسية', icon: 'settings', color: 'purple' },
    { id: 4, title: 'معلومات إضافية', icon: 'edit', color: 'orange' }
  ];

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

    if (name === 'socialStatus' && value !== 'متزوج') {
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

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('نوع الملف غير مدعوم. الأنواع المدعومة: JPEG, PNG, WebP');
      return;
    }

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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName?.trim() && formData.fatherName?.trim() && formData.familyName?.trim() && formData.birthDate);
      case 2:
        return !!(formData.phone1?.trim());
      case 3:
        return !!(formData.church?.trim());
      case 4:
        return true;
      default:
        return true;
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      onClose();
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      console.error("User not logged in.");
      return;
    }

    // Validate all required fields
    if (!formData.firstName?.trim()) {
      alert('الاسم الأول مطلوب');
      setCurrentStep(1);
      return;
    }
    if (!formData.fatherName?.trim()) {
      alert('اسم الأب مطلوب');
      setCurrentStep(1);
      return;
    }
    if (!formData.familyName?.trim()) {
      alert('اسم العائلة مطلوب');
      setCurrentStep(1);
      return;
    }
    if (!formData.phone1?.trim()) {
      alert('رقم الهاتف الأول مطلوب');
      setCurrentStep(2);
      return;
    }
    if (!formData.birthDate) {
      alert('تاريخ الميلاد مطلوب');
      setCurrentStep(1);
      return;
    }
    if (!formData.church?.trim()) {
      alert('الكنيسة التابع لها مطلوبة');
      setCurrentStep(3);
      return;
    }

    if (formData.children && formData.children.length > 0) {
      for (let i = 0; i < formData.children.length; i++) {
        if (!formData.children[i].name?.trim()) {
          alert(`اسم الطفل #${i + 1} مطلوب`);
          setCurrentStep(2);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const collectionRef = collection(db, `artifacts/${appId}/users/${userId}/confessors`);
      if (confessor?.id) {
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/confessors`, confessor.id);
        await updateDoc(docRef, formData);
        showSuccess('تم تعديل بيانات المعترف بنجاح! ✅');
      } else {
        await addDoc(collectionRef, formData);
        showSuccess('تم تسجيل المعترف بنجاح! ✅');
      }
    } catch (error) {
      console.error("Error saving confessor:", error);
      alert('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentStep === step.id
                    ? `bg-${step.color}-500 text-white shadow-lg scale-110`
                    : currentStep > step.id
                    ? `bg-${step.color}-100 dark:bg-${step.color}-900 text-${step.color}-600 dark:text-${step.color}-300`
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                } ${validateStep(step.id) ? 'ring-2 ring-green-300' : ''}`}
              >
                <Icon name={step.icon} className="w-6 h-6" />
              </button>
              <span className={`text-xs mt-2 font-medium transition-colors ${
                currentStep === step.id ? `text-${step.color}-600 dark:text-${step.color}-400` : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 rounded transition-colors ${
                currentStep > step.id ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderCollapsibleSection = (
    title: string,
    icon: string,
    color: string,
    sectionKey: keyof typeof expandedSections,
    children: React.ReactNode,
    badge?: string
  ) => (
    <div className={`border-2 border-${color}-200 dark:border-${color}-700 rounded-xl overflow-hidden transition-all duration-300 ${
      expandedSections[sectionKey] ? 'shadow-lg' : 'shadow-md'
    }`}>
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        className={`w-full p-4 bg-gradient-to-r from-${color}-50 to-${color}-100 dark:from-${color}-900 dark:to-${color}-800 flex items-center justify-between hover:from-${color}-100 hover:to-${color}-200 dark:hover:from-${color}-800 dark:hover:to-${color}-700 transition-all duration-200`}
      >
        <div className="flex items-center gap-3">
          <Icon name={icon} className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
          <h3 className={`text-lg font-bold text-${color}-800 dark:text-${color}-200`}>{title}</h3>
          {badge && (
            <span className={`bg-${color}-500 text-white px-2 py-1 rounded-full text-xs font-medium`}>
              {badge}
            </span>
          )}
        </div>
        <Icon 
          name="arrowLeft" 
          className={`w-5 h-5 text-${color}-600 dark:text-${color}-400 transition-transform duration-200 ${
            expandedSections[sectionKey] ? 'transform -rotate-90' : ''
          }`} 
        />
      </button>
      
      <div className={`transition-all duration-300 ease-in-out ${
        expandedSections[sectionKey] 
          ? 'max-h-[2000px] opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="p-6 bg-white dark:bg-gray-800">
          {children}
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      {renderCollapsibleSection(
        'المعلومات الشخصية',
        'users',
        'blue',
        'personal',
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Image */}
          <div className="lg:col-span-1 flex flex-col items-center">
            <label className="block text-sm font-medium mb-3 text-center">
              الصورة الشخصية
              <span className="text-xs text-gray-500 block mt-1">(اختياري)</span>
            </label>
            
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-blue-200 dark:border-blue-700 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="الصورة الشخصية"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon name="users" className="w-12 h-12 text-blue-400" />
                )}
              </div>
              
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => handleImageChange(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  title="حذف الصورة"
                >
                  <Icon name="close" className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
              className="mt-4 w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
            />
            
            <div className="text-xs text-gray-500 mt-2 text-center">
              <p>الحد الأقصى: 5 ميجابايت</p>
              <p>JPEG, PNG, WebP</p>
            </div>
          </div>

          {/* Name Fields */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                الاسم الأول <span className="text-red-500">*</span>
              </label>
              <input 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                placeholder="أدخل الاسم الأول" 
                required 
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                اسم الأب <span className="text-red-500">*</span>
              </label>
              <input 
                name="fatherName" 
                value={formData.fatherName} 
                onChange={handleChange} 
                placeholder="أدخل اسم الأب" 
                required 
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                اسم الجد
              </label>
              <input 
                name="grandFatherName" 
                value={formData.grandFatherName || ''} 
                onChange={handleChange} 
                placeholder="أدخل اسم الجد (اختياري)" 
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                اسم العائلة <span className="text-red-500">*</span>
              </label>
              <input 
                name="familyName" 
                value={formData.familyName} 
                onChange={handleChange} 
                placeholder="أدخل اسم العائلة" 
                required 
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                الجنس <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="ذكر"
                    checked={formData.gender === 'ذكر'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>ذكر</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="أنثى"
                    checked={formData.gender === 'أنثى'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>أنثى</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                تاريخ الميلاد <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                name="birthDate" 
                value={formData.birthDate} 
                onChange={handleChange} 
                required 
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:[color-scheme:dark] transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                الحالة الاجتماعية <span className="text-red-500">*</span>
              </label>
              <select 
                name="socialStatus" 
                value={formData.socialStatus} 
                onChange={handleChange} 
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 transition-all duration-200"
              >
                <option value="أعزب">أعزب</option>
                <option value="متزوج">متزوج</option>
                <option value="أرمل">أرمل</option>
                <option value="مطلق">مطلق</option>
              </select>
            </div>
            
            {formData.socialStatus === 'متزوج' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  تاريخ الزواج
                </label>
                <input 
                  type="date" 
                  name="marriageDate" 
                  value={formData.marriageDate || ''} 
                  onChange={handleChange} 
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:[color-scheme:dark] transition-all duration-200"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {renderCollapsibleSection(
        'معلومات الاتصال',
        'messages',
        'green',
        'contact',
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                رقم الهاتف الأول <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <input 
                  name="phone1" 
                  value={formData.phone1} 
                  onChange={handleChange} 
                  placeholder="أدخل رقم الهاتف" 
                  required 
                  className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:bg-gray-700 transition-all duration-200"
                />
                <div className="flex items-center">
                  <Toggle 
                    label="واتساب" 
                    checked={formData.phone1Whatsapp} 
                    onChange={(e) => setFormData(p => ({...p, phone1Whatsapp: e.target.checked}))} 
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                رقم الهاتف الثاني
              </label>
              <div className="flex gap-3">
                <input 
                  name="phone2" 
                  value={formData.phone2 || ''} 
                  onChange={handleChange} 
                  placeholder="رقم الهاتف الثاني (اختياري)" 
                  className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:bg-gray-700 transition-all duration-200"
                />
                <div className="flex items-center">
                  <Toggle 
                    label="واتساب" 
                    checked={formData.phone2Whatsapp} 
                    onChange={(e) => setFormData(p => ({...p, phone2Whatsapp: e.target.checked}))} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {formData.socialStatus === 'متزوج' && renderCollapsibleSection(
        'معلومات الأسرة',
        'users',
        'purple',
        'family',
        <div className="space-y-6">
          {/* Spouse Information */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <h4 className="font-semibold mb-4 text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Icon name="users" className="w-5 h-5" />
              معلومات الزوج / الزوجة
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  اسم الزوج / الزوجة
                </label>
                <input
                  type="text"
                  name="spouseName"
                  value={formData.spouseName || ''}
                  onChange={handleChange}
                  placeholder="أدخل اسم الزوج أو الزوجة"
                  className="w-full p-3 border-2 border-purple-200 dark:border-purple-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  رقم هاتف الزوج / الزوجة
                </label>
                <input
                  type="tel"
                  name="spousePhone"
                  value={formData.spousePhone || ''}
                  onChange={handleChange}
                  placeholder="رقم الهاتف (اختياري)"
                  className="w-full p-3 border-2 border-purple-200 dark:border-purple-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 transition-all duration-200"
                />
              </div>
            </div>
          </div>
          
          {/* Children Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Icon name="users" className="w-5 h-5" />
                الأبناء
                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                  {(formData.children || []).length}
                </span>
              </h4>
              <button
                type="button"
                onClick={handleAddChild}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
              >
                <Icon name="add" className="w-4 h-4" />
                إضافة طفل
              </button>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {(formData.children || []).map((child: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-600 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <Icon name="users" className="w-4 h-4" />
                      الطفل #{index + 1}
                    </h5>
                    <button
                      type="button"
                      onClick={() => handleRemoveChild(index)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                      title="حذف الطفل"
                    >
                      <Icon name="close" className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        الاسم <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={child.name || ''}
                        onChange={(e) => handleUpdateChild(index, 'name', e.target.value)}
                        placeholder="اسم الطفل"
                        required
                        className="w-full p-2 border-2 border-blue-200 dark:border-blue-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        تاريخ الميلاد
                      </label>
                      <input
                        type="date"
                        value={child.birthDate || ''}
                        onChange={(e) => handleUpdateChild(index, 'birthDate', e.target.value)}
                        className="w-full p-2 border-2 border-blue-200 dark:border-blue-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:[color-scheme:dark] transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        value={child.phone || ''}
                        onChange={(e) => handleUpdateChild(index, 'phone', e.target.value)}
                        placeholder="رقم الهاتف (اختياري)"
                        className="w-full p-2 border-2 border-blue-200 dark:border-blue-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {(!formData.children || formData.children.length === 0) && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <Icon name="users" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">لم يتم إضافة أطفال بعد</p>
                  <p className="text-xs text-gray-400 mt-1">اضغط "إضافة طفل" لبدء إضافة الأطفال</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        `${(formData.children || []).length} أطفال`
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {renderCollapsibleSection(
        'المعلومات الكنسية',
        'settings',
        'purple',
        'church',
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                الكنيسة التابع لها <span className="text-red-500">*</span>
              </label>
              <input 
                name="church" 
                value={formData.church} 
                onChange={handleChange} 
                placeholder="أدخل اسم الكنيسة" 
                required 
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                تاريخ بدء الاعتراف
              </label>
              <input 
                type="date" 
                name="confessionStartDate" 
                value={formData.confessionStartDate || ''} 
                onChange={handleChange} 
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 dark:[color-scheme:dark] transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                المهنة
              </label>
              <select 
                name="profession" 
                value={formData.profession || ''} 
                onChange={handleChange} 
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 transition-all duration-200"
              >
                <option value="">اختر المهنة...</option>
                {settings.professions?.map(profession => (
                  <option key={profession} value={profession}>{profession}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                الخدمات
              </label>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700 max-h-40 overflow-y-auto">
                {settings.services?.length > 0 ? (
                  <div className="space-y-2">
                    {settings.services.map(service => (
                      <label key={service} className="flex items-center gap-3 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-800 p-2 rounded transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formData.services?.includes(service)} 
                          onChange={() => handleMultiSelectChange('services', service)} 
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" 
                        />
                        <span className="text-sm">{service}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center">لا توجد خدمات متاحة</p>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                العلامات الشخصية
              </label>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                {settings.personalTags?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {settings.personalTags.map(tag => (
                      <button 
                        type="button" 
                        key={tag} 
                        onClick={() => handleMultiSelectChange('personalTags', tag)} 
                        className={`px-3 py-2 text-sm rounded-full transition-all duration-200 ${
                          formData.personalTags?.includes(tag) 
                            ? 'bg-purple-500 text-white shadow-md transform scale-105' 
                            : 'bg-gray-200 dark:bg-gray-600 hover:bg-purple-200 dark:hover:bg-purple-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center">لا توجد علامات متاحة</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <Toggle 
                label="شماس" 
                checked={formData.isDeacon} 
                onChange={(e) => setFormData(p => ({...p, isDeacon: e.target.checked}))} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {renderCollapsibleSection(
        'معلومات إضافية',
        'edit',
        'orange',
        'additional',
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-center">
              <Toggle 
                label="متوفى" 
                checked={formData.isDeceased} 
                onChange={(e) => setFormData(p => ({...p, isDeceased: e.target.checked}))} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ملاحظات عامة
            </label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              placeholder="أدخل أي ملاحظات إضافية..." 
              rows={6} 
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:bg-gray-700 transition-all duration-200 resize-vertical"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  // Success Message Modal
  if (showSuccessMessage) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fadeIn">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="users" className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            تم بنجاح!
          </h3>
          <p className="text-lg text-green-600 dark:text-green-400 font-medium">
            {successMessage}
          </p>
          <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">جاري إغلاق النافذة...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Icon name="users" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {confessor ? 'تعديل بيانات معترف' : 'إضافة معترف جديد'}
                </h3>
                <p className="text-blue-100 text-sm">
                  {confessor ? 'تحديث المعلومات الموجودة' : 'إدخال معلومات معترف جديد'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Icon name="close" className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Step Indicator */}
          <div className="p-6 bg-gray-50 dark:bg-gray-700">
            {renderStepIndicator()}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderCurrentStep()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    <Icon name="arrowRight" className="w-5 h-5" />
                    السابق
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  إلغاء
                </button>
                
                {currentStep < steps.length ? (
                  <button 
                    type="button" 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!validateStep(currentStep)}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    التالي
                    <Icon name="arrowLeft" className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Icon name="users" className="w-5 h-5" />
                        {confessor ? 'حفظ التعديلات' : 'إضافة المعترف'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};