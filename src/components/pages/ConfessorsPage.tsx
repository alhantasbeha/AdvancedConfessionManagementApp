import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useConfessors } from '../../hooks/useConfessors';
import { Icon } from '../ui/Icon';
import { ConfessorModal } from '../modals/ConfessorModal';
import { Confessor } from '../../types';

export const ConfessorsPage: React.FC = () => {
  const { user } = useAppContext();
  const { confessors, loading, updateConfessor } = useConfessors(user?.uid);
  const [filteredConfessors, setFilteredConfessors] = useState<Confessor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingConfessor, setEditingConfessor] = useState<Confessor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);

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
       c.familyName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="relative w-full md:w-1/3">
          <input 
            type="text" 
            placeholder="ابحث بالاسم..." 
            className="w-full p-2 pr-10 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Icon name="search" className="w-5 h-5 absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-2">
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

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="p-3">الاسم بالكامل</th>
              <th className="p-3">العمر</th>
              <th className="p-3">رقم الهاتف</th>
              <th className="p-3">الكنيسة</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredConfessors.map(confessor => (
              <tr key={confessor.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3 font-semibold">
                  {`${confessor.firstName || ''} ${confessor.fatherName || ''} ${confessor.familyName || ''}`}
                </td>
                <td className="p-3">{calculateAge(confessor.birthDate)}</td>
                <td className="p-3">{confessor.phone1}</td>
                <td className="p-3">{confessor.church}</td>
                <td className="p-3 flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(confessor)} 
                    className="p-2 text-blue-500 hover:bg-blue-100 rounded-full"
                  >
                    <Icon name="edit" />
                  </button>
                  <button 
                    onClick={() => handleArchive(confessor)} 
                    className="p-2 text-yellow-500 hover:bg-yellow-100 rounded-full"
                  >
                    <Icon name={confessor.isArchived ? 'unarchive' : 'archive'} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredConfessors.length === 0 && (
          <p className="text-center p-4">لا توجد بيانات لعرضها.</p>
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
  );
};