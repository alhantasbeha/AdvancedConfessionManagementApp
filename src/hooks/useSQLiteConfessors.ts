import { useState, useEffect } from 'react';
import { initDatabase, saveDatabase } from '../config/sqlite';
import { Confessor } from '../types';

export const useSQLiteConfessors = () => {
  const [confessors, setConfessors] = useState<Confessor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfessors();
  }, []);

  const loadConfessors = async () => {
    try {
      setLoading(true);
      const db = await initDatabase();
      const results = db.select('confessors');
      
      const confessors: Confessor[] = results.map((row: any) => ({
        id: row.id?.toString(),
        firstName: row.firstName as string,
        fatherName: row.fatherName as string,
        grandFatherName: row.grandFatherName as string || '',
        familyName: row.familyName as string,
        phone1: row.phone1 as string,
        phone1Whatsapp: Boolean(row.phone1Whatsapp),
        phone2: row.phone2 as string || '',
        phone2Whatsapp: Boolean(row.phone2Whatsapp),
        gender: row.gender as 'ذكر' | 'أنثى',
        birthDate: row.birthDate as string,
        socialStatus: row.socialStatus as any,
        marriageDate: row.marriageDate as string || '',
        church: row.church as string,
        confessionStartDate: row.confessionStartDate as string || '',
        profession: row.profession as string || '',
        services: Array.isArray(row.services) ? row.services : (row.services ? JSON.parse(row.services) : []),
        personalTags: Array.isArray(row.personalTags) ? row.personalTags : (row.personalTags ? JSON.parse(row.personalTags) : []),
        isDeacon: Boolean(row.isDeacon),
        isDeceased: Boolean(row.isDeceased),
        notes: row.notes as string || '',
        spouseName: row.spouseName as string || '',
        spousePhone: row.spousePhone as string || '',
        children: Array.isArray(row.children) ? row.children : (row.children ? JSON.parse(row.children) : []),
        isArchived: Boolean(row.isArchived),
        profileImage: row.profileImage as string || '',
        customFields: typeof row.customFields === 'object' ? row.customFields : (row.customFields ? JSON.parse(row.customFields) : {})
      })).sort((a, b) => `${a.firstName} ${a.familyName}`.localeCompare(`${b.firstName} ${b.familyName}`));
      
      setConfessors(confessors);
      console.log(`تم تحميل ${confessors.length} معترف`);
    } catch (error) {
      console.error('Error loading confessors:', error);
    } finally {
      setLoading(false);
    }
  };

  const addConfessor = async (confessorData: Omit<Confessor, 'id'>) => {
    try {
      const db = await initDatabase();
      
      const newConfessorData = {
        ...confessorData,
        grandFatherName: confessorData.grandFatherName || '',
        phone2: confessorData.phone2 || '',
        marriageDate: confessorData.marriageDate || '',
        confessionStartDate: confessorData.confessionStartDate || '',
        profession: confessorData.profession || '',
        services: confessorData.services || [],
        personalTags: confessorData.personalTags || [],
        notes: confessorData.notes || '',
        spouseName: confessorData.spouseName || '',
        spousePhone: confessorData.spousePhone || '',
        children: confessorData.children || [],
        profileImage: confessorData.profileImage || '',
        customFields: confessorData.customFields || {}
      };
      
      db.insert('confessors', newConfessorData);
      await loadConfessors();
      console.log('تم إضافة معترف جديد');
    } catch (error) {
      console.error('Error adding confessor:', error);
      throw error;
    }
  };

  const updateConfessor = async (id: string, updates: Partial<Confessor>) => {
    try {
      const db = await initDatabase();
      db.update('confessors', id, updates);
      await loadConfessors();
      console.log('تم تحديث بيانات المعترف');
    } catch (error) {
      console.error('Error updating confessor:', error);
      throw error;
    }
  };

  const deleteConfessor = async (id: string) => {
    try {
      const db = await initDatabase();
      
      // حذف سجلات الاعتراف المرتبطة أولاً
      const logs = db.select('confession_logs', { confessorId: id });
      logs.forEach((log: any) => {
        db.delete('confession_logs', log.id);
      });
      
      // حذف المعترف
      db.delete('confessors', id);
      await loadConfessors();
      console.log('تم حذف المعترف وسجلات الاعتراف المرتبطة');
    } catch (error) {
      console.error('Error deleting confessor:', error);
      throw error;
    }
  };

  return {
    confessors,
    loading,
    addConfessor,
    updateConfessor,
    deleteConfessor,
    refreshConfessors: loadConfessors
  };
};