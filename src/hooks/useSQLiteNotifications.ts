import { useState, useEffect } from 'react';
import { initDatabase } from '../config/sqlite';
import { Notification, Confessor, ConfessionLog } from '../types';

export const useSQLiteNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    // تحديث التنبيهات كل دقيقة
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const db = await initDatabase();
      const newNotifications: Notification[] = [];
      const today = new Date();
      const todayMonth = today.getMonth();
      const todayDay = today.getDate();

      // تحميل المعترفين
      const confessorsStmt = db.prepare('SELECT * FROM confessors WHERE isDeceased = 0 AND isArchived = 0');
      const confessors: Confessor[] = [];
      
      while (confessorsStmt.step()) {
        const row = confessorsStmt.getAsObject();
        confessors.push({
          id: row.id?.toString(),
          firstName: row.firstName as string,
          familyName: row.familyName as string,
          birthDate: row.birthDate as string,
          marriageDate: row.marriageDate as string,
          socialStatus: row.socialStatus as any,
          confessionStartDate: row.confessionStartDate as string,
          children: row.children ? JSON.parse(row.children as string) : []
        } as Confessor);
      }
      confessorsStmt.free();

      // تحميل سجلات الاعتراف
      const logsStmt = db.prepare('SELECT * FROM confession_logs');
      const logs: ConfessionLog[] = [];
      
      while (logsStmt.step()) {
        const row = logsStmt.getAsObject();
        logs.push({
          id: row.id?.toString(),
          confessorId: row.confessorId?.toString() || '',
          date: row.date as string
        } as ConfessionLog);
      }
      logsStmt.free();

      // تنبيهات أعياد الميلاد
      confessors.forEach(c => {
        if (c.birthDate) {
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

        // تنبيهات أعياد الميلاد للأطفال
        if (c.children && c.children.length > 0) {
          c.children.forEach((child: any, index: number) => {
            if (child.birthDate) {
              const childBirthDate = new Date(child.birthDate);
              if (childBirthDate.getMonth() === todayMonth && childBirthDate.getDate() === todayDay) {
                newNotifications.push({
                  id: `child-bday-${c.id}-${index}`,
                  type: 'birthday',
                  message: `اليوم هو عيد ميلاد ${child.name} (ابن/ة ${c.firstName} ${c.familyName}).`,
                  timestamp: new Date()
                });
              }
            }
          });
        }
      });
      
      // تنبيهات أعياد الزواج
      confessors.forEach(c => {
        if (c.marriageDate && c.socialStatus === 'متزوج') {
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

      // تنبيهات الاعترافات المتأخرة
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(today.getDate() - 60);

      confessors.forEach(c => {
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
      console.log(`تم تحميل ${newNotifications.length} تنبيه`);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    notifications, 
    loading,
    refreshNotifications: loadNotifications
  };
};