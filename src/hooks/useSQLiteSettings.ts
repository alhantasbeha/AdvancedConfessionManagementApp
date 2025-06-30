import { useState, useEffect } from 'react';
import { initDatabase, saveDatabase } from '../config/sqlite';
import { Settings } from '../types';

export const useSQLiteSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    professions: [],
    services: [],
    personalTags: [],
    confessionTags: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const db = await initDatabase();
      
      const results: Settings = {
        professions: db.getSetting('professions') || [],
        services: db.getSetting('services') || [],
        personalTags: db.getSetting('personalTags') || [],
        confessionTags: db.getSetting('confessionTags') || []
      };
      
      setSettings(results);
      console.log('تم تحميل الإعدادات');
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const db = await initDatabase();
      
      for (const [key, value] of Object.entries(newSettings)) {
        db.setSetting(key, value);
      }
      
      await loadSettings();
      console.log('تم تحديث الإعدادات');
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings: loadSettings
  };
};