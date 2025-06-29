import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { Notification, Confessor, ConfessionLog } from '../types';

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const confCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/confessors`);
    
    const unsubscribe = onSnapshot(confCollectionRef, async (confSnapshot) => {
      try {
        const confessors: Confessor[] = confSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Confessor));
        
        const logCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/confessionLogs`);
        const logSnapshot = await getDocs(logCollectionRef);
        const logs: ConfessionLog[] = logSnapshot.docs.map(doc => doc.data() as ConfessionLog);

        let newNotifications: Notification[] = [];
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDay = today.getDate();

        // Birthday Notifications
        confessors.forEach(c => {
          if (c.birthDate && !c.isDeceased && !c.isArchived) {
            const birthDate = new Date(c.birthDate);
            if (birthDate.getMonth() === todayMonth && birthDate.getDate() === todayDay) {
              newNotifications.push({
                id: `bday-${c.id}`,
                type: 'birthday',
                message: `اليوم هو عيد ميلاد ${c.firstName} ${c.familyName}.`,
                timestamp: new Date()
              });
            }
          }
        });
        
        // Anniversary Notifications
        confessors.forEach(c => {
          if (c.marriageDate && c.socialStatus === 'متزوج' && !c.isDeceased && !c.isArchived) {
            const marriageDate = new Date(c.marriageDate);
            if (marriageDate.getMonth() === todayMonth && marriageDate.getDate() === todayDay) {
              newNotifications.push({
                id: `anniv-${c.id}`,
                type: 'anniversary',
                message: `اليوم هو عيد زواج ${c.firstName} ${c.familyName}.`,
                timestamp: new Date()
              });
            }
          }
        });

        // Overdue Confession Notifications
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(today.getDate() - 60);

        confessors.filter(c => !c.isDeceased && !c.isArchived).forEach(c => {
          const lastConfession = logs
            .filter(log => log.confessorId === c.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

          if (!lastConfession) {
            const startDate = c.confessionStartDate ? new Date(c.confessionStartDate) : null;
            if (startDate && startDate < sixtyDaysAgo) {
              newNotifications.push({
                id: `overdue-never-${c.id}`,
                type: 'overdue',
                message: `${c.firstName} ${c.familyName} لم يسجل له اعتراف منذ بدء الخدمة.`,
                timestamp: new Date()
              });
            }
          } else {
            const lastConfessionDate = new Date(lastConfession.date);
            if (lastConfessionDate < sixtyDaysAgo) {
              newNotifications.push({
                id: `overdue-${c.id}`,
                type: 'overdue',
                message: `مر أكثر من 60 يومًا على آخر اعتراف لـ${c.firstName} ${c.familyName}.`,
                timestamp: new Date()
              });
            }
          }
        });
        
        newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setNotifications(newNotifications);
        setLoading(false);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return { notifications, loading };
};