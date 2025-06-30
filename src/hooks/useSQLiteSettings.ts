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
      const db = await initDatabase();
      const stmt = db.prepare('SELECT key, value FROM settings');
      const results: Settings = {
        professions: [],
        services: [],
        personalTags: [],
        confessionTags: []
      };
      
      while (stmt.step()) {
        const row = stmt.getAsObject();
        const key = row.key as keyof Settings;
        const value = JSON.parse(row.value as string);
        if (key in results) {
          (results as any)[key] = value;
        }
      }
      
      stmt.free();
      setSettings(results);
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
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO settings (key, value, updatedAt) 
          VALUES (?, ?, CURRENT_TIMESTAMP)
        `);
        stmt.run([key, JSON.stringify(value)]);
        stmt.free();
      }
      
      saveDatabase();
      await loadSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return {
    settings,
    loading,
    updateSettings
  };
};