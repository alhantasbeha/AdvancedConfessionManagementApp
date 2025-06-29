import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { Settings } from '../types';

export const useSettings = (userId: string | undefined) => {
  const [settings, setSettings] = useState<Settings>({
    professions: [],
    services: [],
    personalTags: [],
    confessionTags: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const settingsDocRef = doc(db, `artifacts/${appId}/users/${userId}/settings`, 'customLists');
    
    const unsubscribe = onSnapshot(settingsDocRef, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as Settings);
      } else {
        // Initialize with default settings
        const defaultSettings: Settings = {
          professions: ['مهندس', 'طبيب', 'محاسب', 'صيدلي', 'محامي', 'مدرس', 'موظف', 'ربة منزل'],
          services: ['خدمة مدارس الأحد', 'خدمة شباب', 'كورال', 'خدمة اجتماعية'],
          personalTags: ['طالب', 'مغترب'],
          confessionTags: ['نمو روحي', 'مشاكل أسرية', 'مشاكل شخصية', 'ضعف عام']
        };
        setDoc(settingsDocRef, defaultSettings);
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching settings: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!userId) return;
    const settingsDocRef = doc(db, `artifacts/${appId}/users/${userId}/settings`, 'customLists');
    await updateDoc(settingsDocRef, newSettings);
  };

  return {
    settings,
    loading,
    updateSettings,
  };
};