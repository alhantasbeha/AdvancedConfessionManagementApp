import { useState, useEffect } from 'react';
import { initDatabase, saveDatabase } from '../config/sqlite';
import { MessageTemplate } from '../types';

export const useSQLiteMessageTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const db = await initDatabase();
      const stmt = db.prepare('SELECT * FROM message_templates ORDER BY title');
      const results: MessageTemplate[] = [];
      
      while (stmt.step()) {
        const row = stmt.getAsObject();
        const template: MessageTemplate = {
          id: row.id?.toString(),
          title: row.title as string,
          body: row.body as string
        };
        results.push(template);
      }
      
      stmt.free();
      setTemplates(results);
      console.log(`تم تحميل ${results.length} قالب رسالة`);
    } catch (error) {
      console.error('Error loading message templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTemplate = async (templateData: Omit<MessageTemplate, 'id'>) => {
    try {
      const db = await initDatabase();
      const stmt = db.prepare(`
        INSERT INTO message_templates (title, body) 
        VALUES (?, ?)
      `);
      
      stmt.run([templateData.title, templateData.body]);
      stmt.free();
      
      saveDatabase();
      await loadTemplates();
      console.log('تم إضافة قالب رسالة جديد');
    } catch (error) {
      console.error('Error adding message template:', error);
      throw error;
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<MessageTemplate>) => {
    try {
      const db = await initDatabase();
      const setClause = Object.keys(templateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(templateData);
      
      const stmt = db.prepare(`UPDATE message_templates SET ${setClause} WHERE id = ?`);
      stmt.run([...values, id]);
      stmt.free();
      
      saveDatabase();
      await loadTemplates();
      console.log('تم تحديث قالب الرسالة');
    } catch (error) {
      console.error('Error updating message template:', error);
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const db = await initDatabase();
      const stmt = db.prepare('DELETE FROM message_templates WHERE id = ?');
      stmt.run([id]);
      stmt.free();
      
      saveDatabase();
      await loadTemplates();
      console.log('تم حذف قالب الرسالة');
    } catch (error) {
      console.error('Error deleting message template:', error);
      throw error;
    }
  };

  return {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    refreshTemplates: loadTemplates
  };
};