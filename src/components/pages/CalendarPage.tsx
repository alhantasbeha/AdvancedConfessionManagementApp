import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useConfessors } from '../../hooks/useConfessors';
import { useConfessionLogs } from '../../hooks/useConfessionLogs';
import { Icon } from '../ui/Icon';
import { Confessor, ConfessionLog } from '../../types';

interface CalendarEvent {
  id: string;
  type: 'birthday' | 'anniversary' | 'confession' | 'appointment';
  title: string;
  date: Date;
  person?: Confessor;
  details?: string;
}

export const CalendarPage: React.FC = () => {
  const { user } = useAppContext();
  const { confessors } = useConfessors(user?.uid);
  const { logs } = useConfessionLogs(user?.uid);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // Generate calendar events
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    const currentYear = currentDate.getFullYear();

    // Add birthdays
    confessors.forEach(person => {
      if (person.birthDate && !person.isDeceased && !person.isArchived) {
        const birthDate = new Date(person.birthDate);
        const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
        
        events.push({
          id: `birthday-${person.id}`,
          type: 'birthday',
          title: `عيد ميلاد ${person.firstName} ${person.familyName}`,
          date: thisYearBirthday,
          person,
          details: `يتم ${currentYear - birthDate.getFullYear()} سنة`
        });
      }
    });

    // Add anniversaries
    confessors.forEach(person => {
      if (person.marriageDate && person.socialStatus === 'متزوج' && !person.isDeceased && !person.isArchived) {
        const marriageDate = new Date(person.marriageDate);
        const thisYearAnniversary = new Date(currentYear, marriageDate.getMonth(), marriageDate.getDate());
        const spouse = confessors.find(c => c.id === person.spouseId);
        
        events.push({
          id: `anniversary-${person.id}`,
          type: 'anniversary',
          title: `ذكرى زواج ${person.firstName}${spouse ? ` و ${spouse.firstName}` : ''}`,
          date: thisYearAnniversary,
          person,
          details: `الذكرى الـ ${currentYear - marriageDate.getFullYear()}`
        });
      }
    });

    // Add recent confessions
    logs.forEach(log => {
      const logDate = new Date(log.date);
      if (logDate.getFullYear() === currentYear) {
        const person = confessors.find(c => c.id === log.confessorId);
        if (person) {
          events.push({
            id: `confession-${log.id}`,
            type: 'confession',
            title: `اعتراف ${person.firstName} ${person.familyName}`,
            date: logDate,
            person,
            details: log.notes ? log.notes.substring(0, 50) + '...' : ''
          });
        }
      }
    });

    return events;
  }, [confessors, logs, currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'birthday': return 'bg-pink-500';
      case 'anniversary': return 'bg-purple-500';
      case 'confession': return 'bg-blue-500';
      case 'appointment': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Icon name="calendar" className="w-6 h-6 text-blue-500" />
            التقويم والمواعيد
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
              شهري
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
              أسبوعي
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            <Icon name="arrowRight" className="w-5 h-5" />
          </button>
          
          <div className="text-lg font-semibold min-w-[150px] text-center">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            <Icon name="arrowLeft" className="w-5 h-5" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            اليوم
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-pink-50 dark:bg-pink-900 p-3 rounded-lg text-center">
          <Icon name="birthday" className="w-6 h-6 mx-auto text-pink-500 mb-1" />
          <p className="text-lg font-bold text-pink-700 dark:text-pink-200">
            {calendarEvents.filter(e => e.type === 'birthday' && e.date.getMonth() === currentDate.getMonth()).length}
          </p>
          <p className="text-pink-600 dark:text-pink-300 text-xs">أعياد ميلاد</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded-lg text-center">
          <Icon name="birthday" className="w-6 h-6 mx-auto text-purple-500 mb-1" />
          <p className="text-lg font-bold text-purple-700 dark:text-purple-200">
            {calendarEvents.filter(e => e.type === 'anniversary' && e.date.getMonth() === currentDate.getMonth()).length}
          </p>
          <p className="text-purple-600 dark:text-purple-300 text-xs">أعياد زواج</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg text-center">
          <Icon name="log" className="w-6 h-6 mx-auto text-blue-500 mb-1" />
          <p className="text-lg font-bold text-blue-700 dark:text-blue-200">
            {calendarEvents.filter(e => e.type === 'confession' && e.date.getMonth() === currentDate.getMonth()).length}
          </p>
          <p className="text-blue-600 dark:text-blue-300 text-xs">اعترافات</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg text-center">
          <Icon name="calendar" className="w-6 h-6 mx-auto text-green-500 mb-1" />
          <p className="text-lg font-bold text-green-700 dark:text-green-200">0</p>
          <p className="text-green-600 dark:text-green-300 text-xs">مواعيد</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="p-2 text-center font-semibold text-gray-600 dark:text-gray-300 text-sm">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isSelected = selectedDate && 
                  day.getDate() === selectedDate.getDate() &&
                  day.getMonth() === selectedDate.getMonth() &&
                  day.getFullYear() === selectedDate.getFullYear();
                
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-[80px] p-1 border border-gray-200 dark:border-gray-600 cursor-pointer
                      hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors
                      ${isToday(day) ? 'bg-blue-100 dark:bg-blue-800' : ''}
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                      ${!isCurrentMonth(day) ? 'opacity-50' : ''}
                    `}
                  >
                    <div className={`text-sm font-semibold mb-1 ${isToday(day) ? 'text-blue-600 dark:text-blue-300' : ''}`}>
                      {day.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded text-white truncate ${getEventTypeColor(event.type)}`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} أخرى
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Icon name="calendar" className="w-5 h-5" />
              {selectedDate ? (
                `أحداث ${selectedDate.getDate()} ${months[selectedDate.getMonth()]}`
              ) : (
                'اختر تاريخاً'
              )}
            </h4>
            
            {selectedDate ? (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    لا توجد أحداث في هذا التاريخ
                  </p>
                ) : (
                  getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border-r-4 border-blue-500">
                      <div className="flex items-start gap-2">
                        <div className={`w-3 h-3 rounded-full mt-1 ${getEventTypeColor(event.type)}`}></div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm">{event.title}</h5>
                          {event.details && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              {event.details}
                            </p>
                          )}
                          {event.person?.phone1 && (
                            <div className="flex items-center gap-1 mt-2">
                              <Icon name="messages" className="w-3 h-3" />
                              <span className="text-xs">{event.person.phone1}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                انقر على تاريخ لعرض الأحداث
              </p>
            )}
          </div>

          {/* Legend */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
            <h4 className="font-bold mb-3">دليل الألوان</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-pink-500"></div>
                <span className="text-sm">أعياد ميلاد</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-500"></div>
                <span className="text-sm">أعياد زواج</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-sm">اعترافات</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-sm">مواعيد</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};