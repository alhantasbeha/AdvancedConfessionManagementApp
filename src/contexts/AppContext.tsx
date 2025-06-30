import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSQLiteNotifications } from '../hooks/useSQLiteNotifications';
import { AppContextType } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // تحديد الوضع النهاري كافتراضي بشكل قاطع
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // التحقق من الإعدادات المحفوظة في localStorage
    const savedTheme = localStorage.getItem('theme');
    // إذا لم توجد إعدادات محفوظة أو كانت light، استخدم الوضع النهاري
    return savedTheme === 'dark';
  });
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user] = useState({ uid: 'sqlite-user' }); // مستخدم وهمي لـ SQLite
  const [isAuthReady] = useState(true); // دائماً جاهز مع SQLite

  const { notifications } = useSQLiteNotifications();

  // تطبيق الوضع النهاري/الليلي فوراً عند تحميل الصفحة
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // إزالة جميع الكلاسات المتعلقة بالثيم أولاً
    root.classList.remove('dark');
    body.classList.remove('dark');
    
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      // التأكد من إزالة الوضع الليلي تماماً
      root.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // إجبار إعادة رسم الصفحة
    root.style.colorScheme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  // تطبيق الوضع النهاري فور تحميل المكون
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // التأكد من أن الوضع النهاري مطبق بشكل افتراضي
    if (!isDarkMode) {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, []);

  // دالة محسنة لتبديل الوضع
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      
      // تطبيق التغيير فوراً
      const root = document.documentElement;
      const body = document.body;
      
      if (newMode) {
        root.classList.add('dark');
        body.classList.add('dark');
        root.style.colorScheme = 'dark';
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        root.style.colorScheme = 'light';
        localStorage.setItem('theme', 'light');
      }
      
      return newMode;
    });
  };

  const value: AppContextType = {
    isDarkMode,
    setIsDarkMode: toggleDarkMode,
    currentPage,
    setCurrentPage,
    user,
    notifications,
    isAuthReady,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};