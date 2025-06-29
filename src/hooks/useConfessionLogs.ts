import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { ConfessionLog } from '../types';

export const useConfessionLogs = (userId: string | undefined) => {
  const [logs, setLogs] = useState<ConfessionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `artifacts/${appId}/users/${userId}/confessionLogs`),
      orderBy('date', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as ConfessionLog));
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching confession logs: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const addLog = async (logData: Omit<ConfessionLog, 'id'>) => {
    if (!userId) return;
    const collectionRef = collection(db, `artifacts/${appId}/users/${userId}/confessionLogs`);
    await addDoc(collectionRef, logData);
  };

  const updateLog = async (id: string, logData: Partial<ConfessionLog>) => {
    if (!userId) return;
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/confessionLogs`, id);
    await updateDoc(docRef, logData);
  };

  const deleteLog = async (id: string) => {
    if (!userId) return;
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/confessionLogs`, id);
    await deleteDoc(docRef);
  };

  return {
    logs,
    loading,
    addLog,
    updateLog,
    deleteLog,
  };
};