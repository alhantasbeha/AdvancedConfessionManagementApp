import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { FormSettings, FormField, FormGroup } from '../types';

export const useFormSettings = (userId: string | undefined) => {
  const [formSettings, setFormSettings] = useState<FormSettings>({
    fields: [],
    groups: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const formSettingsDocRef = doc(db, `artifacts/${appId}/users/${userId}/settings`, 'formSettings');
    
    const unsubscribe = onSnapshot(formSettingsDocRef, (doc) => {
      if (doc.exists()) {
        setFormSettings(doc.data() as FormSettings);
      } else {
        // Initialize with default form settings
        const defaultFormSettings: FormSettings = {
          groups: [
            {
              id: 'personal',
              name: 'personal',
              label: 'المعلومات الشخصية',
              order: 1,
              collapsible: true,
              defaultExpanded: true
            },
            {
              id: 'contact',
              name: 'contact',
              label: 'معلومات الاتصال',
              order: 2,
              collapsible: true,
              defaultExpanded: true
            },
            {
              id: 'church',
              name: 'church',
              label: 'المعلومات الكنسية',
              order: 3,
              collapsible: true,
              defaultExpanded: true
            },
            {
              id: 'additional',
              name: 'additional',
              label: 'معلومات إضافية',
              order: 4,
              collapsible: true,
              defaultExpanded: false
            }
          ],
          fields: [
            // المعلومات الشخصية
            {
              id: 'firstName',
              name: 'firstName',
              label: 'الاسم الأول',
              type: 'text',
              required: true,
              placeholder: 'أدخل الاسم الأول',
              group: 'personal',
              order: 1,
              visible: true,
              width: 'half'
            },
            {
              id: 'fatherName',
              name: 'fatherName',
              label: 'اسم الأب',
              type: 'text',
              required: true,
              placeholder: 'أدخل اسم الأب',
              group: 'personal',
              order: 2,
              visible: true,
              width: 'half'
            },
            {
              id: 'grandFatherName',
              name: 'grandFatherName',
              label: 'اسم الجد',
              type: 'text',
              required: false,
              placeholder: 'أدخل اسم الجد (اختياري)',
              group: 'personal',
              order: 3,
              visible: true,
              width: 'half'
            },
            {
              id: 'familyName',
              name: 'familyName',
              label: 'اسم العائلة',
              type: 'text',
              required: true,
              placeholder: 'أدخل اسم العائلة',
              group: 'personal',
              order: 4,
              visible: true,
              width: 'half'
            },
            {
              id: 'gender',
              name: 'gender',
              label: 'الجنس',
              type: 'radio',
              required: true,
              options: ['ذكر', 'أنثى'],
              defaultValue: 'ذكر',
              group: 'personal',
              order: 5,
              visible: true,
              width: 'half'
            },
            {
              id: 'birthDate',
              name: 'birthDate',
              label: 'تاريخ الميلاد',
              type: 'date',
              required: true,
              group: 'personal',
              order: 6,
              visible: true,
              width: 'half'
            },
            {
              id: 'socialStatus',
              name: 'socialStatus',
              label: 'الحالة الاجتماعية',
              type: 'select',
              required: true,
              options: ['أعزب', 'متزوج', 'أرمل', 'مطلق'],
              defaultValue: 'أعزب',
              group: 'personal',
              order: 7,
              visible: true,
              width: 'half'
            },
            {
              id: 'marriageDate',
              name: 'marriageDate',
              label: 'تاريخ الزواج',
              type: 'date',
              required: false,
              group: 'personal',
              order: 8,
              visible: true,
              width: 'half'
            },
            // معلومات الاتصال
            {
              id: 'phone1',
              name: 'phone1',
              label: 'رقم الهاتف الأول',
              type: 'tel',
              required: true,
              placeholder: 'أدخل رقم الهاتف',
              group: 'contact',
              order: 1,
              visible: true,
              width: 'half'
            },
            {
              id: 'phone1Whatsapp',
              name: 'phone1Whatsapp',
              label: 'واتساب متاح',
              type: 'checkbox',
              required: false,
              defaultValue: true,
              group: 'contact',
              order: 2,
              visible: true,
              width: 'half'
            },
            {
              id: 'phone2',
              name: 'phone2',
              label: 'رقم الهاتف الثاني',
              type: 'tel',
              required: false,
              placeholder: 'أدخل رقم الهاتف الثاني (اختياري)',
              group: 'contact',
              order: 3,
              visible: true,
              width: 'half'
            },
            {
              id: 'phone2Whatsapp',
              name: 'phone2Whatsapp',
              label: 'واتساب متاح للرقم الثاني',
              type: 'checkbox',
              required: false,
              defaultValue: false,
              group: 'contact',
              order: 4,
              visible: true,
              width: 'half'
            },
            // المعلومات الكنسية
            {
              id: 'church',
              name: 'church',
              label: 'الكنيسة التابع لها',
              type: 'text',
              required: true,
              placeholder: 'أدخل اسم الكنيسة',
              group: 'church',
              order: 1,
              visible: true,
              width: 'half'
            },
            {
              id: 'confessionStartDate',
              name: 'confessionStartDate',
              label: 'تاريخ بدء الاعتراف',
              type: 'date',
              required: false,
              group: 'church',
              order: 2,
              visible: true,
              width: 'half'
            },
            {
              id: 'isDeacon',
              name: 'isDeacon',
              label: 'شماس',
              type: 'checkbox',
              required: false,
              defaultValue: false,
              group: 'church',
              order: 3,
              visible: true,
              width: 'half'
            },
            {
              id: 'profession',
              name: 'profession',
              label: 'المهنة',
              type: 'select',
              required: false,
              group: 'church',
              order: 4,
              visible: true,
              width: 'half'
            },
            {
              id: 'services',
              name: 'services',
              label: 'الخدمات',
              type: 'multiselect',
              required: false,
              group: 'church',
              order: 5,
              visible: true,
              width: 'full'
            },
            {
              id: 'personalTags',
              name: 'personalTags',
              label: 'العلامات الشخصية',
              type: 'multiselect',
              required: false,
              group: 'church',
              order: 6,
              visible: true,
              width: 'full'
            },
            // معلومات إضافية
            {
              id: 'notes',
              name: 'notes',
              label: 'ملاحظات عامة',
              type: 'textarea',
              required: false,
              placeholder: 'أدخل أي ملاحظات إضافية...',
              group: 'additional',
              order: 1,
              visible: true,
              width: 'full'
            },
            {
              id: 'isDeceased',
              name: 'isDeceased',
              label: 'متوفى',
              type: 'checkbox',
              required: false,
              defaultValue: false,
              group: 'additional',
              order: 2,
              visible: true,
              width: 'half'
            }
          ]
        };
        setDoc(formSettingsDocRef, defaultFormSettings);
        setFormSettings(defaultFormSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching form settings: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const updateFormSettings = async (newSettings: Partial<FormSettings>) => {
    if (!userId) return;
    const formSettingsDocRef = doc(db, `artifacts/${appId}/users/${userId}/settings`, 'formSettings');
    await updateDoc(formSettingsDocRef, newSettings);
  };

  const addField = async (field: FormField) => {
    const updatedFields = [...formSettings.fields, field];
    await updateFormSettings({ fields: updatedFields });
  };

  const updateField = async (fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = formSettings.fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    await updateFormSettings({ fields: updatedFields });
  };

  const deleteField = async (fieldId: string) => {
    const updatedFields = formSettings.fields.filter(field => field.id !== fieldId);
    await updateFormSettings({ fields: updatedFields });
  };

  const addGroup = async (group: FormGroup) => {
    const updatedGroups = [...formSettings.groups, group];
    await updateFormSettings({ groups: updatedGroups });
  };

  const updateGroup = async (groupId: string, updates: Partial<FormGroup>) => {
    const updatedGroups = formSettings.groups.map(group =>
      group.id === groupId ? { ...group, ...updates } : group
    );
    await updateFormSettings({ groups: updatedGroups });
  };

  const deleteGroup = async (groupId: string) => {
    const updatedGroups = formSettings.groups.filter(group => group.id !== groupId);
    // أيضاً حذف جميع الحقول التي تنتمي لهذه المجموعة
    const updatedFields = formSettings.fields.filter(field => field.group !== groupId);
    await updateFormSettings({ groups: updatedGroups, fields: updatedFields });
  };

  return {
    formSettings,
    loading,
    updateFormSettings,
    addField,
    updateField,
    deleteField,
    addGroup,
    updateGroup,
    deleteGroup,
  };
};