import initSqlJs from 'sql.js';

let SQL: any = null;
let db: any = null;

export const initDatabase = async () => {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });
  }

  if (!db) {
    // محاولة تحميل قاعدة البيانات من localStorage
    const savedDb = localStorage.getItem('confessionApp_db');
    if (savedDb) {
      try {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        db = new SQL.Database(uint8Array);
        console.log('تم تحميل قاعدة البيانات من التخزين المحلي');
      } catch (error) {
        console.error('خطأ في تحميل قاعدة البيانات المحفوظة:', error);
        db = new SQL.Database();
        await createTables();
      }
    } else {
      db = new SQL.Database();
      await createTables();
      console.log('تم إنشاء قاعدة بيانات جديدة');
    }
  }

  return db;
};

const createTables = async () => {
  console.log('إنشاء الجداول...');
  
  // جدول المعترفين
  db.exec(`
    CREATE TABLE IF NOT EXISTS confessors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      fatherName TEXT NOT NULL,
      grandFatherName TEXT,
      familyName TEXT NOT NULL,
      phone1 TEXT NOT NULL,
      phone1Whatsapp BOOLEAN DEFAULT 1,
      phone2 TEXT,
      phone2Whatsapp BOOLEAN DEFAULT 0,
      gender TEXT CHECK(gender IN ('ذكر', 'أنثى')) NOT NULL,
      birthDate TEXT NOT NULL,
      socialStatus TEXT CHECK(socialStatus IN ('أعزب', 'متزوج', 'أرمل', 'مطلق')) NOT NULL,
      marriageDate TEXT,
      church TEXT NOT NULL,
      confessionStartDate TEXT,
      profession TEXT,
      services TEXT, -- JSON array
      personalTags TEXT, -- JSON array
      isDeacon BOOLEAN DEFAULT 0,
      isDeceased BOOLEAN DEFAULT 0,
      notes TEXT,
      spouseName TEXT,
      spousePhone TEXT,
      children TEXT, -- JSON array
      isArchived BOOLEAN DEFAULT 0,
      profileImage TEXT,
      customFields TEXT, -- JSON object
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // جدول سجل الاعترافات
  db.exec(`
    CREATE TABLE IF NOT EXISTS confession_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      confessorId INTEGER NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      tags TEXT, -- JSON array
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (confessorId) REFERENCES confessors(id)
    )
  `);

  // جدول قوالب الرسائل
  db.exec(`
    CREATE TABLE IF NOT EXISTS message_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // جدول الإعدادات
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // إدراج الإعدادات الافتراضية
  const defaultSettings = {
    professions: ['مهندس', 'طبيب', 'محاسب', 'صيدلي', 'محامي', 'مدرس', 'موظف', 'ربة منزل', 'طالب', 'متقاعد'],
    services: ['خدمة مدارس الأحد', 'خدمة شباب', 'كورال', 'خدمة اجتماعية', 'خدمة الشمامسة', 'خدمة الكشافة'],
    personalTags: ['طالب', 'مغترب', 'جديد', 'نشط', 'يحتاج متابعة'],
    confessionTags: ['نمو روحي', 'مشاكل أسرية', 'مشاكل شخصية', 'ضعف عام', 'توبة', 'إرشاد']
  };

  Object.entries(defaultSettings).forEach(([key, value]) => {
    db.exec(`
      INSERT OR IGNORE INTO settings (key, value) 
      VALUES ('${key}', '${JSON.stringify(value)}')
    `);
  });

  // إدراج بيانات تجريبية
  insertSampleData();
  
  saveDatabase();
  console.log('تم إنشاء الجداول وإدراج البيانات الافتراضية');
};

const insertSampleData = () => {
  // إدراج معترفين تجريبيين
  const sampleConfessors = [
    {
      firstName: 'أحمد',
      fatherName: 'محمد',
      familyName: 'علي',
      phone1: '01234567890',
      phone1Whatsapp: 1,
      gender: 'ذكر',
      birthDate: '1990-05-15',
      socialStatus: 'متزوج',
      marriageDate: '2015-08-20',
      church: 'كنيسة العذراء مريم',
      profession: 'مهندس',
      services: '["خدمة شباب"]',
      personalTags: '["نشط"]',
      spouseName: 'فاطمة أحمد',
      spousePhone: '01234567891',
      children: '[{"name": "محمد أحمد", "birthDate": "2016-03-10", "phone": ""}]'
    },
    {
      firstName: 'مريم',
      fatherName: 'يوسف',
      familyName: 'جرجس',
      phone1: '01234567892',
      phone1Whatsapp: 1,
      gender: 'أنثى',
      birthDate: '1995-12-25',
      socialStatus: 'أعزب',
      church: 'كنيسة مار جرجس',
      profession: 'طبيب',
      services: '["خدمة مدارس الأحد"]',
      personalTags: '["طالب", "نشط"]'
    }
  ];

  sampleConfessors.forEach(confessor => {
    db.exec(`
      INSERT INTO confessors (
        firstName, fatherName, familyName, phone1, phone1Whatsapp,
        gender, birthDate, socialStatus, marriageDate, church,
        profession, services, personalTags, spouseName, spousePhone, children
      ) VALUES (
        '${confessor.firstName}', '${confessor.fatherName}', '${confessor.familyName}',
        '${confessor.phone1}', ${confessor.phone1Whatsapp}, '${confessor.gender}',
        '${confessor.birthDate}', '${confessor.socialStatus}', 
        ${confessor.marriageDate ? `'${confessor.marriageDate}'` : 'NULL'},
        '${confessor.church}', '${confessor.profession}', '${confessor.services}',
        '${confessor.personalTags}', 
        ${confessor.spouseName ? `'${confessor.spouseName}'` : 'NULL'},
        ${confessor.spousePhone ? `'${confessor.spousePhone}'` : 'NULL'},
        ${confessor.children ? `'${confessor.children}'` : 'NULL'}
      )
    `);
  });

  // إدراج قوالب رسائل تجريبية
  const sampleTemplates = [
    {
      title: 'تهنئة عيد ميلاد بسيطة',
      body: 'كل عام وأنت بخير يا {الاسم_الأول}! أسأل الله أن يبارك في عمرك ويحفظك من كل شر. عيد ميلاد سعيد! 🎉'
    },
    {
      title: 'تهنئة عيد زواج',
      body: 'بارك الله لكما يا {اسم_الزوج} و {اسم_الزوجة} بمناسبة ذكرى زواجكما، وأدام عليكما المحبة والوئام. كل عام وأنتما بخير! 💕'
    }
  ];

  sampleTemplates.forEach(template => {
    db.exec(`
      INSERT INTO message_templates (title, body) 
      VALUES ('${template.title}', '${template.body}')
    `);
  });

  // إدراج سجلات اعتراف تجريبية
  db.exec(`
    INSERT INTO confession_logs (confessorId, date, notes, tags) 
    VALUES 
    (1, '2024-01-15', 'جلسة اعتراف جيدة، نمو روحي ملحوظ', '["نمو روحي"]'),
    (2, '2024-01-20', 'مناقشة حول الحياة الروحية', '["إرشاد"]')
  `);
};

export const saveDatabase = () => {
  if (db) {
    try {
      const data = db.export();
      localStorage.setItem('confessionApp_db', JSON.stringify(Array.from(data)));
      console.log('تم حفظ قاعدة البيانات في التخزين المحلي');
    } catch (error) {
      console.error('خطأ في حفظ قاعدة البيانات:', error);
    }
  }
};

export const exportDatabase = () => {
  if (db) {
    const data = db.export();
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confession_app_backup_${new Date().toISOString().split('T')[0]}.db`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('تم تصدير قاعدة البيانات');
  }
};

export const importDatabase = async (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        if (!SQL) {
          await initDatabase();
        }
        
        db = new SQL.Database(uint8Array);
        saveDatabase();
        console.log('تم استيراد قاعدة البيانات بنجاح');
        resolve(true);
      } catch (error) {
        console.error('خطأ في استيراد قاعدة البيانات:', error);
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const clearDatabase = async () => {
  if (confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!')) {
    localStorage.removeItem('confessionApp_db');
    db = null;
    await initDatabase();
    console.log('تم مسح قاعدة البيانات وإعادة إنشائها');
    return true;
  }
  return false;
};

export { db };