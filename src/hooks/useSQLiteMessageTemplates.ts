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
      const results = db.select('message_templates');
      
      const templates: MessageTemplate[] = results.map((row: any) => ({
        id: row.id?.toString(),
        title: row.title as string,
        body: row.body as string
      })).sort((a, b) => a.title.localeCompare(b.title));
      
      setTemplates(templates);
      console.log(`تم تحميل ${templates.length} قالب رسالة`);
    } catch (error) {
      console.error('Error loading message templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTemplate = async (templateData: Omit<MessageTemplate, 'id'>) => {
    try {
      const db = await initDatabase();
      db.insert('message_templates', templateData);
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
      db.update('message_templates', id, templateData);
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
      db.delete('message_templates', id);
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