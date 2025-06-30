import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useSQLiteConfessors } from '../../hooks/useSQLiteConfessors';
import { useSQLiteMessageTemplates } from '../../hooks/useSQLiteMessageTemplates';
import { Icon } from '../ui/Icon';
import { SendMessageModal } from '../modals/SendMessageModal';
import { Confessor } from '../../types';

export const AnniversariesPage: React.FC = () => {
  const { user } = useAppContext();
  const { confessors } = useSQLiteConfessors();
  const { templates } = useSQLiteMessageTemplates();
  const [selectedPeriod, setSelectedPeriod] = useState('هذا الشهر');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedCouple, setSelectedCouple] = useState<{husband: Confessor, wife: Confessor} | null>(null);

  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const periods = ['اليوم', 'غداً', 'هذا الأسبوع', 'هذا الشهر', 'شهر محدد'];

  const calculateYears = (marriageDate: string) => {
    const today = new Date();
    const marriage = new Date(marriageDate);
    let years = today.getFullYear() - marriage.getFullYear();
    const monthDiff = today.getMonth() - marriage.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < marriage.getDate())) {
      years--;
    }
    return years + 1; // Next anniversary years
  };

  const getDaysUntilAnniversary = (marriageDate: string) => {
    const today = new Date();
    const marriage = new Date(marriageDate);
    const thisYear = today.getFullYear();
    
    let nextAnniversary = new Date(thisYear, marriage.getMonth(), marriage.getDate());
    if (nextAnniversary < today) {
      nextAnniversary = new Date(thisYear + 1, marriage.getMonth(), marriage.getDate());
    }
    
    const diffTime = nextAnniversary.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const marriedCouples = useMemo(() => {
    const couples: Array<{
      husband: Confessor, 
      wife: Confessor | null, 
      marriageDate: string,
      spouseName?: string
    }> = [];
    
    confessors.forEach(person => {
      if (person.socialStatus === 'متزوج' && 
          person.marriageDate && 
          !person.isDeceased && 
          !person.isArchived &&
          person.gender === 'ذكر') {
        
        // Try to find spouse in confessors list, otherwise use spouse name
        const spouse = confessors.find(c => 
          c.gender === 'أنثى' && 
          c.socialStatus === 'متزوج' && 
          c.spouseName === `${person.firstName} ${person.familyName}`
        );
        
        couples.push({
          husband: person,
          wife: spouse || null,
          marriageDate: person.marriageDate,
          spouseName: person.spouseName
        });
      }
    });
    
    return couples;
  }, [confessors]);

  const filteredAnniversaries = useMemo(() => {
    const today = new Date();
    let result = marriedCouples;

    if (selectedPeriod === 'اليوم') {
      result = marriedCouples.filter(couple => {
        const marriage = new Date(couple.marriageDate);
        return marriage.getDate() === today.getDate() && marriage.getMonth() === today.getMonth();
      });
    } else if (selectedPeriod === 'غداً') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      result = marriedCouples.filter(couple => {
        const marriage = new Date(couple.marriageDate);
        return marriage.getDate() === tomorrow.getDate() && marriage.getMonth() === tomorrow.getMonth();
      });
    } else if (selectedPeriod === 'هذا الأسبوع') {
      result = marriedCouples.filter(couple => {
        const daysUntil = getDaysUntilAnniversary(couple.marriageDate);
        return daysUntil <= 7;
      });
    } else if (selectedPeriod === 'هذا الشهر') {
      result = marriedCouples.filter(couple => {
        const marriage = new Date(couple.marriageDate);
        return marriage.getMonth() === today.getMonth();
      });
    } else if (selectedPeriod === 'شهر محدد') {
      result = marriedCouples.filter(couple => {
        const marriage = new Date(couple.marriageDate);
        return marriage.getMonth() === selectedMonth;
      });
    }

    return result.sort((a, b) => {
      const marriageA = new Date(a.marriageDate);
      const marriageB = new Date(b.marriageDate);
      return marriageA.getDate() - marriageB.getDate();
    });
  }, [marriedCouples, selectedPeriod, selectedMonth]);

  const handleSendMessage = (couple: any) => {
    if (couple.wife) {
      setSelectedCouple({ husband: couple.husband, wife: couple.wife });
    } else {
      // If wife is not in system, create a mock object for the modal
      const mockWife = {
        id: 'mock',
        firstName: couple.spouseName || 'الزوجة',
        familyName: '',
        phone1: couple.husband.spousePhone || '',
        phone1Whatsapp: true
      } as Confessor;
      setSelectedCouple({ husband: couple.husband, wife: mockWife });
    }
    setShowSendModal(true);
  };

  const anniversaryTemplates = templates.filter(t => 
    t.title.toLowerCase().includes('زواج') || 
    t.title.toLowerCase().includes('ذكرى')
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Icon name="birthday" className="w-6 h-6 text-purple-500" />
          أعياد الزواج
        </h3>
      </div>

      {/* Filters */}
      <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg mb-6">
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
        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg text-center">
          <Icon name="birthday" className="w-8 h-8 mx-auto text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">{filteredAnniversaries.length}</p>
          <p className="text-purple-600 dark:text-purple-300 text-sm">أعياد زواج</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-center">
          <Icon name="calendar" className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">
            {filteredAnniversaries.filter(couple => getDaysUntilAnniversary(couple.marriageDate) === 0).length}
          </p>
          <p className="text-blue-600 dark:text-blue-300 text-sm">اليوم</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
          <Icon name="calendar" className="w-8 h-8 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-700 dark:text-green-200">
            {filteredAnniversaries.filter(couple => getDaysUntilAnniversary(couple.marriageDate) === 1).length}
          </p>
          <p className="text-green-600 dark:text-green-300 text-sm">غداً</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg text-center">
          <Icon name="calendar" className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-200">
            {marriedCouples.length}
          </p>
          <p className="text-indigo-600 dark:text-indigo-300 text-sm">إجمالي الأزواج</p>
        </div>
      </div>

      {/* Anniversaries List */}
      <div className="space-y-4">
        {filteredAnniversaries.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="birthday" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">لا توجد أعياد زواج في هذه الفترة</p>
          </div>
        ) : (
          filteredAnniversaries.map((couple, index) => {
            const daysUntil = getDaysUntilAnniversary(couple.marriageDate);
            const years = calculateYears(couple.marriageDate);
            const marriageDate = new Date(couple.marriageDate);
            const spouseName = couple.wife ? couple.wife.firstName : couple.spouseName;
            
            return (
              <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="birthday" className="w-6 h-6 text-purple-500" />
                      <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {couple.husband.firstName} و {spouseName} {couple.husband.familyName}
                      </h4>
                      {daysUntil === 0 && (
                        <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
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
                          {marriageDate.getDate()} {months[marriageDate.getMonth()]} {marriageDate.getFullYear()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="birthday" className="w-4 h-4" />
                        <span>الذكرى الـ {years}</span>
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
                    
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {couple.husband.phone1 && (
                        <div className="flex items-center gap-2">
                          <Icon name="messages" className="w-4 h-4" />
                          <span>{couple.husband.firstName}: {couple.husband.phone1}</span>
                          {couple.husband.phone1Whatsapp && (
                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                              واتساب
                            </span>
                          )}
                        </div>
                      )}
                      {couple.wife?.phone1 && (
                        <div className="flex items-center gap-2">
                          <Icon name="messages" className="w-4 h-4" />
                          <span>{couple.wife.firstName}: {couple.wife.phone1}</span>
                          {couple.wife.phone1Whatsapp && (
                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                              واتساب
                            </span>
                          )}
                        </div>
                      )}
                      {!couple.wife && couple.husband.spousePhone && (
                        <div className="flex items-center gap-2">
                          <Icon name="messages" className="w-4 h-4" />
                          <span>{spouseName}: {couple.husband.spousePhone}</span>
                          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                            واتساب
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {(couple.husband.phone1Whatsapp || couple.wife?.phone1Whatsapp || couple.husband.spousePhone) && (
                      <button 
                        onClick={() => handleSendMessage(couple)}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Icon name="messages" className="w-4 h-4" />
                        إرسال تهنئة
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Send Message Modal */}
      {showSendModal && selectedCouple && (
        <SendMessageModal 
          person={selectedCouple.husband}
          templates={anniversaryTemplates}
          messageType="anniversary"
          couple={selectedCouple}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </div>
  );
};