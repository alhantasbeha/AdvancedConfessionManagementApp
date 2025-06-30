import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useSQLiteConfessors } from '../../hooks/useSQLiteConfessors';
import { useSQLiteConfessionLogs } from '../../hooks/useSQLiteConfessionLogs';
import { Icon } from '../ui/Icon';
import { ConfessionLogModal } from '../modals/ConfessionLogModal';
import { ConfessorModal } from '../modals/ConfessorModal';
import { Confessor, ConfessionLog } from '../../types';

interface ConfessorProfilePageProps {
  confessorId: string;
  onBack: () => void;
}

export const ConfessorProfilePage: React.FC<ConfessorProfilePageProps> = ({ 
  confessorId, 
  onBack 
}) => {
  const { user } = useAppContext();
  const { confessors } = useSQLiteConfessors();
  const { logs } = useSQLiteConfessionLogs();
  const [confessor, setConfessor] = useState<Confessor | null>(null);
  const [confessorLogs, setConfessorLogs] = useState<ConfessionLog[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingLog, setEditingLog] = useState<ConfessionLog | null>(null);
  const [logModalMode, setLogModalMode] = useState<'add' | 'edit' | 'view'>('add');

  useEffect(() => {
    const foundConfessor = confessors.find(c => c.id === confessorId);
    setConfessor(foundConfessor || null);
    
    const filteredLogs = logs.filter(log => log.confessorId === confessorId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setConfessorLogs(filteredLogs);
  }, [confessorId, confessors, logs]);

  if (!confessor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="users" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">لم يتم العثور على المعترف</p>
          <button 
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            العودة للقائمة
          </button>
        </div>
      </div>
    );
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getLastConfessionDate = () => {
    if (confessorLogs.length === 0) return null;
    return new Date(confessorLogs[0].date);
  };

  const getDaysSinceLastConfession = () => {
    const lastDate = getLastConfessionDate();
    if (!lastDate) return null;
    const today = new Date();
    const diffTime = today.getTime() - lastDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleAddLog = () => {
    setEditingLog(null);
    setLogModalMode('add');
    setShowLogModal(true);
  };

  const handleViewLog = (log: ConfessionLog) => {
    setEditingLog(log);
    setLogModalMode('view');
    setShowLogModal(true);
  };

  const handleEditLog = (log: ConfessionLog) => {
    setEditingLog(log);
    setLogModalMode('edit');
    setShowLogModal(true);
  };

  const daysSinceLastConfession = getDaysSinceLastConfession();
  const isOverdue = daysSinceLastConfession && daysSinceLastConfession > 60;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <Icon name="arrowRight" className="w-5 h-5" />
            العودة للقائمة
          </button>
          
          <button 
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <Icon name="edit" className="w-5 h-5" />
            تعديل البيانات
          </button>
        </div>
        
        <div className="mt-6 flex items-start gap-6">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/20 flex items-center justify-center">
              {confessor.profileImage ? (
                <img
                  src={confessor.profileImage}
                  alt="الصورة الشخصية"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon name="users" className="w-12 h-12 text-white/70" />
              )}
            </div>
          </div>
          
          {/* Basic Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {`${confessor.firstName} ${confessor.fatherName} ${confessor.familyName}`}
              {confessor.isDeacon && (
                <span className="mr-3 text-lg bg-purple-500/30 text-purple-100 px-3 py-1 rounded-full">
                  شماس
                </span>
              )}
              {confessor.isDeceased && (
                <span className="mr-3 text-lg bg-gray-500/30 text-gray-100 px-3 py-1 rounded-full">
                  متوفى
                </span>
              )}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Icon name="calendar" className="w-5 h-5" />
                <span>{calculateAge(confessor.birthDate)} سنة</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="users" className="w-5 h-5" />
                <span>{confessor.socialStatus}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="settings" className="w-5 h-5" />
                <span>{confessor.church}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-r-4 border-blue-500">
          <div className="flex items-center gap-3">
            <Icon name="log" className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{confessorLogs.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">إجمالي الاعترافات</p>
            </div>
          </div>
        </div>
        
        <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-r-4 ${
          isOverdue ? 'border-red-500' : 'border-green-500'
        }`}>
          <div className="flex items-center gap-3">
            <Icon name="calendar" className={`w-8 h-8 ${isOverdue ? 'text-red-500' : 'text-green-500'}`} />
            <div>
              <p className="text-2xl font-bold">
                {daysSinceLastConfession || 'لا يوجد'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {daysSinceLastConfession ? 'يوم منذ آخر اعتراف' : 'لم يسجل اعتراف'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-r-4 border-purple-500">
          <div className="flex items-center gap-3">
            <Icon name="birthday" className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">
                {new Date(confessor.birthDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">عيد الميلاد</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-r-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <Icon name="messages" className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{confessor.phone1Whatsapp ? 'متاح' : 'غير متاح'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">واتساب</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="users" className="w-6 h-6 text-blue-500" />
              المعلومات الشخصية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  الاسم الكامل
                </label>
                <p className="text-lg font-semibold">
                  {`${confessor.firstName} ${confessor.fatherName} ${confessor.grandFatherName || ''} ${confessor.familyName}`.trim()}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  الجنس
                </label>
                <p className="text-lg">{confessor.gender}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  تاريخ الميلاد
                </label>
                <p className="text-lg">
                  {new Date(confessor.birthDate).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  العمر
                </label>
                <p className="text-lg">{calculateAge(confessor.birthDate)} سنة</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  الحالة الاجتماعية
                </label>
                <p className="text-lg">{confessor.socialStatus}</p>
              </div>
              
              {confessor.marriageDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    تاريخ الزواج
                  </label>
                  <p className="text-lg">
                    {new Date(confessor.marriageDate).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              
              {confessor.profession && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    المهنة
                  </label>
                  <p className="text-lg">{confessor.profession}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="messages" className="w-6 h-6 text-green-500" />
              معلومات الاتصال
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                <Icon name="messages" className="w-6 h-6 text-green-600" />
                <div className="flex-1">
                  <p className="font-semibold">{confessor.phone1}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">الهاتف الأول</p>
                </div>
                {confessor.phone1Whatsapp && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    واتساب
                  </span>
                )}
                <div className="flex gap-2">
                  <a 
                    href={`tel:${confessor.phone1}`}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    title="اتصال"
                  >
                    <Icon name="messages" className="w-4 h-4" />
                  </a>
                  {confessor.phone1Whatsapp && (
                    <a 
                      href={`https://wa.me/${confessor.phone1}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      title="واتساب"
                    >
                      <Icon name="messages" className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              
              {confessor.phone2 && (
                <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Icon name="messages" className="w-6 h-6 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-semibold">{confessor.phone2}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">الهاتف الثاني</p>
                  </div>
                  {confessor.phone2Whatsapp && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      واتساب
                    </span>
                  )}
                  <div className="flex gap-2">
                    <a 
                      href={`tel:${confessor.phone2}`}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="اتصال"
                    >
                      <Icon name="messages" className="w-4 h-4" />
                    </a>
                    {confessor.phone2Whatsapp && (
                      <a 
                        href={`https://wa.me/${confessor.phone2}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        title="واتساب"
                      >
                        <Icon name="messages" className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Family Information */}
          {confessor.socialStatus === 'متزوج' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="users" className="w-6 h-6 text-purple-500" />
                معلومات الأسرة
              </h3>
              
              {confessor.spouseName && (
                <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                  <h4 className="font-semibold mb-2">الزوج/الزوجة</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{confessor.spouseName}</p>
                      {confessor.spousePhone && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">{confessor.spousePhone}</p>
                      )}
                    </div>
                    {confessor.spousePhone && (
                      <div className="flex gap-2">
                        <a 
                          href={`tel:${confessor.spousePhone}`}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          title="اتصال"
                        >
                          <Icon name="messages" className="w-4 h-4" />
                        </a>
                        <a 
                          href={`https://wa.me/${confessor.spousePhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          title="واتساب"
                        >
                          <Icon name="messages" className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {confessor.children && confessor.children.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">الأطفال ({confessor.children.length})</h4>
                  <div className="space-y-3">
                    {confessor.children.map((child, index) => (
                      <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{child.name}</p>
                            {child.birthDate && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {new Date(child.birthDate).toLocaleDateString('ar-EG', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                                {' - '}
                                {calculateAge(child.birthDate)} سنة
                              </p>
                            )}
                            {child.phone && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">{child.phone}</p>
                            )}
                          </div>
                          {child.phone && (
                            <div className="flex gap-2">
                              <a 
                                href={`tel:${child.phone}`}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                title="اتصال"
                              >
                                <Icon name="messages" className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Church Information */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="settings" className="w-6 h-6 text-orange-500" />
              المعلومات الكنسية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  الكنيسة
                </label>
                <p className="text-lg">{confessor.church}</p>
              </div>
              
              {confessor.confessionStartDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    تاريخ بدء الاعتراف
                  </label>
                  <p className="text-lg">
                    {new Date(confessor.confessionStartDate).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
            
            {confessor.services && confessor.services.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  الخدمات
                </label>
                <div className="flex flex-wrap gap-2">
                  {confessor.services.map(service => (
                    <span key={service} className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {confessor.personalTags && confessor.personalTags.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  العلامات الشخصية
                </label>
                <div className="flex flex-wrap gap-2">
                  {confessor.personalTags.map(tag => (
                    <span key={tag} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {confessor.notes && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="edit" className="w-6 h-6 text-gray-500" />
                ملاحظات عامة
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{confessor.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Confession History Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Icon name="log" className="w-6 h-6 text-blue-500" />
                سجل الاعترافات
              </h3>
              <button 
                onClick={handleAddLog}
                className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <Icon name="add" className="w-4 h-4" />
                إضافة
              </button>
            </div>
            
            {confessorLogs.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="log" className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 mb-4">لا توجد سجلات اعتراف</p>
                <button 
                  onClick={handleAddLog}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  إضافة أول اعتراف
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {confessorLogs.map(log => (
                  <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-r-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">
                        {new Date(log.date).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleViewLog(log)}
                          className="p-1 text-gray-500 hover:text-blue-500 rounded"
                          title="عرض"
                        >
                          <Icon name="search" className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditLog(log)}
                          className="p-1 text-gray-500 hover:text-green-500 rounded"
                          title="تعديل"
                        >
                          <Icon name="edit" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {log.tags && log.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {log.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {log.tags.length > 2 && (
                          <span className="text-gray-500 text-xs">+{log.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                    
                    {log.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {log.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="settings" className="w-6 h-6 text-green-500" />
              إجراءات سريعة
            </h3>
            
            <div className="space-y-3">
              {confessor.phone1Whatsapp && (
                <a 
                  href={`https://wa.me/${confessor.phone1}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full p-3 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                >
                  <Icon name="messages" className="w-5 h-5" />
                  <span>إرسال رسالة واتساب</span>
                </a>
              )}
              
              <a 
                href={`tel:${confessor.phone1}`}
                className="flex items-center gap-3 w-full p-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              >
                <Icon name="messages" className="w-5 h-5" />
                <span>إجراء مكالمة</span>
              </a>
              
              <button 
                onClick={handleAddLog}
                className="flex items-center gap-3 w-full p-3 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
              >
                <Icon name="add" className="w-5 h-5" />
                <span>تسجيل اعتراف جديد</span>
              </button>
              
              <button 
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-3 w-full p-3 bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-200 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
              >
                <Icon name="edit" className="w-5 h-5" />
                <span>تعديل البيانات</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <ConfessorModal 
          confessor={confessor}
          allConfessors={confessors}
          onClose={() => setShowEditModal(false)}
          userId={user?.uid}
        />
      )}

      {showLogModal && (
        <ConfessionLogModal 
          mode={logModalMode}
          log={editingLog}
          confessors={confessors}
          onClose={() => setShowLogModal(false)}
          userId={user?.uid}
        />
      )}
    </div>
  );
};