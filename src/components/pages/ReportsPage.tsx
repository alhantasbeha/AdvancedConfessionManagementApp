import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useSQLiteConfessors } from '../../hooks/useSQLiteConfessors';
import { useSQLiteConfessionLogs } from '../../hooks/useSQLiteConfessionLogs';
import { useSQLiteSettings } from '../../hooks/useSQLiteSettings';
import { Icon } from '../ui/Icon';
import { Confessor, ConfessionLog } from '../../types';

export const ReportsPage: React.FC = () => {
  const { user } = useAppContext();
  const { confessors } = useSQLiteConfessors();
  const { logs } = useSQLiteConfessionLogs();
  const { settings } = useSQLiteSettings();
  
  const [filters, setFilters] = useState({
    name: '',
    gender: 'الكل',
    socialStatus: 'الكل',
    church: 'الكل',
    ageFrom: '',
    ageTo: '',
    confessionStartFrom: '',
    confessionStartTo: '',
    lastConfessionFrom: '',
    lastConfessionTo: '',
    isDeacon: false,
    isOverdue: false,
    selectedServices: [] as string[],
    selectedTags: [] as string[],
  });

  const [reportType, setReportType] = useState<'overview' | 'detailed' | 'confession' | 'demographics'>('overview');

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getLastConfessionDate = (confessorId: string) => {
    const confessorLogs = logs.filter(log => log.confessorId === confessorId);
    if (confessorLogs.length === 0) return null;
    
    const sortedLogs = confessorLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return new Date(sortedLogs[0].date);
  };

  const isOverdueConfession = (confessorId: string) => {
    const lastConfession = getLastConfessionDate(confessorId);
    if (!lastConfession) return true;
    
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastConfession.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 60;
  };

  const filteredConfessors = useMemo(() => {
    return confessors.filter(c => {
      // Name filter
      const fullName = `${c.firstName || ''} ${c.fatherName || ''} ${c.familyName || ''}`.toLowerCase();
      if (filters.name && !fullName.includes(filters.name.toLowerCase())) return false;

      // Basic filters
      if (filters.gender !== 'الكل' && c.gender !== filters.gender) return false;
      if (filters.socialStatus !== 'الكل' && c.socialStatus !== filters.socialStatus) return false;
      if (filters.church !== 'الكل' && c.church !== filters.church) return false;
      if (filters.isDeacon && !c.isDeacon) return false;
      if (filters.isOverdue && !isOverdueConfession(c.id!)) return false;

      // Age filter
      const age = calculateAge(c.birthDate);
      if (age !== null) {
        if (filters.ageFrom && age < parseInt(filters.ageFrom)) return false;
        if (filters.ageTo && age > parseInt(filters.ageTo)) return false;
      }

      // Confession start date filter
      if (c.confessionStartDate) {
        const confDate = new Date(c.confessionStartDate);
        if (filters.confessionStartFrom && confDate < new Date(filters.confessionStartFrom)) return false;
        if (filters.confessionStartTo && confDate > new Date(filters.confessionStartTo)) return false;
      }

      // Last confession date filter
      const lastConfession = getLastConfessionDate(c.id!);
      if (lastConfession) {
        if (filters.lastConfessionFrom && lastConfession < new Date(filters.lastConfessionFrom)) return false;
        if (filters.lastConfessionTo && lastConfession > new Date(filters.lastConfessionTo)) return false;
      }

      // Services and tags filters
      if (filters.selectedServices.length > 0 && !filters.selectedServices.every(s => c.services?.includes(s))) return false;
      if (filters.selectedTags.length > 0 && !filters.selectedTags.every(t => c.personalTags?.includes(t))) return false;

      return true;
    });
  }, [confessors, filters, logs]);

  const churches = useMemo(() => {
    return ['الكل', ...new Set(confessors.map(c => c.church).filter(Boolean))];
  }, [confessors]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelectChange = (listName: 'selectedServices' | 'selectedTags', value: string) => {
    const currentList = filters[listName];
    const newList = currentList.includes(value)
      ? currentList.filter(item => item !== value)
      : [...currentList, value];
    setFilters(prev => ({ ...prev, [listName]: newList }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      gender: 'الكل',
      socialStatus: 'الكل',
      church: 'الكل',
      ageFrom: '',
      ageTo: '',
      confessionStartFrom: '',
      confessionStartTo: '',
      lastConfessionFrom: '',
      lastConfessionTo: '',
      isDeacon: false,
      isOverdue: false,
      selectedServices: [],
      selectedTags: [],
    });
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "الاسم الكامل,العمر,الجنس,الحالة الاجتماعية,الكنيسة,تاريخ آخر اعتراف,الخدمات,العلامات الشخصية\n";
    
    filteredConfessors.forEach(c => {
      const name = `"${c.firstName} ${c.fatherName || ''} ${c.familyName}"`;
      const age = calculateAge(c.birthDate) || '';
      const lastConfession = getLastConfessionDate(c.id!) 
        ? getLastConfessionDate(c.id!)!.toLocaleDateString('ar-EG') 
        : 'لا يوجد';
      const services = c.services?.join('; ') || '';
      const tags = c.personalTags?.join('; ') || '';
      
      csvContent += [name, age, c.gender, c.socialStatus, c.church, lastConfession, `"${services}"`, `"${tags}"`].join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_المعترفين_${new Date().toLocaleDateString('ar-EG')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistics calculations
  const stats = useMemo(() => {
    const total = filteredConfessors.length;
    const males = filteredConfessors.filter(c => c.gender === 'ذكر').length;
    const females = filteredConfessors.filter(c => c.gender === 'أنثى').length;
    const married = filteredConfessors.filter(c => c.socialStatus === 'متزوج').length;
    const single = filteredConfessors.filter(c => c.socialStatus === 'أعزب').length;
    const deacons = filteredConfessors.filter(c => c.isDeacon).length;
    const overdue = filteredConfessors.filter(c => isOverdueConfession(c.id!)).length;
    
    const ageGroups = {
      children: filteredConfessors.filter(c => {
        const age = calculateAge(c.birthDate);
        return age !== null && age < 18;
      }).length,
      youth: filteredConfessors.filter(c => {
        const age = calculateAge(c.birthDate);
        return age !== null && age >= 18 && age < 35;
      }).length,
      adults: filteredConfessors.filter(c => {
        const age = calculateAge(c.birthDate);
        return age !== null && age >= 35 && age < 60;
      }).length,
      seniors: filteredConfessors.filter(c => {
        const age = calculateAge(c.birthDate);
        return age !== null && age >= 60;
      }).length,
    };

    return {
      total, males, females, married, single, deacons, overdue, ageGroups
    };
  }, [filteredConfessors]);

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-center">
          <Icon name="users" className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{stats.total}</p>
          <p className="text-blue-600 dark:text-blue-300 text-sm">إجمالي المعترفين</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
          <Icon name="users" className="w-8 h-8 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-700 dark:text-green-200">{stats.males}</p>
          <p className="text-green-600 dark:text-green-300 text-sm">ذكور</p>
        </div>
        <div className="bg-pink-50 dark:bg-pink-900 p-4 rounded-lg text-center">
          <Icon name="users" className="w-8 h-8 mx-auto text-pink-500 mb-2" />
          <p className="text-2xl font-bold text-pink-700 dark:text-pink-200">{stats.females}</p>
          <p className="text-pink-600 dark:text-pink-300 text-sm">إناث</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg text-center">
          <Icon name="users" className="w-8 h-8 mx-auto text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">{stats.deacons}</p>
          <p className="text-purple-600 dark:text-purple-300 text-sm">شمامسة</p>
        </div>
      </div>

      {/* Age Groups */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
        <h4 className="text-lg font-bold mb-4">التوزيع العمري</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.ageGroups.children}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">أطفال (أقل من 18)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.ageGroups.youth}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">شباب (18-34)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.ageGroups.adults}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">بالغون (35-59)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.ageGroups.seniors}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">كبار السن (60+)</p>
          </div>
        </div>
      </div>

      {/* Social Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
        <h4 className="text-lg font-bold mb-4">الحالة الاجتماعية</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.single}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">أعزب</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.married}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">متزوج</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {filteredConfessors.filter(c => c.socialStatus === 'أرمل').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">أرمل</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {filteredConfessors.filter(c => c.socialStatus === 'مطلق').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">مطلق</p>
          </div>
        </div>
      </div>

      {/* Confession Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
        <h4 className="text-lg font-bold mb-4">حالة الاعتراف</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.total - stats.overdue}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">منتظمون في الاعتراف</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">متأخرون عن الاعتراف</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailedReport = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <th className="p-3 text-right">الاسم الكامل</th>
            <th className="p-3 text-right">العمر</th>
            <th className="p-3 text-right">الجنس</th>
            <th className="p-3 text-right">الحالة الاجتماعية</th>
            <th className="p-3 text-right">الكنيسة</th>
            <th className="p-3 text-right">آخر اعتراف</th>
            <th className="p-3 text-right">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {filteredConfessors.map(c => {
            const lastConfession = getLastConfessionDate(c.id!);
            const isOverdue = isOverdueConfession(c.id!);
            
            return (
              <tr key={c.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3 font-semibold">
                  {`${c.firstName} ${c.fatherName || ''} ${c.familyName}`}
                  {c.isDeacon && <span className="mr-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">شماس</span>}
                </td>
                <td className="p-3">{calculateAge(c.birthDate) || '-'}</td>
                <td className="p-3">{c.gender}</td>
                <td className="p-3">{c.socialStatus}</td>
                <td className="p-3">{c.church}</td>
                <td className="p-3">
                  {lastConfession ? lastConfession.toLocaleDateString('ar-EG') : 'لا يوجد'}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    isOverdue 
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' 
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}>
                    {isOverdue ? 'متأخر' : 'منتظم'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {filteredConfessors.length === 0 && (
        <div className="text-center py-8">
          <Icon name="reports" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">لا توجد بيانات تطابق الفلاتر المحددة</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Icon name="reports" className="w-6 h-6 text-blue-500" />
          التقارير والتحليلات
        </h3>
        
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Icon name="export" className="w-4 h-4" />
            تصدير CSV
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Icon name="print" className="w-4 h-4" />
            طباعة
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setReportType('overview')}
            className={`px-4 py-2 rounded-lg ${reportType === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
          >
            نظرة عامة
          </button>
          <button
            onClick={() => setReportType('detailed')}
            className={`px-4 py-2 rounded-lg ${reportType === 'detailed' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
          >
            تقرير مفصل
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-bold">فلاتر التقرير</h4>
          <button 
            onClick={clearFilters}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Icon name="close" className="w-4 h-4" />
            مسح الفلاتر
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input 
            name="name" 
            value={filters.name} 
            onChange={handleFilterChange} 
            placeholder="البحث بالاسم..." 
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          
          <select 
            name="gender" 
            value={filters.gender} 
            onChange={handleFilterChange} 
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="الكل">جميع الأجناس</option>
            <option value="ذكر">ذكر</option>
            <option value="أنثى">أنثى</option>
          </select>
          
          <select 
            name="socialStatus" 
            value={filters.socialStatus} 
            onChange={handleFilterChange} 
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="الكل">جميع الحالات</option>
            <option value="أعزب">أعزب</option>
            <option value="متزوج">متزوج</option>
            <option value="أرمل">أرمل</option>
            <option value="مطلق">مطلق</option>
          </select>
          
          <select 
            name="church" 
            value={filters.church} 
            onChange={handleFilterChange} 
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            {churches.map(church => (
              <option key={church} value={church}>{church}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <input 
              type="number" 
              name="ageFrom" 
              value={filters.ageFrom} 
              onChange={handleFilterChange} 
              placeholder="العمر من" 
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 w-full"
            />
            <input 
              type="number" 
              name="ageTo" 
              value={filters.ageTo} 
              onChange={handleFilterChange} 
              placeholder="إلى" 
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="isDeacon" 
                checked={filters.isDeacon} 
                onChange={handleFilterChange}
                className="w-4 h-4"
              />
              <span className="text-sm">الشمامسة فقط</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="isOverdue" 
                checked={filters.isOverdue} 
                onChange={handleFilterChange}
                className="w-4 h-4"
              />
              <span className="text-sm">المتأخرون فقط</span>
            </label>
          </div>
        </div>

        {/* Services Filter */}
        {settings.services && settings.services.length > 0 && (
          <div className="mt-4">
            <h5 className="font-semibold mb-2">الخدمات</h5>
            <div className="flex flex-wrap gap-2">
              {settings.services.map(service => (
                <label key={service} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={filters.selectedServices.includes(service)} 
                    onChange={() => handleMultiSelectChange('selectedServices', service)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{service}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tags Filter */}
        {settings.personalTags && settings.personalTags.length > 0 && (
          <div className="mt-4">
            <h5 className="font-semibold mb-2">العلامات الشخصية</h5>
            <div className="flex flex-wrap gap-2">
              {settings.personalTags.map(tag => (
                <label key={tag} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={filters.selectedTags.includes(tag)} 
                    onChange={() => handleMultiSelectChange('selectedTags', tag)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Report Content */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg print-section">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-bold">
            {reportType === 'overview' ? 'نظرة عامة' : 'تقرير مفصل'} 
            ({filteredConfessors.length} نتيجة)
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            تم إنشاؤه في: {new Date().toLocaleDateString('ar-EG')}
          </div>
        </div>

        {reportType === 'overview' ? renderOverviewReport() : renderDetailedReport()}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
};