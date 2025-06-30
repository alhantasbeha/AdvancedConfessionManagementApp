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
      const db = await initDatabase();
      const stmt = db.prepare('SELECT * FROM confessors ORDER BY firstName, familyName');
      const results = [];
      
      while (stmt.step()) {
        const row = stmt.getAsObject();
        const confessor: Confessor = {
          id: row.id?.toString(),
          firstName: row.firstName as string,
          fatherName: row.fatherName as string,
          grandFatherName: row.grandFatherName as string,
          familyName: row.familyName as string,
          phone1: row.phone1 as string,
          phone1Whatsapp: Boolean(row.phone1Whatsapp),
          phone2: row.phone2 as string,
          phone2Whatsapp: Boolean(row.phone2Whatsapp),
          gender: row.gender as 'ذكر' | 'أنثى',
          birthDate: row.birthDate as string,
          socialStatus: row.socialStatus as any,
          marriageDate: row.marriageDate as string,
          church: row.church as string,
          confessionStartDate: row.confessionStartDate as string,
          profession: row.profession as string,
          services: row.services ? JSON.parse(row.services as string) : [],
          personalTags: row.personalTags ? JSON.parse(row.personalTags as string) : [],
          isDeacon: Boolean(row.isDeacon),
          isDeceased: Boolean(row.isDeceased),
          notes: row.notes as string,
          spouseName: row.spouseName as string,
          spousePhone: row.spousePhone as string,
          children: row.children ? JSON.parse(row.children as string) : [],
          isArchived: Boolean(row.isArchived),
          profileImage: row.profileImage as string,
          customFields: row.customFields ? JSON.parse(row.customFields as string) : {}
        };
        results.push(confessor);
      }
      
      stmt.free();
      setConfessors(results);
    } catch (error) {
      console.error('Error loading confessors:', error);
    } finally {
      setLoading(false);
    }
  };

  const addConfessor = async (confessorData: Omit<Confessor, 'id'>) => {
    try {
      const db = await initDatabase();
      const stmt = db.prepare(`
        INSERT INTO confessors (
          firstName, fatherName, grandFatherName, familyName,
          phone1, phone1Whatsapp, phone2, phone2Whatsapp,
          gender, birthDate, socialStatus, marriageDate,
          church, confessionStartDate, profession,
          services, personalTags, isDeacon, isDeceased,
          notes, spouseName, spousePhone, children,
          isArchived, profileImage, customFields
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        confessorData.firstName,
        confessorData.fatherName,
        confessorData.grandFatherName || null,
        confessorData.familyName,
        confessorData.phone1,
        confessorData.phone1Whatsapp ? 1 : 0,
        confessorData.phone2 || null,
        confessorData.phone2Whatsapp ? 1 : 0,
        confessorData.gender,
        confessorData.birthDate,
        confessorData.socialStatus,
        confessorData.marriageDate || null,
        confessorData.church,
        confessorData.confessionStartDate || null,
        confessorData.profession || null,
        JSON.stringify(confessorData.services || []),
        JSON.stringify(confessorData.personalTags || []),
        confessorData.isDeacon ? 1 : 0,
        confessorData.isDeceased ? 1 : 0,
        confessorData.notes || null,
        confessorData.spouseName || null,
        confessorData.spousePhone || null,
        JSON.stringify(confessorData.children || []),
        confessorData.isArchived ? 1 : 0,
        confessorData.profileImage || null,
        JSON.stringify(confessorData.customFields || {})
      ]);
      
      stmt.free();
      saveDatabase();
      await loadConfessors();
    } catch (error) {
      console.error('Error adding confessor:', error);
      throw error;
    }
  };

  const updateConfessor = async (id: string, updates: Partial<Confessor>) => {
    try {
      const db = await initDatabase();
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates).map(value => {
        if (typeof value === 'boolean') return value ? 1 : 0;
        if (Array.isArray(value) || typeof value === 'object') return JSON.stringify(value);
        return value;
      });
      
      const stmt = db.prepare(`UPDATE confessors SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`);
      stmt.run([...values, id]);
      stmt.free();
      
      saveDatabase();
      await loadConfessors();
    } catch (error) {
      console.error('Error updating confessor:', error);
      throw error;
    }
  };

  const deleteConfessor = async (id: string) => {
    try {
      const db = await initDatabase();
      const stmt = db.prepare('DELETE FROM confessors WHERE id = ?');
      stmt.run([id]);
      stmt.free();
      
      saveDatabase();
      await loadConfessors();
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