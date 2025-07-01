import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useSQLiteConfessors } from '../../hooks/useSQLiteConfessors';
import { usePagination } from '../../hooks/usePagination';
import { Icon } from '../ui/Icon';
import { Pagination } from '../ui/Pagination';
import { ConfessorModal } from '../modals/ConfessorModal';
import { ConfessorProfilePage } from './ConfessorProfilePage';
import { assignFakeImagesToConfessors } from '../../utils/fakeImages';
import { Confessor } from '../../types';

export const ConfessorsPage: React.FC = () => {
  const { user } = useAppContext();
  const { confessors: rawConfessors, loading, updateConfessor } = useSQLiteConfessors();
  const [showModal, setShowModal] = useState(false);
  const [editingConfessor, setEditingConfessor] = useState<Confessor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedConfessorId, setSelectedConfessorId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'church' | 'recent'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // إضافة الصور الوهمية للمعترفين
  const confessors = useMemo(() => {
    return assignFakeImagesToConfessors(rawConfessors);
  }, [rawConfessors]);

  // Filter and sort confessors
  const filteredAndSortedConfessors = useMemo(() => {
    let results = confessors.filter(c => 
      (c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       c.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       c.familyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.spouseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.children?.some(child => child.name?.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      c.isArchived === showArchived
    );

    // Sort results
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = `${a.firstName} ${a.familyName}`.localeCompare(`${b.firstName} ${b.familyName}`);
          break;
        case 'age':
          const ageA = calculateAge(a.birthDate);
          const ageB = calculateAge(b.birthDate);
          comparison = (ageA || 0) - (ageB || 0);
          break;
        case 'church':
          comparison = (a.church || '').localeCompare(b.church || '');
          break;
        case 'recent':
          comparison = (parseInt(b.id || '0') || 0) - (parseInt(a.id || '0') || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return results;
  }, [confessors, searchTerm, showArchived, sortBy, sortOrder]);

  // Pagination - تحديد العدد الافتراضي بناءً على وضع العرض
  const getDefaultItemsPerPage = () => {
    return viewMode === 'cards' ? 12 : 20;
  };

  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData: paginatedConfessors,
    totalItems,
    goToPage,
    setItemsPerPage
  } = usePagination({
    data: filteredAndSortedConfessors,
    initialItemsPerPage: getDefaultItemsPerPage(),
    initialPage: 1
  });

  // تحديث عدد العناصر عند تغيير وضع العرض
  useEffect(() => {
    const newItemsPerPage = getDefaultItemsPerPage();
    if (itemsPerPage !== newItemsPerPage) {
      setItemsPerPage(newItemsPerPage);
    }
  }, [viewMode]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

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

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const handleViewModeChange = (newViewMode: 'table' | 'cards') => {
    setViewMode(newViewMode);
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 w-full">
      {paginatedConfessors.map(confessor => (
        <div key={confessor.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 card-hover w-full min-w-0">
          {/* Card Header with Profile Image */}
          <div className="relative">
            <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <div className="absolute -bottom-8 sm:-bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
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
                    <Icon name="users" className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="pt-12 sm:pt-16 pb-4 sm:pb-6 px-4 sm:px-6 min-w-0">
            {/* Name and Status */}
            <div className="text-center mb-3 sm:mb-4 min-w-0">
              <button
                onClick={() => handleViewProfile(confessor.id!)}
                className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 w-full"
              >
                {`${confessor.firstName} ${confessor.familyName}`}
              </button>
              
              <div className="flex justify-center gap-1 sm:gap-2 mt-2 flex-wrap">
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
            <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Icon name="calendar" className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                <span className="truncate">{calculateAge(confessor.birthDate)} سنة</span>
              </div>
              
              <div className="flex items-center gap-2 min-w-0">
                <Icon name="users" className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                <span className="truncate">{confessor.socialStatus}</span>
              </div>
              
              <div className="flex items-center gap-2 min-w-0">
                <Icon name="messages" className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                <span className="truncate flex-1 min-w-0">{confessor.phone1}</span>
                {confessor.phone1Whatsapp && (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 rounded flex-shrink-0">
                    واتساب
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 min-w-0">
                <Icon name="settings" className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                <span className="truncate">{confessor.church}</span>
              </div>
            </div>

            {/* Family Info */}
            {confessor.socialStatus === 'متزوج' && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded-lg min-w-0">
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  {confessor.spouseName && (
                    <div className="truncate">الزوج/ة: {confessor.spouseName}</div>
                  )}
                  {confessor.children && confessor.children.length > 0 && (
                    <div>الأطفال: {confessor.children.length}</div>
                  )}
                </div>
              </div>
            )}

            {/* Services and Tags */}
            {(confessor.services?.length > 0 || confessor.personalTags?.length > 0) && (
              <div className="mt-3 min-w-0">
                <div className="flex flex-wrap gap-1">
                  {confessor.services?.slice(0, 1).map(service => (
                    <span key={service} className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded truncate max-w-full">
                      {service}
                    </span>
                  ))}
                  {confessor.personalTags?.slice(0, 1).map(tag => (
                    <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded truncate max-w-full">
                      {tag}
                    </span>
                  ))}
                  {(confessor.services?.length > 1 || confessor.personalTags?.length > 1) && (
                    <span className="text-xs text-gray-500">+المزيد</span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-1 sm:gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => handleViewProfile(confessor.id!)}
                className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded-full transition-colors touch-manipulation"
                title="عرض الملف الشخصي"
              >
                <Icon name="search" className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => handleEdit(confessor)} 
                className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors touch-manipulation"
                title="تعديل"
              >
                <Icon name="edit" className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => handleArchive(confessor)} 
                className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-full transition-colors touch-manipulation"
                title={confessor.isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}
              >
                <Icon name={confessor.isArchived ? 'unarchive' : 'archive'} className="w-4 h-4" />
              </button>

              {confessor.phone1Whatsapp && (
                <a 
                  href={`https://wa.me/${confessor.phone1}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-full transition-colors touch-manipulation"
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
    <div className="w-full min-w-0">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full text-right">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap">الصورة</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 text-xs sm:text-sm"
                  >
                    الاسم بالكامل
                    {sortBy === 'name' && (
                      <Icon name={sortOrder === 'asc' ? 'arrowLeft' : 'arrowRight'} className="w-3 h-3 sm:w-4 sm:h-4 transform rotate-90" />
                    )}
                  </button>
                </th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm hidden sm:table-cell whitespace-nowrap">
                  <button
                    onClick={() => handleSort('age')}
                    className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    العمر
                    {sortBy === 'age' && (
                      <Icon name={sortOrder === 'asc' ? 'arrowLeft' : 'arrowRight'} className="w-4 h-4 transform rotate-90" />
                    )}
                  </button>
                </th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm hidden md:table-cell whitespace-nowrap">رقم الهاتف</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm hidden lg:table-cell whitespace-nowrap">
                  <button
                    onClick={() => handleSort('church')}
                    className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    الكنيسة
                    {sortBy === 'church' && (
                      <Icon name={sortOrder === 'asc' ? 'arrowLeft' : 'arrowRight'} className="w-4 h-4 transform rotate-90" />
                    )}
                  </button>
                </th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm hidden xl:table-cell whitespace-nowrap">الأسرة</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedConfessors.map(confessor => (
                <tr key={confessor.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-2 sm:p-3">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
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
                        <Icon name="users" className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 font-semibold min-w-0">
                    <div className="min-w-0">
                      <button
                        onClick={() => handleViewProfile(confessor.id!)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:underline font-semibold text-xs sm:text-sm line-clamp-2 text-right w-full"
                      >
                        {`${confessor.firstName || ''} ${confessor.fatherName || ''} ${confessor.familyName || ''}`}
                      </button>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {confessor.isDeacon && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1 py-0.5 rounded">
                            شماس
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm hidden sm:table-cell whitespace-nowrap">{calculateAge(confessor.birthDate)}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm hidden md:table-cell min-w-0">
                    <div className="min-w-0">
                      <div className="truncate">{confessor.phone1}</div>
                      {confessor.phone1Whatsapp && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 rounded">
                          واتساب
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm hidden lg:table-cell min-w-0">
                    <div className="truncate">{confessor.church}</div>
                  </td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm hidden xl:table-cell min-w-0">
                    <div className="text-xs min-w-0">
                      {confessor.socialStatus === 'متزوج' && (
                        <div className="min-w-0">
                          {confessor.spouseName && (
                            <div className="text-blue-600 dark:text-blue-400 truncate">
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
                  <td className="p-2 sm:p-3">
                    <div className="flex items-center gap-1 justify-center">
                      <button 
                        onClick={() => handleViewProfile(confessor.id!)}
                        className="p-1.5 sm:p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded-full touch-manipulation"
                        title="عرض الملف الشخصي"
                      >
                        <Icon name="search" className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(confessor)} 
                        className="p-1.5 sm:p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full touch-manipulation"
                        title="تعديل"
                      >
                        <Icon name="edit" className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button 
                        onClick={() => handleArchive(confessor)} 
                        className="p-1.5 sm:p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-full touch-manipulation"
                        title={confessor.isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}
                      >
                        <Icon name={confessor.isArchived ? 'unarchive' : 'archive'} className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md w-full min-w-0">
        {/* Header Controls */}
        <div className="flex flex-col gap-4 mb-6 w-full min-w-0">
          {/* Title and Main Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold">قائمة المعترفين</h3>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={handleAdd} 
                className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base touch-manipulation"
              >
                <Icon name="add" className="w-5 h-5" />
                إضافة معترف
              </button>
              
              <button 
                onClick={() => setShowArchived(!showArchived)} 
                className="flex items-center justify-center gap-2 bg-gray-500 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base touch-manipulation"
              >
                <Icon name={showArchived ? 'unarchive' : 'archive'} className="w-5 h-5" />
                {showArchived ? 'عرض النشطين' : 'عرض الأرشيف'}
              </button>
            </div>
          </div>

          {/* Search and Filters Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 w-full min-w-0">
            <div className="relative flex-1 min-w-0">
              <input 
                type="text" 
                placeholder="ابحث بالاسم أو اسم الزوج أو الأطفال..." 
                className="w-full p-3 pr-10 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base min-w-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Icon name="search" className="w-5 h-5 absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base touch-manipulation sm:hidden"
            >
              <Icon name="settings" className="w-5 h-5" />
              فلاتر
            </button>
          </div>

          {/* Filters - Always visible on desktop, toggleable on mobile */}
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block w-full min-w-0`}>
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg w-full min-w-0">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full min-w-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 w-full min-w-0">
                  {/* Sort Options */}
                  <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
                    <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">ترتيب:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="flex-1 sm:flex-none px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm min-w-0"
                    >
                      <option value="name">الاسم</option>
                      <option value="age">العمر</option>
                      <option value="church">الكنيسة</option>
                      <option value="recent">الأحدث</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 touch-manipulation flex-shrink-0"
                      title={sortOrder === 'asc' ? 'ترتيب تنازلي' : 'ترتيب تصاعدي'}
                    >
                      <Icon name={sortOrder === 'asc' ? 'arrowLeft' : 'arrowRight'} className="w-4 h-4 transform rotate-90" />
                    </button>
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg p-1 w-full sm:w-auto">
                  <button
                    onClick={() => handleViewModeChange('cards')}
                    className={`flex-1 sm:flex-none p-2 rounded-md transition-colors touch-manipulation ${
                      viewMode === 'cards' 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                    title="عرض البطاقات"
                  >
                    <Icon name="dashboard" className="w-5 h-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange('table')}
                    className={`flex-1 sm:flex-none p-2 rounded-md transition-colors touch-manipulation ${
                      viewMode === 'table' 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                    title="عرض الجدول"
                  >
                    <Icon name="reports" className="w-5 h-5 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 w-full">
          <div className="bg-blue-50 dark:bg-blue-900 p-3 sm:p-4 rounded-lg text-center">
            <Icon name="users" className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-200">{totalItems}</p>
            <p className="text-blue-600 dark:text-blue-300 text-xs sm:text-sm">{showArchived ? 'مؤرشف' : 'نشط'}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-3 sm:p-4 rounded-lg text-center">
            <Icon name="users" className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-green-500 mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-200">
              {filteredAndSortedConfessors.filter(c => c.gender === 'ذكر').length}
            </p>
            <p className="text-green-600 dark:text-green-300 text-xs sm:text-sm">ذكور</p>
          </div>
          <div className="bg-pink-50 dark:bg-pink-900 p-3 sm:p-4 rounded-lg text-center">
            <Icon name="users" className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-pink-500 mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-pink-700 dark:text-pink-200">
              {filteredAndSortedConfessors.filter(c => c.gender === 'أنثى').length}
            </p>
            <p className="text-pink-600 dark:text-pink-300 text-xs sm:text-sm">إناث</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-3 sm:p-4 rounded-lg text-center">
            <Icon name="users" className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-purple-500 mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-purple-700 dark:text-purple-200">
              {filteredAndSortedConfessors.filter(c => c.socialStatus === 'متزوج').length}
            </p>
            <p className="text-purple-600 dark:text-purple-300 text-xs sm:text-sm">متزوجون</p>
          </div>
        </div>

        {/* Content */}
        <div className="w-full min-w-0">
          {totalItems === 0 ? (
            <div className="text-center py-12">
              <Icon name="users" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                {showArchived ? 'لا توجد معترفين مؤرشفين' : 'لا توجد بيانات لعرضها'}
              </p>
              {!showArchived && (
                <button 
                  onClick={handleAdd}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors touch-manipulation"
                >
                  إضافة أول معترف
                </button>
              )}
            </div>
          ) : (
            <>
              {viewMode === 'cards' ? renderCardView() : renderTableView()}
              
              {/* Pagination */}
              <div className="mt-6 sm:mt-8 w-full">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={goToPage}
                  onItemsPerPageChange={setItemsPerPage}
                  className="border-t pt-6"
                />
              </div>
            </>
          )}
        </div>

        {showModal && (
          <ConfessorModal 
            confessor={editingConfessor} 
            allConfessors={confessors}
            onClose={() => setShowModal(false)} 
            userId={user?.uid} 
          />
        )}
      </div>
    </div>
  );
};