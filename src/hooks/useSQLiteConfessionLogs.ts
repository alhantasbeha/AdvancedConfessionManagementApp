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
      const stmt = db.prepare('SELECT * FROM confession_logs ORDER BY date DESC');
      const results: ConfessionLog[] = [];
      
      while (stmt.step()) {
        const row = stmt.getAsObject();
        const log: ConfessionLog = {
          id: row.id?.toString(),
          confessorId: row.confessorId?.toString() || '',
          date: row.date as string,
          notes: row.notes as string,
          tags: row.tags ? JSON.parse(row.tags as string) : []
        };
        results.push(log);
      }
      
      stmt.free();
      setLogs(results);
      console.log(`تم تحميل ${results.length} سجل اعتراف`);
    } catch (error) {
      console.error('Error loading confession logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (logData: Omit<ConfessionLog, 'id'>) => {
    try {
      const db = await initDatabase();
      const stmt = db.prepare(`
        INSERT INTO confession_logs (confessorId, date, notes, tags) 
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run([
        logData.confessorId,
        logData.date,
        logData.notes || null,
        JSON.stringify(logData.tags || [])
      ]);
      
      stmt.free();
      saveDatabase();
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
      
      const processedUpdates: any = {};
      Object.entries(logData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          processedUpdates[key] = JSON.stringify(value);
        } else {
          processedUpdates[key] = value;
        }
      });
      
      const setClause = Object.keys(processedUpdates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(processedUpdates);
      
      const stmt = db.prepare(`UPDATE confession_logs SET ${setClause} WHERE id = ?`);
      stmt.run([...values, id]);
      stmt.free();
      
      saveDatabase();
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
      const stmt = db.prepare('DELETE FROM confession_logs WHERE id = ?');
      stmt.run([id]);
      stmt.free();
      
      saveDatabase();
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