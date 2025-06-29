import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { Confessor } from '../types';

export const useConfessors = (userId: string | undefined) => {
  const [confessors, setConfessors] = useState<Confessor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, `artifacts/${appId}/users/${userId}/confessors`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const confessorsData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Confessor));
      setConfessors(confessorsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching confessors: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const addConfessor = async (confessorData: Omit<Confessor, 'id'>) => {
    if (!userId) return;
    const collectionRef = collection(db, `artifacts/${appId}/users/${userId}/confessors`);
    await addDoc(collectionRef, confessorData);
  };

  const updateConfessor = async (id: string, confessorData: Partial<Confessor>) => {
    if (!userId) return;
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/confessors`, id);
    await updateDoc(docRef, confessorData);
  };

  const deleteConfessor = async (id: string) => {
    if (!userId) return;
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/confessors`, id);
    await deleteDoc(docRef);
  };

  return {
    confessors,
    loading,
    addConfessor,
    updateConfessor,
    deleteConfessor,
  };
};