import { useState, useEffect } from 'react';
import { initDatabase, saveDatabase } from '../config/sqlite';
import { ConfessionLog } from '../types';

export const useSQLiteConfessionLogs = () => {
  const [logs, setLogs] = useState<ConfessionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const db = await initDatabase();
      const results = db.select('confession_logs');
      
      const logs: ConfessionLog[] = results.map((row: any) => ({
        id: row.id?.toString(),
        confessorId: row.confessorId?.toString() || '',
        date: row.date as string,
        notes: row.notes as string || '',
        tags: Array.isArray(row.tags) ? row.tags : (row.tags ? JSON.parse(row.tags) : [])
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setLogs(logs);
      console.log(`تم تحميل ${logs.length} سجل اعتراف`);
    } catch (error) {
      console.error('Error loading confession logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (logData: Omit<ConfessionLog, 'id'>) => {
    try {
      const db = await initDatabase();
      
      const newLogData = {
        confessorId: logData.confessorId,
        date: logData.date,
        notes: logData.notes || '',
        tags: logData.tags || []
      };
      
      db.insert('confession_logs', newLogData);
      await loadLogs();
      console.log('تم إضافة سجل اعتراف جديد');
    } catch (error) {
      console.error('Error adding confession log:', error);
      throw error;
    }
  };

  const updateLog = async (id: string, logData: Partial<ConfessionLog>) => {
    try {
      const db = await initDatabase();
      
      const updateData = { ...logData };
      if (updateData.tags && Array.isArray(updateData.tags)) {
        // Tags will be handled automatically by SimpleDB
      }
      
      db.update('confession_logs', id, updateData);
      await loadLogs();
      console.log('تم تحديث سجل الاعتراف');
    } catch (error) {
      console.error('Error updating confession log:', error);
      throw error;
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const db = await initDatabase();
      db.delete('confession_logs', id);
      await loadLogs();
      console.log('تم حذف سجل الاعتراف');
    } catch (error) {
      console.error('Error deleting confession log:', error);
      throw error;
    }
  };

  return {
    logs,
    loading,
    addLog,
    updateLog,
    deleteLog,
    refreshLogs: loadLogs
  };
};