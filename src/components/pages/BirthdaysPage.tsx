import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useConfessors } from '../../hooks/useConfessors';
import { useMessageTemplates } from '../../hooks/useMessageTemplates';
import { Icon } from '../ui/Icon';
import { SendMessageModal } from '../modals/SendMessageModal';
import { Confessor } from '../../types';

export const BirthdaysPage: React.FC = () => {
  const { user } = useAppContext();
  const { confessors } = useConfessors(user?.uid);
  const { templates } = useMessageTemplates(user?.uid);
  const [selectedPeriod, setSelectedPeriod] = useState('هذا الشهر');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Confessor | null>(null);

  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const periods = ['اليوم', 'غداً', 'هذا الأسبوع', 'هذا الشهر', 'شهر محدد'];

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age + 1; // Next birthday age
  };

  const getDaysUntilBirthday = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const thisYear = today.getFullYear();
    
    let nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate());
    if (nextBirthday < today) {
      nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate());
    }
    
    const diffTime = nextBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get all birthdays including children
  const allBirthdays = useMemo(() => {
    const birthdays: Array<{
      person: Confessor;
      name: string;
      birthDate: string;
      phone?: string;
      whatsapp?: boolean;
      isChild?: boolean;
      parentName?: string;
    }> = [];

    // Add confessors' birthdays
    confessors.forEach(c => {
      if (c.birthDate && !c.isDeceased && !c.isArchived) {
        birthdays.push({
          person: c,
          name: `${c.firstName} ${c.familyName}`,
          birthDate: c.birthDate,
          phone: c.phone1,
          whatsapp: c.phone1Whatsapp
        });
      }

      // Add children's birthdays
      if (c.children && c.children.length > 0) {
        c.children.forEach(child => {
          if (child.birthDate) {
            birthdays.push({
              person: c, // Parent as the contact person
              name: child.name,
              birthDate: child.birthDate,
              phone: child.phone || c.phone1, // Use child's phone or parent's
              whatsapp: c.phone1Whatsapp,
              isChild: true,
              parentName: `${c.firstName} ${c.familyName}`
            });
          }
        });
      }
    });

    return birthdays;
  }, [confessors]);

  const filteredBirthdays = useMemo(() => {
    const today = new Date();
    let result = allBirthdays;

    if (selectedPeriod === 'اليوم') {
      result = allBirthdays.filter(b => {
        const birth = new Date(b.birthDate);
        return birth.getDate() === today.getDate() && birth.getMonth() === today.getMonth();
      });
    } else if (selectedPeriod === 'غداً') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      result = allBirthdays.filter(b => {
        const birth = new Date(b.birthDate);
        return birth.getDate() === tomorrow.getDate() && birth.getMonth() === tomorrow.getMonth();
      });
    } else if (selectedPeriod === 'هذا الأسبوع') {
      result = allBirthdays.filter(b => {
        const daysUntil = getDaysUntilBirthday(b.birthDate);
        return daysUntil <= 7;
      });
    } else if (selectedPeriod === 'هذا الشهر') {
      result = allBirthdays.filter(b => {
        const birth = new Date(b.birthDate);
        return birth.getMonth() === today.getMonth();
      });
    } else if (selectedPeriod === 'شهر محدد') {
      result = allBirthdays.filter(b => {
        const birth = new Date(b.birthDate);
        return birth.getMonth() === selectedMonth;
      });
    }

    return result.sort((a, b) => {
      const birthA = new Date(a.birthDate);
      const birthB = new Date(b.birthDate);
      return birthA.getDate() - birthB.getDate();
    });
  }, [allBirthdays, selectedPeriod, selectedMonth]);

  const handleSendMessage = (birthday: any) => {
    setSelectedPerson(birthday.person);
    setShowSendModal(true);
  };

  const birthdayTemplates = templates.filter(t => 
    t.title.toLowerCase().includes('ميلاد') || 
    t.title.toLowerCase().includes('عيد')
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Icon name="birthday" className="w-6 h-6 text-pink-500" />
          أعياد الميلاد
        </h3>
      </div>

      {/* Filters */}
      <div className="bg-pink-50 dark:bg-pink-900 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">الفترة الزمنية</label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            >
              {periods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
          
          {selectedPeriod === 'شهر محدد' && (
            <div>
              <label className="block text-sm font-medium mb-2">الشهر</label>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-pink-50 dark:bg-pink-900 p-4 rounded-lg text-center">
          <Icon name="birthday" className="w-8 h-8 mx-auto text-pink-500 mb-2" />
          <p className="text-2xl font-bold text-pink-700 dark:text-pink-200">{filteredBirthdays.length}</p>
          <p className="text-pink-600 dark:text-pink-300 text-sm">أعياد ميلاد</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-center">
          <Icon name="calendar" className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">
            {filteredBirthdays.filter(b => getDaysUntilBirthday(b.birthDate) === 0).length}
          </p>
          <p className="text-blue-600 dark:text-blue-300 text-sm">اليوم</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
          <Icon name="calendar" className="w-8 h-8 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-700 dark:text-green-200">
            {filteredBirthdays.filter(b => getDaysUntilBirthday(b.birthDate) === 1).length}
          </p>
          <p className="text-green-600 dark:text-green-300 text-sm">غداً</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg text-center">
          <Icon name="users" className="w-8 h-8 mx-auto text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">
            {filteredBirthdays.filter(b => b.isChild).length}
          </p>
          <p className="text-purple-600 dark:text-purple-300 text-sm">أطفال</p>
        </div>
      </div>

      {/* Birthdays List */}
      <div className="space-y-4">
        {filteredBirthdays.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="birthday" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">لا توجد أعياد ميلاد في هذه الفترة</p>
          </div>
        ) : (
          filteredBirthdays.map((birthday, index) => {
            const daysUntil = getDaysUntilBirthday(birthday.birthDate);
            const age = calculateAge(birthday.birthDate);
            const birthDate = new Date(birthday.birthDate);
            
            return (
              <div key={index} className={`p-4 rounded-lg border ${
                birthday.isChild 
                  ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 border-purple-200 dark:border-purple-700'
                  : 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900 dark:to-purple-900 border-pink-200 dark:border-pink-700'
              }`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="birthday" className={`w-6 h-6 ${birthday.isChild ? 'text-purple-500' : 'text-pink-500'}`} />
                      <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {birthday.name}
                        {birthday.isChild && (
                          <span className="mr-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                            طفل
                          </span>
                        )}
                      </h4>
                      {daysUntil === 0 && (
                        <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                          اليوم!
                        </span>
                      )}
                      {daysUntil === 1 && (
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          غداً
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Icon name="calendar" className="w-4 h-4" />
                        <span>
                          {birthDate.getDate()} {months[birthDate.getMonth()]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="birthday" className="w-4 h-4" />
                        <span>سيتم {age} سنة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="calendar" className="w-4 h-4" />
                        <span>
                          {daysUntil === 0 ? 'اليوم' : 
                           daysUntil === 1 ? 'غداً' : 
                           `خلال ${daysUntil} يوم`}
                        </span>
                      </div>
                    </div>
                    
                    {birthday.isChild && birthday.parentName && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-purple-600 dark:text-purple-300">
                        <Icon name="users" className="w-4 h-4" />
                        <span>ولد/ة {birthday.parentName}</span>
                      </div>
                    )}
                    
                    {birthday.phone && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <Icon name="messages" className="w-4 h-4" />
                        <span>{birthday.phone}</span>
                        {birthday.whatsapp && (
                          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                            واتساب
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {birthday.phone && birthday.whatsapp && (
                      <button 
                        onClick={() => handleSendMessage(birthday)}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Icon name="messages" className="w-4 h-4" />
                        إرسال تهنئة
                      </button>
                    )}
                    
                    {birthday.phone && (
                      <a 
                        href={`tel:${birthday.phone}`}
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Icon name="messages" className="w-4 h-4" />
                        اتصال
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Send Message Modal */}
      {showSendModal && selectedPerson && (
        <SendMessageModal 
          person={selectedPerson}
          templates={birthdayTemplates}
          messageType="birthday"
          onClose={() => setShowSendModal(false)}
        />
      )}
    </div>
  );
};