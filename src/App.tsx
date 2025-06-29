import React, { useState } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardPage } from './components/pages/DashboardPage';
import { ConfessorsPage } from './components/pages/ConfessorsPage';
import { ConfessionLogPage } from './components/pages/ConfessionLogPage';
import { BirthdaysPage } from './components/pages/BirthdaysPage';
import { AnniversariesPage } from './components/pages/AnniversariesPage';
import { CalendarPage } from './components/pages/CalendarPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { MessagesPage } from './components/pages/MessagesPage';
import { SettingsPage } from './components/pages/SettingsPage';

const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentPage, user, isAuthReady } = useAppContext();

  // Show loading while checking authentication
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-theme">
        <div className="text-center animate-fadeIn">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">جاري تحميل التطبيق...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-theme">
        <div className="max-w-md w-full animate-fadeIn">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-3xl font-bold">ك</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3">
              الكاهن الرقمي
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              نظام إدارة شامل للاعترافات والمعترفين
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 transition-theme">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">مرحباً بك</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-8 leading-relaxed">
              للوصول إلى التطبيق، يرجى تسجيل الدخول أو إنشاء حساب جديد
            </p>
            
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>تسجيل الدخول / إنشاء حساب</span>
            </button>

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/50 rounded-xl p-6 border border-blue-200 dark:border-blue-800 transition-theme">
              <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-4 text-lg">مميزات التطبيق:</h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  إدارة بيانات المعترفين والأسر
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  تسجيل وتتبع الاعترافات
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  تذكير بأعياد الميلاد والزواج
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  إرسال رسائل تهنئة تلقائية
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  تقارير وإحصائيات شاملة
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  حفظ آمن للبيانات في السحابة
                </li>
              </ul>
            </div>
          </div>
        </div>

        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'confessors':
        return <ConfessorsPage />;
      case 'confession-log':
        return <ConfessionLogPage />;
      case 'birthdays':
        return <BirthdaysPage />;
      case 'anniversaries':
        return <AnniversariesPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'reports':
        return <ReportsPage />;
      case 'messages':
        return <MessagesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div dir="rtl" className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen font-sans transition-theme">
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onClose={() => setIsSidebarOpen(false)}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="flex-1 transition-all duration-300">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          
          <div className="p-4 md:p-6">
            <div className="animate-fadeIn">
              {renderPage()}
            </div>
          </div>
        </main>
      </div>
      
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;