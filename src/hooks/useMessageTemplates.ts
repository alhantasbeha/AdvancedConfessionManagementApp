import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { MessageTemplate } from '../types';

export const useMessageTemplates = (userId: string | undefined) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, `artifacts/${appId}/users/${userId}/messageTemplates`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const templatesData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as MessageTemplate));
      setTemplates(templatesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching message templates: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const addTemplate = async (templateData: Omit<MessageTemplate, 'id'>) => {
    if (!userId) return;
    const collectionRef = collection(db, `artifacts/${appId}/users/${userId}/messageTemplates`);
    await addDoc(collectionRef, templateData);
  };

  const updateTemplate = async (id: string, templateData: Partial<MessageTemplate>) => {
    if (!userId) return;
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/messageTemplates`, id);
    await updateDoc(docRef, templateData);
  };

  const deleteTemplate = async (id: string) => {
    if (!userId) return;
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/messageTemplates`, id);
    await deleteDoc(docRef);
  };

  return {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
};