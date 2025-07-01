import React, { useState } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
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

  // مع SQLite، المستخدم دائماً متاح
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
          <Header 
            onMenuClick={() => setIsSidebarOpen(true)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          
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