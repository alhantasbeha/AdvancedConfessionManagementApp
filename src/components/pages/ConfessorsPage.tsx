import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useSQLiteConfessors } from '../../hooks/useSQLiteConfessors';
import { Icon } from '../ui/Icon';
import { ConfessorModal } from '../modals/ConfessorModal';
import { ConfessorProfilePage } from './ConfessorProfilePage';
import { assignFakeImagesToConfessors } from '../../utils/fakeImages';
import { Confessor } from '../../types';

export const ConfessorsPage: React.FC = () => {
  const { user } = useAppContext();
  const { confessors: rawConfessors, loading, updateConfessor } = useSQLiteConfessors();
  const [filteredConfessors, setFilteredConfessors] = useState<Confessor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingConfessor, setEditingConfessor] = useState<Confessor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedConfessorId, setSelectedConfessorId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // إضافة الصور الوهمية للمعترفين
  const confessors = useMemo(() => {
    return assignFakeImagesToConfessors(rawConfessors);
  }, [rawConfessors]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    let results = confessors.filter(c => 
      (c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       c.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       c.familyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.spouseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.children?.some(child => child.name?.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      c.isArchived === showArchived
    );
    setFilteredConfessors(results);
  }, [searchTerm, confessors, showArchived]);

  const handleAdd = () => {
    setEditingConfessor(null);
    setShowModal(true);
  };

  const handleEdit = (confessor: Confessor) => {
    setEditingConfessor(confessor);
    setShowModal(true);
  };
  
  const handleArchive = async (confessor: Confessor) => {
    if (!confessor.id) return;
    await updateConfessor(confessor.id, {
      isArchived: !confessor.isArchived
    });
  };

  const handleViewProfile = (confessorId: string) => {
    setSelectedConfessorId(confessorId);
  };

  const handleBackToList = () => {
    setSelectedConfessorId(null);
  };

  // If a confessor is selected, show their profile page
  if (selectedConfessorId) {
    return (
      <ConfessorProfilePage 
        confessorId={selectedConfessorId}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredConfessors.map(confessor => (
        <div key={confessor.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Card Header with Profile Image */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
                {confessor.profileImage ? (
                  <img
                    src={confessor.profileImage}
                    alt={`${confessor.firstName} ${confessor.familyName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${confessor.firstName}+${confessor.familyName}&background=random&color=fff&size=200&rounded=true&bold=true`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <Icon name="users" className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="pt-16 pb-6 px-6">
            {/* Name and Status */}
            <div className="text-center mb-4">
              <button
                onClick={() => handleViewProfile(confessor.id!)}
                className="text-lg font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {`${confessor.firstName} ${confessor.familyName}`}
              </button>
              
              <div className="flex justify-center gap-2 mt-2">
                {confessor.isDeacon && (
                  <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                    شماس
                  </span>
                )}
                {confessor.isDeceased && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
                    متوفى
                  </span>
                )}
                {confessor.isArchived && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                    مؤرشف
                  </span>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Icon name="calendar" className="w-4 h-4 text-blue-500" />
                <span>{calculateAge(confessor.birthDate)} سنة</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Icon name="users" className="w-4 h-4 text-green-500" />
                <span>{confessor.socialStatus}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Icon name="messages" className="w-4 h-4 text-purple-500" />
                <span className="truncate">{confessor.phone1}</span>
                {confessor.phone1Whatsapp && (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 rounded">
                    واتساب
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Icon name="settings" className="w-4 h-4 text-orange-500" />
                <span className="truncate">{confessor.church}</span>
              </div>
            </div>

            {/* Family Info */}
            {confessor.socialStatus === 'متزوج' && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  {confessor.spouseName && (
                    <div>الزوج/ة: {confessor.spouseName}</div>
                  )}
                  {confessor.children && confessor.children.length > 0 && (
                    <div>الأطفال: {confessor.children.length}</div>
                  )}
                </div>
              </div>
            )}

            {/* Services and Tags */}
            {(confessor.services?.length > 0 || confessor.personalTags?.length > 0) && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {confessor.services?.slice(0, 2).map(service => (
                    <span key={service} className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                      {service}
                    </span>
                  ))}
                  {confessor.personalTags?.slice(0, 1).map(tag => (
                    <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                  {(confessor.services?.length > 2 || confessor.personalTags?.length > 1) && (
                    <span className="text-xs text-gray-500">+المزيد</span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => handleViewProfile(confessor.id!)}
                className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded-full transition-colors"
                title="عرض الملف الشخصي"
              >
                <Icon name="search" className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => handleEdit(confessor)} 
                className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors"
                title="تعديل"
              >
                <Icon name="edit" className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => handleArchive(confessor)} 
                className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-full transition-colors"
                title={confessor.isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}
              >
                <Icon name={confessor.isArchived ? 'unarchive' : 'archive'} className="w-4 h-4" />
              </button>

              {confessor.phone1Whatsapp && (
                <a 
                  href={`https://wa.me/${confessor.phone1}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-full transition-colors"
                  title="واتساب"
                >
                  <Icon name="messages" className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <th className="p-3">الصورة</th>
            <th className="p-3">الاسم بالكامل</th>
            <th className="p-3">العمر</th>
            <th className="p-3">رقم الهاتف</th>
            <th className="p-3">الكنيسة</th>
            <th className="p-3">الأسرة</th>
            <th className="p-3">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredConfessors.map(confessor => (
            <tr key={confessor.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="p-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  {confessor.profileImage ? (
                    <img
                      src={confessor.profileImage}
                      alt={`${confessor.firstName} ${confessor.familyName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${confessor.firstName}+${confessor.familyName}&background=random&color=fff&size=200&rounded=true&bold=true`;
                      }}
                    />
                  ) : (
                    <Icon name="users" className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </td>
              <td className="p-3 font-semibold">
                <div>
                  <button
                    onClick={() => handleViewProfile(confessor.id!)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:underline font-semibold"
                  >
                    {`${confessor.firstName || ''} ${confessor.fatherName || ''} ${confessor.familyName || ''}`}
                  </button>
                  {confessor.isDeacon && (
                    <span className="mr-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                      شماس
                    </span>
                  )}
                </div>
              </td>
              <td className="p-3">{calculateAge(confessor.birthDate)}</td>
              <td className="p-3">
                <div>
                  {confessor.phone1}
                  {confessor.phone1Whatsapp && (
                    <span className="mr-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 rounded">
                      واتساب
                    </span>
                  )}
                </div>
              </td>
              <td className="p-3">{confessor.church}</td>
              <td className="p-3">
                <div className="text-sm">
                  {confessor.socialStatus === 'متزوج' && (
                    <div>
                      {confessor.spouseName && (
                        <div className="text-blue-600 dark:text-blue-400">
                          الزوج/ة: {confessor.spouseName}
                        </div>
                      )}
                      {confessor.children && confessor.children.length > 0 && (
                        <div className="text-green-600 dark:text-green-400">
                          الأطفال: {confessor.children.length}
                        </div>
                      )}
                    </div>
                  )}
                  {confessor.socialStatus !== 'متزوج' && (
                    <span className="text-gray-500">{confessor.socialStatus}</span>
                  )}
                </div>
              </td>
              <td className="p-3 flex items-center gap-2">
                <button 
                  onClick={() => handleViewProfile(confessor.id!)}
                  className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded-full"
                  title="عرض الملف الشخصي"
                >
                  <Icon name="search" className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleEdit(confessor)} 
                  className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full"
                  title="تعديل"
                >
                  <Icon name="edit" className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleArchive(confessor)} 
                  className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-full"
                  title={confessor.isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}
                >
                  <Icon name={confessor.isArchived ? 'unarchive' : 'archive'} className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="relative w-full md:w-1/3">
          <input 
            type="text" 
            placeholder="ابحث بالاسم أو اسم الزوج أو الأطفال..." 
            className="w-full p-2 pr-10 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Icon name="search" className="w-5 h-5 absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              title="عرض البطاقات"
            >
              <Icon name="dashboard" className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              title="عرض الجدول"
            >
              <Icon name="reports" className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={handleAdd} 
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Icon name="add" className="w-5 h-5" />
            إضافة معترف
          </button>
          
          <button 
            onClick={() => setShowArchived(!showArchived)} 
            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Icon name={showArchived ? 'unarchive' : 'archive'} className="w-5 h-5" />
            {showArchived ? 'عرض النشطين' : 'عرض الأرشيف'}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-center">
          <Icon name="users" className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{filteredConfessors.length}</p>
          <p className="text-blue-600 dark:text-blue-300 text-sm">{showArchived ? 'مؤرشف' : 'نشط'}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
          <Icon name="users" className="w-8 h-8 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-700 dark:text-green-200">
            {filteredConfessors.filter(c => c.gender === 'ذكر').length}
          </p>
          <p className="text-green-600 dark:text-green-300 text-sm">ذكور</p>
        </div>
        <div className="bg-pink-50 dark:bg-pink-900 p-4 rounded-lg text-center">
          <Icon name="users" className="w-8 h-8 mx-auto text-pink-500 mb-2" />
          <p className="text-2xl font-bold text-pink-700 dark:text-pink-200">
            {filteredConfessors.filter(c => c.gender === 'أنثى').length}
          </p>
          <p className="text-pink-600 dark:text-pink-300 text-sm">إناث</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg text-center">
          <Icon name="users" className="w-8 h-8 mx-auto text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">
            {filteredConfessors.filter(c => c.socialStatus === 'متزوج').length}
          </p>
          <p className="text-purple-600 dark:text-purple-300 text-sm">متزوجون</p>
        </div>
      </div>

      {/* Content */}
      {filteredConfessors.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="users" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg mb-4">
            {showArchived ? 'لا توجد معترفين مؤرشفين' : 'لا توجد بيانات لعرضها'}
          </p>
          {!showArchived && (
            <button 
              onClick={handleAdd}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              إضافة أول معترف
            </button>
          )}
        </div>
      ) : (
        viewMode === 'cards' ? renderCardView() : renderTableView()
      )}

      {showModal && (
        <ConfessorModal 
          confessor={editingConfessor} 
          allConfessors={confessors}
          onClose={() => setShowModal(false)} 
          userId={user?.uid} 
        />
      )}
    </div>
  );
};