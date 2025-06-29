export interface Confessor {
  id?: string;
  firstName: string;
  fatherName: string;
  grandFatherName?: string;
  familyName: string;
  phone1: string;
  phone1Whatsapp: boolean;
  phone2?: string;
  phone2Whatsapp: boolean;
  gender: 'ذكر' | 'أنثى';
  birthDate: string;
  socialStatus: 'أعزب' | 'متزوج' | 'أرمل' | 'مطلق';
  marriageDate?: string;
  church: string;
  confessionStartDate?: string;
  profession?: string;
  services: string[];
  personalTags: string[];
  isDeacon: boolean;
  isDeceased: boolean;
  notes: string;
  // تغيير حقول الأسرة لتكون نصوص بسيطة
  spouseName?: string;
  spousePhone?: string;
  children?: Array<{
    name: string;
    birthDate?: string;
    phone?: string;
  }>;
  isArchived: boolean;
  // حقول ديناميكية إضافية
  customFields?: Record<string, any>;
}

export interface ConfessionLog {
  id?: string;
  confessorId: string;
  date: string;
  notes: string;
  tags: string[];
}

export interface MessageTemplate {
  id?: string;
  title: string;
  body: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'radio' | 'image';
  required: boolean;
  placeholder?: string;
  options?: string[]; // للـ select و radio
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    maxFileSize?: number; // بالميجابايت للصور
    allowedTypes?: string[]; // أنواع الملفات المسموحة
  };
  group: string; // مجموعة الحقل
  order: number; // ترتيب الحقل
  visible: boolean; // إظهار/إخفاء الحقل
  width: 'full' | 'half' | 'third'; // عرض الحقل
}

export interface FormSettings {
  fields: FormField[];
  groups: FormGroup[];
}

export interface FormGroup {
  id: string;
  name: string;
  label: string;
  order: number;
  collapsible: boolean;
  defaultExpanded: boolean;
}

export interface Settings {
  professions: string[];
  services: string[];
  personalTags: string[];
  confessionTags: string[];
  formSettings?: FormSettings;
}

export interface Notification {
  id: string;
  type: 'birthday' | 'anniversary' | 'overdue';
  message: string;
  timestamp: Date;
}

export interface AppContextType {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: any;
  notifications: Notification[];
  isAuthReady: boolean;
}